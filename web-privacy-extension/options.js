// Web Privacy Extension - Options Page Script
const OPTIONS_I18N = {
  en: {
    'page-title': 'Web Privacy - Settings',
    'header-title': 'Web Privacy Settings',
    'logo': 'Logo',
    'general-settings': 'General Settings',
    'show-notifications': 'Show Notifications',
    'show-notifications-desc': 'Get notified when cleanup is completed',
    'language': 'Language',
    'cleanup-options': 'Cleanup Options',
    'cookies': 'Cookies',
    'cookies-desc': 'Remove all cookies and site data',
    'cache': 'Cache',
    'cache-desc': 'Clear browser cache and temporary files',
    'history': 'History',
    'history-desc': 'Remove browsing history',
    'downloads': 'Downloads',
    'downloads-desc': 'Clear download history',
    'passwords': 'Saved Passwords',
    'passwords-desc': 'Remove saved passwords (use with caution)',
    'form-data': 'Form Data',
    'form-data-desc': 'Clear saved form data and autofill',
    'auto-schedule': 'Auto Schedule',
    'schedule-none': 'No Auto Schedule',
    'schedule-hourly': 'Every Hour',
    'schedule-daily': 'Daily',
    'schedule-weekly': 'Weekly',
    'site-management': 'Site Management',
    'site-management-desc': 'Whitelisted sites are skipped when clearing cookies and cache (the browser cannot exclude individual sites from history or download cleanup). The blacklist is saved for your own reference and is not enforced.',
    'whitelist': 'Whitelist',
    'blacklist': 'Blacklist',
    'whitelist-placeholder': 'Enter domain (e.g., example.com)',
    'blacklist-placeholder': 'Enter domain (e.g., tracking.com)',
    'add': 'Add',
    'remove': 'Remove',
    'statistics': 'Statistics',
    'total-cleanups': 'Total Cleanups',
    'last-cleanup': 'Last Cleanup',
    'sensitive-sites': 'Sensitive Sites Visited',
    'never': 'Never',
    'save-settings': 'Save Settings',
    'reset-settings': 'Reset to Defaults',
    'export-settings': 'Export Settings',
    'import-settings': 'Import Settings',
    'footer-tagline': 'Professional privacy protection',
    'msg-saved': 'Settings saved successfully!',
    'msg-save-failed': 'Failed to save settings',
    'msg-exported': 'Settings exported successfully!',
    'msg-imported': 'Settings imported successfully!',
    'msg-import-failed': 'Failed to import settings. Invalid file format.',
    'confirm-reset': 'Are you sure you want to reset all settings to defaults?'
  },
  es: {
    'page-title': 'Web Privacy - Configuración',
    'header-title': 'Configuración de Web Privacy',
    'logo': 'Logotipo',
    'general-settings': 'Configuración general',
    'show-notifications': 'Mostrar notificaciones',
    'show-notifications-desc': 'Recibe un aviso cuando termine la limpieza',
    'language': 'Idioma',
    'cleanup-options': 'Opciones de limpieza',
    'cookies': 'Cookies',
    'cookies-desc': 'Eliminar todas las cookies y datos de sitios',
    'cache': 'Caché',
    'cache-desc': 'Vaciar la caché del navegador y archivos temporales',
    'history': 'Historial',
    'history-desc': 'Eliminar el historial de navegación',
    'downloads': 'Descargas',
    'downloads-desc': 'Borrar el historial de descargas',
    'passwords': 'Contraseñas guardadas',
    'passwords-desc': 'Eliminar contraseñas guardadas (úsalo con precaución)',
    'form-data': 'Datos de formularios',
    'form-data-desc': 'Borrar datos de formularios y autocompletado',
    'auto-schedule': 'Programación automática',
    'schedule-none': 'Sin programación automática',
    'schedule-hourly': 'Cada hora',
    'schedule-daily': 'Diariamente',
    'schedule-weekly': 'Semanalmente',
    'site-management': 'Gestión de sitios',
    'site-management-desc': 'Los sitios de la lista blanca se omiten al borrar cookies y caché (el navegador no puede excluir sitios concretos del historial ni de las descargas). La lista negra se guarda solo como referencia y no se aplica.',
    'whitelist': 'Lista blanca',
    'blacklist': 'Lista negra',
    'whitelist-placeholder': 'Introduce un dominio (p. ej., example.com)',
    'blacklist-placeholder': 'Introduce un dominio (p. ej., tracking.com)',
    'add': 'Añadir',
    'remove': 'Quitar',
    'statistics': 'Estadísticas',
    'total-cleanups': 'Limpiezas totales',
    'last-cleanup': 'Última limpieza',
    'sensitive-sites': 'Sitios sensibles visitados',
    'never': 'Nunca',
    'save-settings': 'Guardar configuración',
    'reset-settings': 'Restablecer valores',
    'export-settings': 'Exportar configuración',
    'import-settings': 'Importar configuración',
    'footer-tagline': 'Protección profesional de privacidad',
    'msg-saved': '¡Configuración guardada correctamente!',
    'msg-save-failed': 'No se pudo guardar la configuración',
    'msg-exported': '¡Configuración exportada correctamente!',
    'msg-imported': '¡Configuración importada correctamente!',
    'msg-import-failed': 'No se pudo importar la configuración. Formato de archivo no válido.',
    'confirm-reset': '¿Seguro que quieres restablecer toda la configuración a los valores predeterminados?'
  },
  ru: {
    'page-title': 'Web Privacy - Настройки',
    'header-title': 'Настройки Web Privacy',
    'logo': 'Логотип',
    'general-settings': 'Общие настройки',
    'show-notifications': 'Показывать уведомления',
    'show-notifications-desc': 'Сообщать о завершении очистки',
    'language': 'Язык',
    'cleanup-options': 'Опции очистки',
    'cookies': 'Cookies',
    'cookies-desc': 'Удалить все cookies и данные сайтов',
    'cache': 'Кэш',
    'cache-desc': 'Очистить кэш браузера и временные файлы',
    'history': 'История',
    'history-desc': 'Удалить историю просмотров',
    'downloads': 'Загрузки',
    'downloads-desc': 'Очистить историю загрузок',
    'passwords': 'Сохранённые пароли',
    'passwords-desc': 'Удалить сохранённые пароли (используйте осторожно)',
    'form-data': 'Данные форм',
    'form-data-desc': 'Очистить сохранённые данные форм и автозаполнение',
    'auto-schedule': 'Автоочистка по расписанию',
    'schedule-none': 'Без расписания',
    'schedule-hourly': 'Каждый час',
    'schedule-daily': 'Ежедневно',
    'schedule-weekly': 'Еженедельно',
    'site-management': 'Управление сайтами',
    'site-management-desc': 'Сайты из белого списка пропускаются при очистке cookies и кэша (браузер не умеет исключать отдельные сайты из очистки истории и загрузок). Чёрный список сохраняется только для справки и не применяется.',
    'whitelist': 'Белый список',
    'blacklist': 'Чёрный список',
    'whitelist-placeholder': 'Введите домен (например, example.com)',
    'blacklist-placeholder': 'Введите домен (например, tracking.com)',
    'add': 'Добавить',
    'remove': 'Удалить',
    'statistics': 'Статистика',
    'total-cleanups': 'Всего очисток',
    'last-cleanup': 'Последняя очистка',
    'sensitive-sites': 'Посещено чувствительных сайтов',
    'never': 'Никогда',
    'save-settings': 'Сохранить настройки',
    'reset-settings': 'Сбросить по умолчанию',
    'export-settings': 'Экспорт настроек',
    'import-settings': 'Импорт настроек',
    'footer-tagline': 'Профессиональная защита приватности',
    'msg-saved': 'Настройки успешно сохранены!',
    'msg-save-failed': 'Не удалось сохранить настройки',
    'msg-exported': 'Настройки успешно экспортированы!',
    'msg-imported': 'Настройки успешно импортированы!',
    'msg-import-failed': 'Не удалось импортировать настройки. Неверный формат файла.',
    'confirm-reset': 'Сбросить все настройки к значениям по умолчанию?'
  },
  zh: {
    'page-title': 'Web Privacy - 设置',
    'header-title': 'Web Privacy 设置',
    'logo': '标志',
    'general-settings': '常规设置',
    'show-notifications': '显示通知',
    'show-notifications-desc': '清理完成时通知我',
    'language': '语言',
    'cleanup-options': '清理选项',
    'cookies': 'Cookie',
    'cookies-desc': '删除所有 Cookie 和网站数据',
    'cache': '缓存',
    'cache-desc': '清除浏览器缓存和临时文件',
    'history': '历史记录',
    'history-desc': '删除浏览记录',
    'downloads': '下载',
    'downloads-desc': '清除下载记录',
    'passwords': '已保存的密码',
    'passwords-desc': '删除已保存的密码（请谨慎使用）',
    'form-data': '表单数据',
    'form-data-desc': '清除已保存的表单数据和自动填充',
    'auto-schedule': '自动计划',
    'schedule-none': '不自动清理',
    'schedule-hourly': '每小时',
    'schedule-daily': '每天',
    'schedule-weekly': '每周',
    'site-management': '网站管理',
    'site-management-desc': '清除 Cookie 和缓存时会跳过白名单中的网站（浏览器无法在清除历史记录或下载记录时排除单个网站）。黑名单仅保存供您参考，不会生效。',
    'whitelist': '白名单',
    'blacklist': '黑名单',
    'whitelist-placeholder': '输入域名（例如 example.com）',
    'blacklist-placeholder': '输入域名（例如 tracking.com）',
    'add': '添加',
    'remove': '移除',
    'statistics': '统计',
    'total-cleanups': '清理总次数',
    'last-cleanup': '上次清理',
    'sensitive-sites': '访问过的敏感网站',
    'never': '从未',
    'save-settings': '保存设置',
    'reset-settings': '恢复默认',
    'export-settings': '导出设置',
    'import-settings': '导入设置',
    'footer-tagline': '专业隐私保护',
    'msg-saved': '设置已成功保存！',
    'msg-save-failed': '保存设置失败',
    'msg-exported': '设置已成功导出！',
    'msg-imported': '设置已成功导入！',
    'msg-import-failed': '导入设置失败。文件格式无效。',
    'confirm-reset': '确定要将所有设置恢复为默认值吗？'
  },
  hi: {
    'page-title': 'Web Privacy - सेटिंग',
    'header-title': 'Web Privacy सेटिंग',
    'logo': 'लोगो',
    'general-settings': 'सामान्य सेटिंग',
    'show-notifications': 'सूचनाएँ दिखाएँ',
    'show-notifications-desc': 'सफ़ाई पूरी होने पर सूचना पाएँ',
    'language': 'भाषा',
    'cleanup-options': 'सफ़ाई विकल्प',
    'cookies': 'कुकीज़',
    'cookies-desc': 'सभी कुकीज़ और साइट डेटा हटाएँ',
    'cache': 'कैश',
    'cache-desc': 'ब्राउज़र कैश और अस्थायी फ़ाइलें साफ़ करें',
    'history': 'इतिहास',
    'history-desc': 'ब्राउज़िंग इतिहास हटाएँ',
    'downloads': 'डाउनलोड',
    'downloads-desc': 'डाउनलोड इतिहास साफ़ करें',
    'passwords': 'सेव किए गए पासवर्ड',
    'passwords-desc': 'सेव किए गए पासवर्ड हटाएँ (सावधानी से इस्तेमाल करें)',
    'form-data': 'फ़ॉर्म डेटा',
    'form-data-desc': 'सेव किया गया फ़ॉर्म डेटा और ऑटोफ़िल साफ़ करें',
    'auto-schedule': 'ऑटो शेड्यूल',
    'schedule-none': 'कोई ऑटो शेड्यूल नहीं',
    'schedule-hourly': 'हर घंटे',
    'schedule-daily': 'रोज़',
    'schedule-weekly': 'हर हफ़्ते',
    'site-management': 'साइट प्रबंधन',
    'site-management-desc': 'कुकीज़ और कैश साफ़ करते समय व्हाइटलिस्ट की साइटें छोड़ दी जाती हैं (ब्राउज़र इतिहास या डाउनलोड की सफ़ाई से अलग-अलग साइटों को बाहर नहीं रख सकता)। ब्लैकलिस्ट सिर्फ़ आपके संदर्भ के लिए सेव होती है, लागू नहीं होती।',
    'whitelist': 'व्हाइटलिस्ट',
    'blacklist': 'ब्लैकलिस्ट',
    'whitelist-placeholder': 'डोमेन लिखें (जैसे example.com)',
    'blacklist-placeholder': 'डोमेन लिखें (जैसे tracking.com)',
    'add': 'जोड़ें',
    'remove': 'हटाएँ',
    'statistics': 'आँकड़े',
    'total-cleanups': 'कुल सफ़ाई',
    'last-cleanup': 'पिछली सफ़ाई',
    'sensitive-sites': 'देखी गई संवेदनशील साइटें',
    'never': 'कभी नहीं',
    'save-settings': 'सेटिंग सेव करें',
    'reset-settings': 'डिफ़ॉल्ट पर रीसेट करें',
    'export-settings': 'सेटिंग एक्सपोर्ट करें',
    'import-settings': 'सेटिंग इंपोर्ट करें',
    'footer-tagline': 'पेशेवर प्राइवेसी सुरक्षा',
    'msg-saved': 'सेटिंग सफलतापूर्वक सेव हो गईं!',
    'msg-save-failed': 'सेटिंग सेव नहीं हो सकीं',
    'msg-exported': 'सेटिंग सफलतापूर्वक एक्सपोर्ट हो गईं!',
    'msg-imported': 'सेटिंग सफलतापूर्वक इंपोर्ट हो गईं!',
    'msg-import-failed': 'सेटिंग इंपोर्ट नहीं हो सकीं। फ़ाइल का फ़ॉर्मैट अमान्य है।',
    'confirm-reset': 'क्या आप सभी सेटिंग डिफ़ॉल्ट पर रीसेट करना चाहते हैं?'
  }
};

