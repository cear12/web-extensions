// Web Privacy Extension - Popup Script
(() => {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Translation system
  const translations = {
    en: {
      'app-name': 'Web Privacy',
      'about': 'About',
      'privacy-status': 'Privacy Status',
      'last-cleanup': 'Last cleanup: Never',
      'quick-settings': 'Quick Settings',
      'cookies': 'Cookies',
      'cache': 'Cache',
      'history': 'History',
      'downloads': 'Downloads',
      'browsing-history': 'Browsing history',
      'download-history': 'Download history',
      'cookies-and-site-data': 'Cookies and other site data',
      'cached-images-files': 'Cached images and files',
      'browsing-history-help': 'Deletes history, including in the search box',
      'download-history-help': 'Clears your download list, not the actual files',
      'cookies-and-site-data-help': "Signs you out of most sites. You'll stay signed in to your Google Account.",
      'cached-images-files-help': 'Frees up storage. Some sites may load more slowly on your next visit.',
      'items': 'item',
      'items_plural': 'items',
      'sites': 'sites',
      'none': 'None',
      'clean-now': 'Clear',
      'cleanup-options': 'Cleanup Options',
      'version': 'Version',
      'app-description': 'Professional privacy protection',
      'developed-by': 'Developed by',
      'language': 'Language',
      'select-language': 'Select Language',
      'other-products': 'Other Products',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Generate QR codes for text, URL, WiFi, and contacts with customization and PNG download.',
      'quick-link-copier-name': 'Quick Link Copier',
      'quick-link-copier-desc': 'One-click link copying with history',
      'word-hero-name': 'Word Hero',
      'word-hero-desc': 'Vocabulary building and word games',
      'view-in-store': 'View in Store'
    },
    es: {
      'app-name': 'Web Privacy',
      'about': 'Acerca de',
      'privacy-status': 'Estado de Privacidad',
      'last-cleanup': 'Última limpieza: Nunca',
      'quick-settings': 'Configuración Rápida',
      'cookies': 'Cookies',
      'cache': 'Caché',
      'history': 'Historial',
      'downloads': 'Descargas',
      'browsing-history': 'Historial de navegación',
      'download-history': 'Historial de descargas',
      'cookies-and-site-data': 'Cookies y otros datos de sitios',
      'cached-images-files': 'Imágenes y archivos en caché',
      'browsing-history-help': 'Elimina el historial, incluido en el cuadro de búsqueda',
      'download-history-help': 'Borra la lista de descargas, no los archivos',
      'cookies-and-site-data-help': 'Te cerrará sesión en la mayoría de sitios. Seguirás conectado a tu cuenta de Google.',
      'cached-images-files-help': 'Libera espacio. Algunos sitios pueden cargar más lento en la próxima visita.',
      'items': 'elemento',
      'items_plural': 'elementos',
      'sites': 'sitios',
      'none': 'Ninguno',
      'clean-now': 'Clear',
      'cleanup-options': 'Opciones de Limpieza',
      'version': 'Versión',
      'app-description': 'Protección profesional de privacidad',
      'developed-by': 'Desarrollado por',
      'language': 'Idioma',
      'select-language': 'Seleccionar Idioma',
      'other-products': 'Otros Productos',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Genera códigos QR para texto, URL, WiFi y contactos con personalización y descarga en PNG.',
      'quick-link-copier-name': 'Quick Link Copier',
      'quick-link-copier-desc': 'Copia de enlaces con un clic con historial',
      'word-hero-name': 'Word Hero',
      'word-hero-desc': 'Construcción de vocabulario y juegos de palabras',
      'view-in-store': 'Ver en la Tienda'
    },
    ru: {
      'app-name': 'Web Privacy',
      'about': 'О программе',
      'privacy-status': 'Статус приватности',
      'last-cleanup': 'Последняя очистка: Никогда',
      'quick-settings': 'Быстрые настройки',
      'cookies': 'Cookies',
      'cache': 'Кэш',
      'history': 'История',
      'downloads': 'Загрузки',
      'browsing-history': 'История просмотров',
      'download-history': 'История загрузок',
      'cookies-and-site-data': 'Cookies и другие данные сайтов',
      'cached-images-files': 'Кэшированные изображения и файлы',
      'browsing-history-help': 'Удаляет историю, включая в строке поиска',
      'download-history-help': 'Очищает список загрузок, не удаляя файлы',
      'cookies-and-site-data-help': 'Выйдет из большинства сайтов. В аккаунте Google вы останетесь.',
      'cached-images-files-help': 'Освобождает место. Сайты могут загружаться медленнее при следующем визите.',
      'items': 'элемент',
      'items_plural': 'элементов',
      'sites': 'сайтов',
      'none': 'Нет',
      'clean-now': 'Очистить',
      'cleanup-options': 'Опции очистки',
      'version': 'Версия',
      'app-description': 'Профессиональная защита приватности',
      'developed-by': 'Разработано',
      'language': 'Язык',
      'select-language': 'Выберите язык',
      'other-products': 'Другие продукты',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Генерация QR-кодов для текста, URL, WiFi и контактов с настройкой и загрузкой в PNG.',
      'quick-link-copier-name': 'Quick Link Copier',
      'quick-link-copier-desc': 'Копирование ссылок одним кликом с историей',
      'word-hero-name': 'Word Hero',
      'word-hero-desc': 'Изучение словарного запаса и словесные игры',
      'view-in-store': 'Посмотреть в магазине'
    },
    zh: {
      'app-name': 'Web Privacy',
      'about': '关于',
      'privacy-status': '隐私状态',
      'last-cleanup': '上次清理：从未',
      'quick-settings': '快速设置',
      'cookies': 'Cookies',
      'cache': '缓存',
      'history': '历史记录',
      'downloads': '下载',
      'browsing-history': '浏览记录',
      'download-history': '下载记录',
      'cookies-and-site-data': 'Cookie 及其他站点数据',
      'cached-images-files': '缓存的图片和文件',
      'browsing-history-help': '删除历史记录，包括搜索框中的内容',
      'download-history-help': '清除下载列表，不会删除文件',
      'cookies-and-site-data-help': '会从大多数网站退出登录，但保留 Google 账号登录状态。',
      'cached-images-files-help': '释放空间。下次访问时部分网站可能加载更慢。',
      'items': '项',
      'items_plural': '项',
      'sites': '个站点',
      'none': '无',
      'clean-now': '清理',
      'cleanup-options': '清理选项',
      'version': '版本',
      'app-description': '专业隐私保护',
      'developed-by': '开发',
      'language': '语言',
      'select-language': '选择语言',
      'other-products': '其他产品',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': '为文本、URL、WiFi 和联系人生成二维码，支持自定义样式和 PNG 下载。',
      'quick-link-copier-name': 'Quick Link Copier',
      'quick-link-copier-desc': '一键复制链接并保存历史',
      'word-hero-name': 'Word Hero',
      'word-hero-desc': '词汇构建和单词游戏',
      'view-in-store': '在商店中查看'
    }
  };

  let isCleaning = false;
  let cleanupCount = 0;
  let lastCleanup = null;
  let settings = {
    cookies: true,
    cache: true,
    history: false,
    downloads: false,
    passwords: false,
    formData: false
  };

  // Language detection and translation
  let currentLanguage = 'ru'; // Default to Russian

  function detectLanguage() {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['en', 'es', 'ru', 'zh'];
    return supportedLangs.includes(browserLang) ? browserLang : 'ru';
  }

  function translate(key) {
    return translations[currentLanguage]?.[key] || translations['ru'][key] || key;
  }

  function applyTranslations() {
    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = translate(key);
      if (el.tagName === 'INPUT' && el.type === 'text' && el.placeholder) {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
  }

  async function loadLanguage() {
    try {
      const result = await chrome.storage.sync.get(['webPrivacyLanguage']);
      if (result.webPrivacyLanguage) {
        currentLanguage = result.webPrivacyLanguage;
      } else {
        currentLanguage = detectLanguage();
      }
      // Set the language select value
      const languageSelect = document.getElementById('language-select');
      if (languageSelect) {
        languageSelect.value = currentLanguage;
      }
    } catch (error) {
      console.error('Failed to load language:', error);
      currentLanguage = detectLanguage();
    }
  }

  async function saveLanguage() {
    try {
      await chrome.storage.sync.set({ webPrivacyLanguage: currentLanguage });
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }

  function setLanguage(lang) {
    currentLanguage = lang;
    saveLanguage();
    applyTranslations();
    // Re-apply dynamic values that translations might overwrite
    updateStatusDisplay();
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    await loadLanguage();
    await loadSettings();
    await loadStats();
    // First apply static translations, then render dynamic UI values
    applyTranslations();
    updateUI();
    setupEventListeners();
  });

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['webPrivacySettings']);
    if (result.webPrivacySettings) {
      settings = { ...settings, ...result.webPrivacySettings };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  try {
    await chrome.storage.sync.set({ webPrivacySettings: settings });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['cleanupCount', 'lastCleanup']);
    cleanupCount = result.cleanupCount || 0;
    lastCleanup = result.lastCleanup || null;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

async function saveStats() {
  try {
    await chrome.storage.local.set({
      cleanupCount: cleanupCount,
      lastCleanup: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

function setupEventListeners() {
  // Menu toggle
  document.getElementById('menu-btn').addEventListener('click', toggleMenu);
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  document.getElementById('close-btn').addEventListener('click', () => window.close());

  // Menu overlay
  document.getElementById('menu-overlay').addEventListener('click', closeMenu);

  // Menu items
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const section = e.currentTarget.dataset.section;
      showPanel(section);
    });
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const backTo = e.currentTarget.dataset.back;
      if (backTo === 'menu') {
        showMainMenu();
      }
    });
  });

  // Main cleanup button
  document.getElementById('cleanup-btn').addEventListener('click', performCleanup);

  // Quick settings
  document.querySelectorAll('#clean-cookies, #clean-cache, #clean-history, #clean-downloads').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const setting = e.target.id.replace('clean-', '');
      settings[setting] = e.target.checked;
      saveSettings();
      updateCleanupButtonState();
    });
  });


  // Language selection
  document.getElementById('language-select').addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  // Ensure cleanup button reflects current settings on load
  updateCleanupButtonState();
}

