// background.js (MV3 service worker)
//
// Storage schema (chrome.storage.local, key "bookmarks"):
// {
//   id: string,
//   ext: "txt" | "md" | "markdown",   // real file extension, for the popup's badge
//   title: string,
//   baseUrl: string,   // URL with any #fragment stripped -- used to match "same file"
//   createdAt: number,
//   scrollRatio: number,
//   anchorText: string
// }
//
// PDF support was dropped: Chrome's built-in PDF viewer runs as a separate
// component extension and blocks content scripts from reaching its DOM or
// its own extension origin (confirmed via Chrome's own manifest validation,
// not just observed behavior -- see git history / README for the two
// approaches that were tried). Without that, there's no way to read or
// restore a page position automatically, only a manual "type the page
// number you see in the viewer" flow -- which isn't a bookmark feature
// worth shipping. TXT/MD bookmarking (scroll position + a text anchor) has
// no such platform restriction and works reliably.

const STORAGE_KEY = "bookmarks";
const EXT_PATTERN = /\.(txt|md|markdown)$/i;

function stripFragment(urlStr) {
  try {
    const u = new URL(urlStr);
    u.hash = "";
    return u.toString();
  } catch (e) {
    return urlStr;
  }
}

function detectExt(urlStr) {
  try {
    const u = new URL(urlStr);
    const path = decodeURIComponent(u.pathname);
    const m = EXT_PATTERN.exec(path);
    return m ? m[1].toLowerCase() : null;
  } catch (e) {
    return null;
  }
}

async function getBookmarks() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}

async function saveBookmarks(list) {
  await chrome.storage.local.set({ [STORAGE_KEY]: list });
}

// Every read-modify-write of the bookmark list goes through this queue so
// two quick actions (context menu + popup) cannot overwrite each other.
let writeQueue = Promise.resolve();
function mutateBookmarks(mutator) {
  const run = writeQueue.then(async () => {
    const list = await getBookmarks();
    const result = await mutator(list);
    await saveBookmarks(list);
    return result;
  });
  writeQueue = run.catch(() => {});
  return run;
}

function uuid() {
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)
  );
}

async function sendMessageToTab(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null); // no content script there (unsupported page, or the
                        // "Allow access to file URLs" toggle isn't on)
      } else {
        resolve(response);
      }
    });
  });
}

async function addBookmarkForTab(tab) {
  if (!tab || !tab.url) {
    return { ok: false, errorCode: "no-active-tab" };
  }
  const ext = detectExt(tab.url);
  if (!ext) {
    return { ok: false, errorCode: "unsupported-file-type" };
  }

  const baseUrl = stripFragment(tab.url);
  const bookmark = {
    id: uuid(),
    ext,
    title: tab.title || tab.url,
    baseUrl,
    createdAt: Date.now(),
    scrollRatio: 0,
    anchorText: "",
  };

  const pos = await sendMessageToTab(tab.id, { type: "GET_POSITION" });
  if (pos) {
    bookmark.scrollRatio = pos.scrollRatio;
    bookmark.anchorText = pos.anchorText;
  }
  // If pos is null, the content script wasn't reachable (most likely a
  // file:// tab without "Allow access to file URLs" enabled). We still save
  // the bookmark rather than failing outright -- it'll just restore to the
  // top of the file until that's fixed -- but tell the caller so the popup
  // can surface the real reason instead of pretending it worked perfectly.

  const duplicate = await mutateBookmarks((list) => {
    // Re-bookmarking the exact same spot of the same file just refreshes it.
    const i = list.findIndex((b) => b.baseUrl === baseUrl && b.anchorText === bookmark.anchorText && bookmark.anchorText);
    if (i !== -1) list.splice(i, 1);
    list.unshift(bookmark);
    return i !== -1;
  });
  return { ok: true, bookmark, positionCaptured: !!pos, duplicate };
}

async function findOpenTabForUrl(baseUrl) {
  let tabs;
  try {
    // Narrow the query when the URL is a valid match pattern; fall back to
    // scanning every tab otherwise (e.g. URLs containing "*").
    tabs = await chrome.tabs.query({ url: baseUrl.replace(/[#].*$/, '') + '*' });
  } catch (e) {
    tabs = await chrome.tabs.query({});
  }
  for (const t of tabs) {
    if (t.url && stripFragment(t.url) === baseUrl) return t;
  }
  return null;
}

function waitForTabComplete(tabId, timeoutMs = 8000) {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(false);
      }
    }, timeoutMs);

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        if (!done) {
          done = true;
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve(true);
        }
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function gotoBookmark(id) {
  const list = await getBookmarks();
  const bookmark = list.find((b) => b.id === id);
  if (!bookmark) return { ok: false, errorCode: "not-found" };

  let tab = await findOpenTabForUrl(bookmark.baseUrl);
  if (tab) {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    tab = await chrome.tabs.create({ url: bookmark.baseUrl });
    await chrome.windows.update(tab.windowId, { focused: true });
    await waitForTabComplete(tab.id);
  }

  // The content script may not be listening yet (freshly created tab);
  // retry a few times before concluding it is genuinely unreachable.
  let result = null;
  for (let attempt = 0; attempt < 5 && !result; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 200));
    result = await sendMessageToTab(tab.id, {
      type: "RESTORE_POSITION",
      scrollRatio: bookmark.scrollRatio,
      anchorText: bookmark.anchorText,
    });
  }

  // Distinguish "the tab replied, but couldn't find the exact anchor"
  // (anchorFound: false) from "nothing replied at all" (result === null,
  // most likely a file:// tab without file-URL access enabled) -- these
  // need different messages in the popup.
  if (!result) {
    return { ok: true, reached: false };
  }
  return { ok: true, reached: true, anchorFound: result.anchorFound };
}