const DATE_LOCALES = { en: 'en-US', ru: 'ru-RU', es: 'es-ES', zh: 'zh-CN', hi: 'hi-IN' };

// Same rule as popup.js: saved choice (chrome.storage.sync webPrivacyLanguage),
// else the browser language, else 'ru'.
let currentLanguage = 'ru';

function detectLanguage() {
  const browserLang = (navigator.language || '').split('-')[0];
  return OPTIONS_I18N[browserLang] ? browserLang : 'ru';
}

function t(key) {
  return (OPTIONS_I18N[currentLanguage] && OPTIONS_I18N[currentLanguage][key]) || OPTIONS_I18N.en[key] || key;
}

function syncUiLanguage() {
  try {
    chrome.storage.local.set({ ui_language: currentLanguage }).catch(() => {});
  } catch (error) {}
}

async function loadLanguage() {
  try {
    const result = await chrome.storage.sync.get(['webPrivacyLanguage']);
    currentLanguage = OPTIONS_I18N[result.webPrivacyLanguage] ? result.webPrivacyLanguage : detectLanguage();
  } catch (error) {
    console.error('Failed to load language:', error);
    currentLanguage = detectLanguage();
  }
  syncUiLanguage();
}

function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
  });
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.textContent = t('remove');
  });
  const select = document.getElementById('options-language-select');
  if (select) select.value = currentLanguage;
  updateLastCleanup();
}

