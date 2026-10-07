// Background service worker for QuickLink Copier.
// Handles context menus, clipboard operations and - as the single writer -
// the link history and statistics.

const DEFAULT_SETTINGS = { maxHistorySize: 10, autoTags: true, showNotifications: true };

// ---- Localization ----

// The UI language is picked in the popup (localStorage there) and mirrored to
// chrome.storage.local.ui_language, because a service worker has no localStorage.
const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'zh', 'hi'];
const MESSAGES = {
  en: {
    menuCopyPage: 'Copy page URL',
    menuCopyLink: 'Copy this link',
    copyFailedTitle: 'Copy Failed',
    copyFailedMessage: 'Unable to copy this link to the clipboard.',
    copiedTitle: 'Link copied!',
    copiedMessage: 'Copied: {title}'
  },
  ru: {
    menuCopyPage: 'Копировать URL страницы',
    menuCopyLink: 'Копировать эту ссылку',
    copyFailedTitle: 'Ошибка копирования',
    copyFailedMessage: 'Не удалось скопировать ссылку в буфер обмена.',
    copiedTitle: 'Ссылка скопирована!',
    copiedMessage: 'Скопировано: {title}'
  },
  es: {
    menuCopyPage: 'Copiar URL de la página',
    menuCopyLink: 'Copiar este enlace',
    copyFailedTitle: 'Error al copiar',
    copyFailedMessage: 'No se pudo copiar este enlace al portapapeles.',
    copiedTitle: '¡Enlace copiado!',
    copiedMessage: 'Copiado: {title}'
  },
  zh: {
    menuCopyPage: '复制页面 URL',
    menuCopyLink: '复制此链接',
    copyFailedTitle: '复制失败',
    copyFailedMessage: '无法将此链接复制到剪贴板。',
    copiedTitle: '链接已复制！',
    copiedMessage: '已复制：{title}'
  },
  hi: {
    menuCopyPage: 'पेज का URL कॉपी करें',
    menuCopyLink: 'यह लिंक कॉपी करें',
    copyFailedTitle: 'कॉपी नहीं हो सका',
    copyFailedMessage: 'यह लिंक क्लिपबोर्ड पर कॉपी नहीं हो सका।',
    copiedTitle: 'लिंक कॉपी हो गया!',
    copiedMessage: 'कॉपी किया गया: {title}'
  }
};

function normalizeLanguage(lang) {
  const base = String(lang || '').toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
}

async function getLanguage() {
  try {
    const { ui_language: saved } = await chrome.storage.local.get('ui_language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch (_) { /* fall back to the browser language */ }
  try {
    return normalizeLanguage(chrome.i18n.getUILanguage());
  } catch (_) {
    return 'en';
  }
}

async function msg(key, vars = {}) {
  const lang = await getLanguage();
  const text = (MESSAGES[lang] && MESSAGES[lang][key]) || MESSAGES.en[key] || key;
  return text.replace(/\{(\w+)\}/g, (m, name) => (name in vars ? String(vars[name]) : m));
}

async function buildContextMenus() {
  // removeAll first avoids "duplicate id" errors on update/reload/language change.
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({ id: 'copy-current-url', title: await msg('menuCopyPage'), contexts: ['page'] });
  chrome.contextMenus.create({ id: 'copy-link-url', title: await msg('menuCopyLink'), contexts: ['link'] });
}

let menuBuild = Promise.resolve();
function rebuildContextMenus() {
  menuBuild = menuBuild.then(buildContextMenus, buildContextMenus).catch((error) => {
    console.error('Error building context menus:', error);
  });
  return menuBuild;
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.ui_language) rebuildContextMenus();
});

// ---- Storage helpers ----

// All read-modify-write operations on history/stats/settings go through this
// queue so concurrent copies (context menu + popup + content script) cannot
// overwrite each other with stale data.
let writeQueue = Promise.resolve();
function serialized(task) {
  const run = writeQueue.then(task, task);
  writeQueue = run.catch(() => {});
  return run;
}