async function deleteBookmark(id) {
  await mutateBookmarks((list) => {
    const i = list.findIndex((b) => b.id === id);
    if (i !== -1) list.splice(i, 1);
  });
  return { ok: true };
}

async function renameBookmark(id, title) {
  const title_ = String(title || "").trim().slice(0, 200);
  const found = await mutateBookmarks((list) => {
    const bookmark = list.find((b) => b.id === id);
    if (bookmark && title_) bookmark.title = title_;
    return !!bookmark;
  });
  return found ? { ok: true } : { ok: false, errorCode: "not-found" };
}

async function getActiveTabInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return { supported: false };
  const ext = detectExt(tab.url);
  return {
    supported: !!ext,
    ext,
    url: tab.url,
    title: tab.title,
  };
}

// Context-menu clicks have no popup to report into, so confirm on the badge.
function flashBadge(text, color, tabId) {
  const opts = tabId != null ? { tabId } : {};
  chrome.action.setBadgeBackgroundColor({ color, ...opts });
  chrome.action.setBadgeText({ text, ...opts });
  setTimeout(() => chrome.action.setBadgeText({ text: "", ...opts }), 2000);
}

// ---- UI language (popup mirrors its choice into chrome.storage.local) ----
const LANGUAGE_KEY = "ui_language";
const SUPPORTED_LANGUAGES = ["en", "ru", "es", "zh", "hi"];
const MENU_TRANSLATIONS = {
  en: { "add-bookmark-here": "Add bookmark here" },
  ru: { "add-bookmark-here": "Добавить закладку здесь" },
  es: { "add-bookmark-here": "Añadir marcador aquí" },
  zh: { "add-bookmark-here": "在此处添加书签" },
  hi: { "add-bookmark-here": "यहाँ बुकमार्क जोड़ें" },
};

function normalizeLanguage(lang) {
  const base = String(lang || "").toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.includes(base) ? base : null;
}

async function getUiLanguage() {
  try {
    const data = await chrome.storage.local.get(LANGUAGE_KEY);
    const saved = normalizeLanguage(data[LANGUAGE_KEY]);
    if (saved) return saved;
  } catch (e) {}
  try {
    return normalizeLanguage(chrome.i18n.getUILanguage()) || "en";
  } catch (e) {
    return "en";
  }
}

function tr(lang, key) {
  return (MENU_TRANSLATIONS[lang] && MENU_TRANSLATIONS[lang][key]) || MENU_TRANSLATIONS.en[key];
}

// ---- Context menu ----
const MENU_ID = "add-file-bookmark";

async function buildContextMenu() {
  const lang = await getUiLanguage();
  await chrome.contextMenus.removeAll(); // avoid duplicate-id errors on update
  chrome.contextMenus.create({
    id: MENU_ID,
    title: tr(lang, "add-bookmark-here"),
    contexts: ["page", "selection"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  buildContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  buildContextMenu();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[LANGUAGE_KEY]) {
    getUiLanguage().then((lang) => {
      chrome.contextMenus.update(MENU_ID, { title: tr(lang, "add-bookmark-here") }, () => {
        if (chrome.runtime.lastError) buildContextMenu();
      });
    });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === MENU_ID && tab) {
    const result = await addBookmarkForTab(tab);
    flashBadge(result && result.ok ? "\u2713" : "!", result && result.ok ? "#34A853" : "#EA4335", tab.id);
  }
});

// ---- Message router (popup <-> background) ----
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return;

  (async () => {
    switch (message.type) {
      case "GET_BOOKMARKS": {
        const list = await getBookmarks();
        sendResponse({ ok: true, bookmarks: list });
        break;
      }
      case "ADD_BOOKMARK_CURRENT_TAB": {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const result = await addBookmarkForTab(tab);
        sendResponse(result);
        break;
      }
      case "GOTO_BOOKMARK": {
        const result = await gotoBookmark(message.id);
        sendResponse(result);
        break;
      }
      case "DELETE_BOOKMARK": {
        const result = await deleteBookmark(message.id);
        sendResponse(result);
        break;
      }
      case "RENAME_BOOKMARK": {
        const result = await renameBookmark(message.id, message.title);
        sendResponse(result);
        break;
      }
      case "GET_ACTIVE_TAB_INFO": {
        const info = await getActiveTabInfo();
        sendResponse(info);
        break;
      }
      default:
        sendResponse({ ok: false, errorCode: "unknown-message" });
    }
  })();

  return true; // keep the message channel open for the async response
});