function setLanguage(lang) {
  if (!OPTIONS_I18N[lang]) return;
  currentLanguage = lang;
  syncUiLanguage();
  try {
    chrome.storage.sync.set({ webPrivacyLanguage: lang }).catch(() => {});
  } catch (error) {}
  applyTranslations();
}

function updateLastCleanup() {
  const el = document.getElementById('last-cleanup');
  if (!el) return;
  el.textContent = stats.lastCleanup
    ? new Date(stats.lastCleanup).toLocaleString(DATE_LOCALES[currentLanguage] || 'en-US')
    : t('never');
}

try {
  chrome.storage.onChanged.addListener((changes, area) => {
    const change = (area === 'sync' && changes.webPrivacyLanguage) || (area === 'local' && changes.ui_language);
    if (change && OPTIONS_I18N[change.newValue] && change.newValue !== currentLanguage) {
      currentLanguage = change.newValue;
      applyTranslations();
    }
  });
} catch (error) {}

let settings = {
  notifications: true,
  cookies: true,
  cache: true,
  history: false,
  downloads: false,
  passwords: false,
  formData: false,
  schedule: 'none',
  whitelist: [],
  blacklist: []
};

let stats = {
  totalCleanups: 0,
  lastCleanup: null,
  sensitiveSites: 0
};

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadLanguage();
  await loadSettings();
  await loadStats();
  setupEventListeners();
  updateUI();
  applyTranslations();
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
    applySchedule();
    showNotification(t('msg-saved'), 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showNotification(t('msg-save-failed'), 'error');
  }
}