function normalizedMaxSize(settings) {
  const n = Number.parseInt(settings && settings.maxHistorySize, 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_SETTINGS.maxHistorySize;
}

function saveToHistory(linkData) {
  return serialized(async () => {
    const data = await chrome.storage.local.get(['linkHistory', 'settings', 'stats']);
    const history = Array.isArray(data.linkHistory) ? data.linkHistory : [];
    history.unshift(linkData);
    const trimmed = history.slice(0, normalizedMaxSize(data.settings));

    const today = new Date().toDateString();
    const stats = { totalCopied: 0, dailyCopied: 0, lastResetDate: today, ...data.stats };
    if (stats.lastResetDate !== today) {
      stats.dailyCopied = 0;
      stats.lastResetDate = today;
    }
    stats.totalCopied++;
    stats.dailyCopied++;

    await chrome.storage.local.set({ linkHistory: trimmed, stats });
  });
}

function clearHistory() {
  return serialized(() => chrome.storage.local.set({
    linkHistory: [],
    stats: { totalCopied: 0, dailyCopied: 0, lastResetDate: new Date().toDateString() }
  }));
}

function updateSettings(settings) {
  return serialized(() => chrome.storage.local.set({ settings }));
}

// ---- Install ----

chrome.runtime.onInstalled.addListener(async () => {
  await rebuildContextMenus();

  const existing = await chrome.storage.local.get(['linkHistory', 'settings', 'stats']);
  const defaults = {};
  if (!existing.linkHistory) defaults.linkHistory = [];
  if (!existing.settings) defaults.settings = DEFAULT_SETTINGS;
  if (!existing.stats) {
    defaults.stats = { totalCopied: 0, dailyCopied: 0, lastResetDate: new Date().toDateString() };
  }
  if (Object.keys(defaults).length) await chrome.storage.local.set(defaults);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === 'copy-current-url') {
      await copyUrl({ url: tab.url, title: tab.title, tab });
    } else if (info.menuItemId === 'copy-link-url') {
      await copyUrl({ url: info.linkUrl, title: info.linkText || info.linkUrl, tab });
    }
  } catch (error) {
    console.error('Error handling context menu click:', error);
  }
});

// ---- Clipboard ----

// Runs inside the page. Must be self-contained (it is serialised).
function copyInPage(text) {
  return navigator.clipboard.writeText(text).then(() => true, () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { /* ok stays false */ }
    ta.remove();
    return ok;
  });
}

async function copyViaPage(tabId, text) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: copyInPage,
      args: [text]
    });
    return !!(result && result.result);
  } catch (_) {
    return false; // restricted page (chrome://, Web Store, PDF viewer, ...)
  }
}

async function copyViaOffscreen(text) {
  if (!chrome.offscreen) return false;
  try {
    const existing = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
    if (!existing.length) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['CLIPBOARD'],
        justification: 'Write copied links to the clipboard'
      });
    }
    const res = await chrome.runtime.sendMessage({ target: 'offscreen', action: 'copy', text });
    return !!(res && res.ok);
  } catch (error) {
    console.warn('Offscreen copy failed:', error);
    return false;
  } finally {
    try { await chrome.offscreen.closeDocument(); } catch (_) { /* already closed */ }
  }
}

async function copyToClipboard(tab, text) {
  if (tab && tab.id != null && await copyViaPage(tab.id, text)) return true;
  return copyViaOffscreen(text);
}

async function copyUrl({ url, title, tab }) {
  let domain = '';
  try { domain = new URL(url).hostname; } catch (_) { /* keep empty */ }

  const ok = await copyToClipboard(tab, url);
  if (!ok) {
    await showNotification(await msg('copyFailedTitle'), await msg('copyFailedMessage'));
    return false;
  }

  await saveToHistory({
    url,
    title: title || url,
    domain,
    favicon: tab && tab.favIconUrl,
    timestamp: Date.now(),
    tags: []
  });
  await showNotification(await msg('copiedTitle'), await msg('copiedMessage', { title: title || url }));
  return true;
}

async function showNotification(title, message) {
  try {
    const { settings } = await chrome.storage.local.get(['settings']);
    const enabled = settings ? settings.showNotifications !== false : true;
    if (enabled && chrome.notifications) {
      chrome.notifications.create({ type: 'basic', iconUrl: 'icon48.png', title, message });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// ---- Messages from popup / content scripts ----

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || !request || request.target === 'offscreen') return;

  const respond = (promise, build) => {
    promise.then((value) => sendResponse(build(value)), (error) => {
      console.error(`Error handling ${request.action}:`, error);
      sendResponse({ success: false });
    });
    return true; // keep the channel open for the async response
  };

  switch (request.action) {
    case 'getHistory':
      return respond(chrome.storage.local.get(['linkHistory']), (d) => ({ history: d.linkHistory || [] }));
    case 'getStats':
      return respond(chrome.storage.local.get(['stats']), (d) => ({ stats: d.stats || { totalCopied: 0, dailyCopied: 0 } }));
    case 'clearHistory':
      return respond(clearHistory(), () => ({ success: true }));
    case 'updateSettings':
      return respond(updateSettings(request.settings), () => ({ success: true }));
    case 'recordCopy':
    case 'copyCurrentPage':
    case 'copyLink':
      // Sent by the popup or content script after it copied a URL itself.
      return respond(saveToHistory(request.data), () => ({ success: true }));
  }
});