function toggleMenu() {
  const menuWidget = document.getElementById('menu-widget');
  const overlay = document.getElementById('menu-overlay');
  const mainContent = document.querySelector('.main-content');
  
  if (menuWidget.classList.contains('hidden')) {
    menuWidget.classList.remove('hidden');
    overlay.classList.remove('hidden');
    mainContent.classList.add('hidden');
    document.body.classList.add('menu-open');
  } else {
    closeMenu();
  }
}

function closeMenu() {
  document.getElementById('menu-widget').classList.add('hidden');
  document.getElementById('menu-overlay').classList.add('hidden');
  document.querySelector('.main-content').classList.remove('hidden');
  document.querySelectorAll('.menu-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  document.body.classList.remove('menu-open');
}

function showMainMenu() {
  document.getElementById('menu-widget').classList.add('hidden');
  document.getElementById('menu-overlay').classList.add('hidden');
  document.querySelector('.main-content').classList.remove('hidden');
  document.querySelectorAll('.menu-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
}

function showPanel(section) {
  // Hide menu and overlay
  document.getElementById('menu-widget').classList.add('hidden');
  document.getElementById('menu-overlay').classList.add('hidden');
  // Hide main content
  document.querySelector('.main-content').classList.add('hidden');
  // Hide all panels first
  document.querySelectorAll('.menu-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  // Show the requested panel
  const panel = document.getElementById(`${section}-panel`);
  if (panel) {
    panel.classList.remove('hidden');
  }
  document.body.classList.add('menu-open');
}

function updateUI() {
  updateStatusDisplay();
  updateSettingsUI();
}

function updateStatusDisplay() {
  const lastCleanupEl = document.getElementById('last-cleanup');
  if (!lastCleanupEl) return;

  if (lastCleanup) {
    const date = new Date(lastCleanup);
    const timeAgo = getTimeAgo(date);
    const base = translate('last-cleanup');
    const prefix = base.includes(':') ? base.split(':')[0] : base;
    lastCleanupEl.textContent = `${prefix}: ${timeAgo}`;
  } else {
    lastCleanupEl.textContent = translate('last-cleanup');
  }
}

function updateSettingsUI() {
  document.getElementById('clean-cookies').checked = settings.cookies;
  document.getElementById('clean-cache').checked = settings.cache;
  document.getElementById('clean-history').checked = settings.history;
  document.getElementById('clean-downloads').checked = settings.downloads;
}

function updateCleanupButtonState() {
  const cleanupBtn = document.getElementById('cleanup-btn');
  const anySelected = !!(settings.cookies || settings.cache || settings.history || settings.downloads);
  cleanupBtn.disabled = !anySelected;
}


function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

async function performCleanup() {
  if (isCleaning) return;

  isCleaning = true;
  const cleanupBtn = document.getElementById('cleanup-btn');
  const btnTextEl = cleanupBtn.querySelector('.btn-text');
  const originalLabel = btnTextEl ? btnTextEl.textContent : cleanupBtn.textContent;
  
  try {
    cleanupBtn.disabled = true;
    if (btnTextEl) { btnTextEl.textContent = 'CLEARING...'; }

    const cleanupOptions = {
      cookies: settings.cookies,
      cache: settings.cache,
      history: settings.history,
      downloads: settings.downloads,
      passwords: settings.passwords,
      formData: settings.formData
    };

    await executeCleanup(cleanupOptions);

    cleanupCount++;
    lastCleanup = new Date().toISOString();
    await saveStats();

    updateUI();
    updateCleanupButtonState();

  } catch (error) {
    console.error('[WebPrivacy] Cleanup failed:', error);
  } finally {
    cleanupBtn.disabled = false;
    if (btnTextEl) { btnTextEl.textContent = originalLabel; }
    isCleaning = false;
  }
}

async function executeCleanup(options) {
  const dataTypes = {};
  const timeRange = { since: 0 };

  if (options.cookies) dataTypes.cookies = true;
  if (options.cache) dataTypes.cache = true;
  if (options.history) dataTypes.history = true;
  if (options.downloads) dataTypes.downloads = true;
  if (options.passwords) dataTypes.passwords = true;
  if (options.formData) dataTypes.formData = true;

  return new Promise((resolve, reject) => {
    chrome.browsingData.remove(timeRange, dataTypes, () => {
      if (chrome.runtime.lastError) {
        const message = chrome.runtime.lastError.message || 'Unknown error';
        console.error('[WebPrivacy] chrome.browsingData.remove error:', message);
        reject(new Error(message));
      } else {
        resolve();
      }
    });
  });
}


})();