// The alarm-based auto-cleanup schedule lives in the background service
// worker (chrome.alarms). Tell it about the current choice every time
// settings are saved -- background.js already knows how to turn this into
// a recurring alarm (or cancel one) via these two message actions.
function applySchedule() {
  if (settings.schedule && settings.schedule !== 'none') {
    chrome.runtime.sendMessage({ action: 'schedule-cleanup', data: { schedule: settings.schedule } });
  } else {
    chrome.runtime.sendMessage({ action: 'cancel-schedule' });
  }
}

async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['cleanupCount', 'lastCleanup', 'sensitiveSiteVisits']);
    stats.totalCleanups = result.cleanupCount || 0;
    stats.lastCleanup = result.lastCleanup || null;
    stats.sensitiveSites = (result.sensitiveSiteVisits || []).length;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function setupEventListeners() {
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // Export settings button
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  
  // Import settings button
  document.getElementById('import-settings').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  // Import file input
  document.getElementById('import-file').addEventListener('change', importSettings);
  
  // General settings
  document.getElementById('notifications').addEventListener('change', (e) => {
    settings.notifications = e.target.checked;
  });

  // Cleanup options
  document.getElementById('cookies').addEventListener('change', (e) => {
    settings.cookies = e.target.checked;
  });
  
  document.getElementById('cache').addEventListener('change', (e) => {
    settings.cache = e.target.checked;
  });
  
  document.getElementById('history').addEventListener('change', (e) => {
    settings.history = e.target.checked;
  });
  
  document.getElementById('downloads').addEventListener('change', (e) => {
    settings.downloads = e.target.checked;
  });
  
  document.getElementById('passwords').addEventListener('change', (e) => {
    settings.passwords = e.target.checked;
  });
  
  document.getElementById('form-data').addEventListener('change', (e) => {
    settings.formData = e.target.checked;
  });
  
  // Schedule options
  document.querySelectorAll('input[name="schedule"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      settings.schedule = e.target.value;
    });
  });
  
  
  document.getElementById('options-language-select').addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });

  // Whitelist/Blacklist
  document.getElementById('add-whitelist').addEventListener('click', addToWhitelist);
  document.getElementById('add-blacklist').addEventListener('click', addToBlacklist);
}

