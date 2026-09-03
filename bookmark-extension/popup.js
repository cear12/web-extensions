// Popup script for File Bookmarks
// Lists saved bookmarks, adds one for the current tab, and jumps back to a
// saved position. All bookmark logic lives in background.js; this file is
// UI plus the i18n/menu/toast plumbing shared with this repo's other
// extensions.

(() => {
  'use strict';

  // Match the Chrome look-and-feel used by the other extensions in this repo.
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // State
  let currentTabInfo = null;

  // Translation system
  const translations = {
    en: {
      'menu': 'Menu',
      'language': 'Language',
      'other-products': 'Other Products',
      'about': 'About',
      'select-language': 'Select Language',
      'add-bookmark': '+ Bookmark this tab',
      'your-bookmarks': 'Your Bookmarks',
      'no-bookmarks': 'No bookmarks yet. Open a TXT or MD file and add one.',
      'app-name': 'File Bookmarks',
      'app-version': 'Version',
      'app-developer': 'Developed by Olé',
      'app-description': 'Bookmark your place in a TXT or Markdown file and jump straight back to it.',
      'developed-by': 'Developed by',
      'go': 'Go',
      'rename': 'Rename',
      'delete': 'Delete',
      'tab-supported': 'File: {name} ({ext})',
      'tab-unsupported': "This tab isn't supported (needs a TXT or MD file).",
      'rename-prompt': 'New bookmark name:',
      'confirm-delete': 'Delete this bookmark?',
      'error-no-active-tab': 'No active tab.',
      'error-unsupported-file-type': "This file type isn't supported (TXT or MD only).",
      'error-not-found': 'Bookmark not found.',
      'error-generic': 'Something went wrong.',
      'bookmark-added': 'Bookmark added',
      'bookmark-added-no-position': "Bookmark added, but couldn't read the file's content -- if this is a local file, enable \"Allow access to file URLs\" for this extension in chrome://extensions.",
      'bookmark-deleted': 'Bookmark deleted',
      'bookmark-renamed': 'Bookmark renamed',
      'jumped-approximate': 'File changed -- jumped to the closest match.',
      'tab-unreachable': "Couldn't reach that tab. If it's a local file, enable \"Allow access to file URLs\" for this extension in chrome://extensions.",
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Generate QR codes for text, URL, WiFi, and contacts with customization and PNG download.',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'One-click link copying with history.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Professional privacy protection. One-click cleanup of browsing data.',
      'view-in-store': 'View in Store'
    },
    es: {
      'menu': 'Menú',
      'language': 'Idioma',
      'other-products': 'Otros productos',
      'about': 'Acerca de',
      'select-language': 'Seleccionar idioma',
      'add-bookmark': '+ Marcar esta pestaña',
      'your-bookmarks': 'Tus marcadores',
      'no-bookmarks': 'Aún no hay marcadores. Abre un archivo TXT o MD y añade uno.',
      'app-name': 'File Bookmarks',
      'app-version': 'Versión',
      'app-developer': 'Desarrollado por Olé',
      'app-description': 'Marca tu posición en un archivo TXT o Markdown y vuelve directo a ella.',
      'developed-by': 'Desarrollado por',
      'go': 'Ir',
      'rename': 'Renombrar',
      'delete': 'Eliminar',
      'tab-supported': 'Archivo: {name} ({ext})',
      'tab-unsupported': 'Esta pestaña no es compatible (necesita un archivo TXT o MD).',
      'rename-prompt': 'Nuevo nombre del marcador:',
      'confirm-delete': '¿Eliminar este marcador?',
      'error-no-active-tab': 'No hay ninguna pestaña activa.',
      'error-unsupported-file-type': 'Este tipo de archivo no es compatible (solo TXT o MD).',
      'error-not-found': 'Marcador no encontrado.',
      'error-generic': 'Algo salió mal.',
      'bookmark-added': 'Marcador añadido',
      'bookmark-added-no-position': 'Marcador añadido, pero no se pudo leer el contenido del archivo -- si es un archivo local, activa "Permitir acceso a las URLs de archivos" para esta extensión en chrome://extensions.',
      'bookmark-deleted': 'Marcador eliminado',
      'bookmark-renamed': 'Marcador renombrado',
      'jumped-approximate': 'El archivo cambió -- se saltó a la coincidencia más cercana.',
      'tab-unreachable': 'No se pudo acceder a esa pestaña. Si es un archivo local, activa "Permitir acceso a las URLs de archivos" para esta extensión en chrome://extensions.',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Genera códigos QR para texto, URL, WiFi y contactos, con personalización y descarga en PNG.',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'Copia de enlaces con un clic, con historial.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Protección de privacidad profesional. Limpieza de datos de navegación con un clic.',
      'view-in-store': 'Ver en la tienda'
    },
    ru: {
      'menu': 'Меню',
      'language': 'Язык',
      'other-products': 'Другие продукты',
      'about': 'О программе',
      'select-language': 'Выберите язык',
      'add-bookmark': '+ Закладка на этой вкладке',
      'your-bookmarks': 'Ваши закладки',
      'no-bookmarks': 'Пока нет закладок. Откройте TXT или MD файл и добавьте одну.',
      'app-name': 'File Bookmarks',
      'app-version': 'Версия',
      'app-developer': 'Разработано Olé',
      'app-description': 'Запоминает место в TXT или Markdown файле и возвращает вас туда же.',
      'developed-by': 'Разработано',
      'go': 'Перейти',
      'rename': 'Переименовать',
      'delete': 'Удалить',
      'tab-supported': 'Файл: {name} ({ext})',
      'tab-unsupported': 'Эта вкладка не поддерживается (нужен TXT или MD файл).',
      'rename-prompt': 'Новое название закладки:',
      'confirm-delete': 'Удалить эту закладку?',
      'error-no-active-tab': 'Нет активной вкладки.',
      'error-unsupported-file-type': 'Этот тип файла не поддерживается (только TXT или MD).',
      'error-not-found': 'Закладка не найдена.',
      'error-generic': 'Что-то пошло не так.',
      'bookmark-added': 'Закладка добавлена',
      'bookmark-added-no-position': 'Закладка добавлена, но не удалось прочитать содержимое файла -- если это локальный файл, включите «Разрешить доступ к URL-адресам файлов» для этого расширения в chrome://extensions.',
      'bookmark-deleted': 'Закладка удалена',
      'bookmark-renamed': 'Закладка переименована',
      'jumped-approximate': 'Файл изменился -- переход выполнен к ближайшему совпадению.',
      'tab-unreachable': 'Не удалось обратиться к этой вкладке. Если это локальный файл, включите «Разрешить доступ к URL-адресам файлов» для этого расширения в chrome://extensions.',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Генерация QR-кодов для текста, URL, WiFi и контактов, с настройкой и скачиванием в PNG.',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'Копирование ссылок в один клик, с историей.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Профессиональная защита приватности. Очистка данных браузера в один клик.',
      'view-in-store': 'Смотреть в магазине'
    },
    zh: {
      'menu': '菜单',
      'language': '语言',
      'other-products': '其他产品',
      'about': '关于',
      'select-language': '选择语言',
      'add-bookmark': '+ 收藏此标签页',
      'your-bookmarks': '我的书签',
      'no-bookmarks': '还没有书签。打开一个 TXT 或 MD 文件并添加一个。',
      'app-name': 'File Bookmarks',
      'app-version': '版本',
      'app-developer': '开发者 Olé',
      'app-description': '记住你在 TXT 或 Markdown 文件中的位置，随时跳回去。',
      'developed-by': '开发者',
      'go': '前往',
      'rename': '重命名',
      'delete': '删除',
      'tab-supported': '文件：{name}（{ext}）',
      'tab-unsupported': '当前标签页不支持（需要 TXT 或 MD 文件）。',
      'rename-prompt': '书签的新名称：',
      'confirm-delete': '删除这个书签？',
      'error-no-active-tab': '没有活动的标签页。',
      'error-unsupported-file-type': '不支持此文件类型（仅支持 TXT 或 MD）。',
      'error-not-found': '未找到书签。',
      'error-generic': '出了点问题。',
      'bookmark-added': '书签已添加',
      'bookmark-added-no-position': '书签已添加，但无法读取文件内容 -- 如果这是本地文件，请在 chrome://extensions 中为此扩展启用"允许访问文件网址"。',
      'bookmark-deleted': '书签已删除',
      'bookmark-renamed': '书签已重命名',
      'jumped-approximate': '文件已更改 -- 已跳转到最接近的匹配位置。',
      'tab-unreachable': '无法访问该标签页。如果这是本地文件，请在 chrome://extensions 中为此扩展启用"允许访问文件网址"。',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': '为文本、网址、WiFi 和联系人生成二维码，支持自定义样式并可下载 PNG。',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': '一键复制链接，并保留历史记录。',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': '专业的隐私保护，一键清理浏览数据。',
      'view-in-store': '在商店中查看'
    }
  };

  let currentLanguage = localStorage.getItem('bookmarks_language') || 'en';

  function t(key) {
    return (translations[currentLanguage] && translations[currentLanguage][key]) || key;
  }

  function tFormat(key, vars) {
    let str = t(key);
    Object.keys(vars).forEach((name) => {
      str = str.replace(`{${name}}`, vars[name]);
    });
    return str;
  }

  function translatePage(lang) {
    currentLanguage = lang;
    localStorage.setItem('bookmarks_language', lang);

    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    $$('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (translations[lang] && translations[lang][key]) {
        el.title = translations[lang][key];
      }
    });

    refreshTabInfo();
    loadBookmarks();
  }

  // ---- Messaging ----

  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => resolve(response));
    });
  }

  function errorMessage(result) {
    if (result && result.errorCode) return t(`error-${result.errorCode}`);
    return t('error-generic');
  }

  // ---- Helpers ----

  function shortUrl(url) {
    try {
      const u = new URL(url);
      const name = decodeURIComponent(u.pathname.split('/').pop() || u.pathname);
      return name || url;
    } catch (e) {
      return url;
    }
  }

  function extLabel(ext) {
    return ext === 'markdown' ? 'MD' : ext.toUpperCase();
  }

  function extClass(ext) {
    return ext === 'txt' ? 'txt' : 'md';
  }

  // ---- Tab info ----

  async function refreshTabInfo() {
    const tabInfoEl = $('#tab-info');
    const addBtn = $('#add-btn');
    const info = await sendMessage({ type: 'GET_ACTIVE_TAB_INFO' });
    currentTabInfo = info || null;
    if (!tabInfoEl || !addBtn) return;

    if (info && info.supported) {
      addBtn.disabled = false;
      tabInfoEl.classList.remove('unsupported');
      tabInfoEl.textContent = tFormat('tab-supported', { name: shortUrl(info.url), ext: extLabel(info.ext) });
    } else {
      addBtn.disabled = true;
      tabInfoEl.classList.add('unsupported');
      tabInfoEl.textContent = t('tab-unsupported');
    }
  }

  // ---- Bookmark list ----

  async function loadBookmarks() {
    const res = await sendMessage({ type: 'GET_BOOKMARKS' });
    renderList((res && res.bookmarks) || []);
  }

  function renderList(bookmarks) {
    const listEl = $('#bookmark-list');
    const emptyEl = $('#empty-state');
    const template = $('#item-template');
    if (!listEl || !emptyEl || !template) return;

    listEl.innerHTML = '';
    emptyEl.classList.toggle('hidden', bookmarks.length !== 0);

    for (const bm of bookmarks) {
      const node = template.content.cloneNode(true);
      const badge = node.querySelector('.bookmark-badge');
      const titleEl = node.querySelector('.bookmark-title');
      const urlEl = node.querySelector('.bookmark-url');
      const goBtn = node.querySelector('.go-btn');
      const renameBtn = node.querySelector('.rename-btn');
      const deleteBtn = node.querySelector('.delete-btn');

      badge.textContent = extLabel(bm.ext);
      badge.classList.add(extClass(bm.ext));
      titleEl.textContent = bm.title || shortUrl(bm.baseUrl);
      titleEl.title = bm.title || bm.baseUrl;
      urlEl.textContent = shortUrl(bm.baseUrl);
      goBtn.title = t('go');
      renameBtn.title = t('rename');
      deleteBtn.title = t('delete');

      goBtn.addEventListener('click', async () => {
        goBtn.disabled = true;
        const result = await sendMessage({ type: 'GOTO_BOOKMARK', id: bm.id });
        goBtn.disabled = false;
        if (!result || result.ok === false) {
          showToast(errorMessage(result), 'error');
        } else if (result.reached === false) {
          showToast(t('tab-unreachable'), 'error');
        } else if (result.anchorFound === false) {
          showToast(t('jumped-approximate'), 'info');
        }
      });

      renameBtn.addEventListener('click', async () => {
        const newTitle = prompt(t('rename-prompt'), bm.title || '');
        if (newTitle !== null && newTitle.trim() !== '') {
          const result = await sendMessage({ type: 'RENAME_BOOKMARK', id: bm.id, title: newTitle.trim() });
          if (result && result.ok) {
            showToast(t('bookmark-renamed'), 'success');
            loadBookmarks();
          } else {
            showToast(errorMessage(result), 'error');
          }
        }
      });

      deleteBtn.addEventListener('click', async () => {
        if (confirm(t('confirm-delete'))) {
          await sendMessage({ type: 'DELETE_BOOKMARK', id: bm.id });
          showToast(t('bookmark-deleted'), 'success');
          loadBookmarks();
        }
      });

      listEl.appendChild(node);
    }
  }

  async function handleAddBookmark() {
    const addBtn = $('#add-btn');
    if (addBtn) addBtn.disabled = true;

    const result = await sendMessage({ type: 'ADD_BOOKMARK_CURRENT_TAB' });

    if (addBtn) addBtn.disabled = false;

    if (!result || result.ok === false) {
      showToast(errorMessage(result), 'error');
      return;
    }

    showToast(result.positionCaptured ? t('bookmark-added') : t('bookmark-added-no-position'), result.positionCaptured ? 'success' : 'info');
    await loadBookmarks();
  }

  // ---- Menu ----

  function openMenu() {
    $('#menu-widget')?.classList.remove('hidden');
    $('#menu-overlay')?.classList.remove('hidden');
    showMenuItems();
  }

  function closeMenu() {
    $('#menu-widget')?.classList.add('hidden');
    $('#menu-overlay')?.classList.add('hidden');
    hideAllPanels();
  }

  function showMenuItems() {
    const menuItems = $('.menu-items');
    if (menuItems) menuItems.style.display = 'block';
    hideAllPanels();
  }

  function showMenuPanel(section) {
    hideAllPanels();
    $(`#${section}-panel`)?.classList.remove('hidden');
    const menuItems = $('.menu-items');
    if (menuItems) menuItems.style.display = 'none';
  }

  function hideAllPanels() {
    $$('.menu-panel').forEach((panel) => panel.classList.add('hidden'));
  }

  // ---- Toast ----

  function showToast(message, type = 'info') {
    $('#toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;

    const colors = { success: '#34A853', error: '#EA4335', info: '#4285F4' };
    toast.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      max-width: 90%;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ---- Init ----

  function setupEventListeners() {
    $('#menu-btn')?.addEventListener('click', openMenu);
    $('#close-btn')?.addEventListener('click', () => window.close());
    $('#menu-close')?.addEventListener('click', closeMenu);
    $('#menu-overlay')?.addEventListener('click', closeMenu);

    $$('.menu-item').forEach((item) => {
      item.addEventListener('click', () => showMenuPanel(item.dataset.section));
    });
    $$('.back-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.back === 'menu') showMenuItems();
      });
    });

    const languageSelect = $('#language-select');
    if (languageSelect) {
      languageSelect.value = currentLanguage;
      languageSelect.addEventListener('change', (e) => translatePage(e.target.value));
    }

    $('#add-btn')?.addEventListener('click', handleAddBookmark);
  }

  function init() {
    setupEventListeners();
    translatePage(currentLanguage); // also triggers the first refreshTabInfo()/loadBookmarks()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