function updateUI() {
  // Update checkboxes
  document.getElementById('notifications').checked = settings.notifications;
  document.getElementById('cookies').checked = settings.cookies;
  document.getElementById('cache').checked = settings.cache;
  document.getElementById('history').checked = settings.history;
  document.getElementById('downloads').checked = settings.downloads;
  document.getElementById('passwords').checked = settings.passwords;
  document.getElementById('form-data').checked = settings.formData;
  
  // Update radio buttons
  document.querySelector(`input[name="schedule"][value="${settings.schedule}"]`).checked = true;
  
  // Update stats
  document.getElementById('total-cleanups').textContent = stats.totalCleanups;
  updateLastCleanup();
  document.getElementById('financial-sites').textContent = stats.sensitiveSites;
  
  // Update whitelist/blacklist
  updateWhitelist();
  updateBlacklist();
}

function updateWhitelist() {
  const whitelistContainer = document.getElementById('whitelist');
  const existingItems = whitelistContainer.querySelectorAll('.site-item:not(:first-child)');
  existingItems.forEach(item => item.remove());
  
  settings.whitelist.forEach(domain => {
    const item = createSiteItem(domain, 'whitelist');
    whitelistContainer.appendChild(item);
  });
}

function updateBlacklist() {
  const blacklistContainer = document.getElementById('blacklist');
  const existingItems = blacklistContainer.querySelectorAll('.site-item:not(:first-child)');
  existingItems.forEach(item => item.remove());
  
  settings.blacklist.forEach(domain => {
    const item = createSiteItem(domain, 'blacklist');
    blacklistContainer.appendChild(item);
  });
}

function createSiteItem(domain, type) {
  const item = document.createElement('div');
  item.className = 'site-item';
  const label = document.createElement('span');
  label.className = 'domain';
  label.textContent = domain;
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = t('remove');
  removeBtn.addEventListener('click', () => removeFromList(domain, type));
  item.append(label, removeBtn);
  
  return item;
}

// Accept "example.com", "https://example.com/path" or "*.example.com";
// store the bare hostname. Returns '' for anything that isn't a hostname.
function normalizeDomain(raw) {
  const host = String(raw).trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/^\*\./, '');
  return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(host) ? host : '';
}

function addToWhitelist() {
  const input = document.getElementById('whitelist-input');
  const domain = normalizeDomain(input.value);
  
  if (domain && !settings.whitelist.includes(domain)) {
    settings.whitelist.push(domain);
    input.value = '';
    updateWhitelist();
  }
}

function addToBlacklist() {
  const input = document.getElementById('blacklist-input');
  const domain = normalizeDomain(input.value);
  
  if (domain && !settings.blacklist.includes(domain)) {
    settings.blacklist.push(domain);
    input.value = '';
    updateBlacklist();
  }
}

function removeFromList(domain, type) {
  if (type === 'whitelist') {
    settings.whitelist = settings.whitelist.filter(d => d !== domain);
    updateWhitelist();
  } else if (type === 'blacklist') {
    settings.blacklist = settings.blacklist.filter(d => d !== domain);
    updateBlacklist();
  }
}

async function resetSettings() {
  if (confirm(t('confirm-reset'))) {
    settings = {
      notifications: true,
      cookies: true,
      cache: true,
      history: false,
      downloads: false,
      passwords: false,
      formData: false,
      schedule: 'none',
      whitelist: [],
      blacklist: []
    };
    
    await saveSettings();
    updateUI();
  }
}

function exportSettings() {
  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'web-privacy-settings.json';
  link.click();
  
  URL.revokeObjectURL(url);
  showNotification(t('msg-exported'), 'success');
}

function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
        throw new Error('Not a settings object');
      }
      const clean = {};
      for (const key of ['notifications', 'cookies', 'cache', 'history', 'downloads', 'passwords', 'formData']) {
        if (typeof imported[key] === 'boolean') clean[key] = imported[key];
      }
      if (['none', 'hourly', 'daily', 'weekly'].includes(imported.schedule)) clean.schedule = imported.schedule;
      for (const key of ['whitelist', 'blacklist']) {
        if (Array.isArray(imported[key])) {
          clean[key] = [...new Set(imported[key].map(normalizeDomain).filter(Boolean))];
        }
      }
      settings = { ...settings, ...clean };
      saveSettings();
      updateUI();
      showNotification(t('msg-imported'), 'success');
    } catch (error) {
      console.error('Failed to import settings:', error);
      showNotification(t('msg-import-failed'), 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : '#28a745'};
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}