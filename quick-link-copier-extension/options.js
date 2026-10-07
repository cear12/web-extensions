// Options page script for QuickLink Copier Extension
// Handles settings management and data operations

(() => {
  'use strict';

  // DOM elements
  const $ = (sel) => document.querySelector(sel);

  // State
  let settings = { showNotifications: true, autoTags: true, maxHistorySize: 10 };
  let linkHistory = [];
  let stats = { totalCopied: 0, dailyCopied: 0 };

  // Translations (language is chosen in the popup and shared via localStorage)
  const translations = {
    en: {
      'page-title': 'Settings — QuickLink Copier',
      'heading': 'QuickLink Copier Settings',
      'logo': 'Logo',
      'general-settings': 'General Settings',
      'show-notifications': 'Show notifications when copying links',
      'auto-tags': 'Automatically generate tags for links',
      'max-history-size': 'Max history size',
      'max-history-hint': 'Between 5 and 1000 links',
      'save-settings': 'Save Settings',
      'link-history': 'Link History',
      'total-links': 'Total Links',
      'times-copied': 'Times Copied',
      'clear-all-history': 'Clear All History',
      'export-history': 'Export History',
      'recent-links': 'Recent Links',
      'data-management': 'Data Management',
      'export-all-data': 'Export All Data',
      'import-data': 'Import Data',
      'reset-all-data': 'Reset All Data',
      'data-help': 'Export a full backup of your link history and settings as a JSON file, or import a previously-exported backup to restore it.',
      'about': 'About',
      'version': 'Version',
      'about-desc': 'One-click link copying with history and export features.',
      'developed-by': 'Developed by:',
      'support': 'Support:',
      'privacy-policy': 'Privacy Policy',
      'terms-of-service': 'Terms of Service',
      'report-issue': 'Report Issue',
      'settings-saved': 'Settings saved successfully!',
      'settings-save-failed': 'Failed to save settings',
      'confirm-clear-history': 'Are you sure you want to clear all link history? This action cannot be undone.',
      'history-cleared': 'History cleared successfully!',
      'clear-history-failed': 'Failed to clear history',
      'no-history-export': 'No history to export',
      'history-exported': 'History exported successfully!',
      'export-history-failed': 'Failed to export history',
      'data-exported': 'All data exported successfully!',
      'export-data-failed': 'Failed to export data',
      'file-too-large': 'Backup file is too large.',
      'data-imported': 'Data imported successfully!',
      'import-failed': 'Failed to import data. Please check the file format.',
      'confirm-reset': 'Are you sure you want to reset ALL data? This will clear your history, settings, and stats. This action cannot be undone.',
      'confirm-reset-final': 'This is your final warning. All data will be permanently deleted. Continue?',
      'data-reset': 'All data has been reset',
      'reset-failed': 'Failed to reset data',
      'no-links': 'No links in history',
      'just-now': 'Just now',
      'minutes-ago': 'm ago',
      'hours-ago': 'h ago',
      'days-ago': 'd ago'
    },
    es: {
      'page-title': 'Configuración — QuickLink Copier',
      'heading': 'Configuración de QuickLink Copier',
      'logo': 'Logotipo',
      'general-settings': 'Configuración general',
      'show-notifications': 'Mostrar notificaciones al copiar enlaces',
      'auto-tags': 'Generar etiquetas automáticamente para los enlaces',
      'max-history-size': 'Tamaño máximo del historial',
      'max-history-hint': 'Entre 5 y 1000 enlaces',
      'save-settings': 'Guardar configuración',
      'link-history': 'Historial de enlaces',
      'total-links': 'Enlaces totales',
      'times-copied': 'Veces copiado',
      'clear-all-history': 'Borrar todo el historial',
      'export-history': 'Exportar historial',
      'recent-links': 'Enlaces recientes',
      'data-management': 'Gestión de datos',
      'export-all-data': 'Exportar todos los datos',
      'import-data': 'Importar datos',
      'reset-all-data': 'Restablecer todos los datos',
      'data-help': 'Exporta una copia de seguridad completa de tu historial de enlaces y configuración como archivo JSON, o importa una copia exportada anteriormente para restaurarla.',
      'about': 'Acerca de',
      'version': 'Versión',
      'about-desc': 'Copia de enlaces con un clic, con historial y funciones de exportación.',
      'developed-by': 'Desarrollado por:',
      'support': 'Soporte:',
      'privacy-policy': 'Política de privacidad',
      'terms-of-service': 'Términos de servicio',
      'report-issue': 'Informar de un problema',
      'settings-saved': '¡Configuración guardada correctamente!',
      'settings-save-failed': 'Error al guardar la configuración',
      'confirm-clear-history': '¿Seguro que quieres borrar todo el historial de enlaces? Esta acción no se puede deshacer.',
      'history-cleared': '¡Historial borrado correctamente!',
      'clear-history-failed': 'Error al borrar el historial',
      'no-history-export': 'No hay historial para exportar',
      'history-exported': '¡Historial exportado correctamente!',
      'export-history-failed': 'Error al exportar el historial',
      'data-exported': '¡Todos los datos se exportaron correctamente!',
      'export-data-failed': 'Error al exportar los datos',
      'file-too-large': 'El archivo de copia de seguridad es demasiado grande.',
      'data-imported': '¡Datos importados correctamente!',
      'import-failed': 'Error al importar los datos. Comprueba el formato del archivo.',
      'confirm-reset': '¿Seguro que quieres restablecer TODOS los datos? Se borrarán tu historial, configuración y estadísticas. Esta acción no se puede deshacer.',
      'confirm-reset-final': 'Esta es tu última advertencia. Todos los datos se eliminarán de forma permanente. ¿Continuar?',
      'data-reset': 'Todos los datos se han restablecido',
      'reset-failed': 'Error al restablecer los datos',
      'no-links': 'No hay enlaces en el historial',
      'just-now': 'Ahora mismo',
      'minutes-ago': 'm atrás',
      'hours-ago': 'h atrás',
      'days-ago': 'd atrás'
    },
    ru: {
      'page-title': 'Настройки — QuickLink Copier',
      'heading': 'Настройки QuickLink Copier',
      'logo': 'Логотип',
      'general-settings': 'Общие настройки',
      'show-notifications': 'Показывать уведомления при копировании ссылок',
      'auto-tags': 'Автоматически создавать теги для ссылок',
      'max-history-size': 'Максимальный размер истории',
      'max-history-hint': 'От 5 до 1000 ссылок',
      'save-settings': 'Сохранить настройки',
      'link-history': 'История ссылок',
      'total-links': 'Всего ссылок',
      'times-copied': 'Раз скопировано',
      'clear-all-history': 'Очистить всю историю',
      'export-history': 'Экспорт истории',
      'recent-links': 'Недавние ссылки',
      'data-management': 'Управление данными',
      'export-all-data': 'Экспорт всех данных',
      'import-data': 'Импорт данных',
      'reset-all-data': 'Сбросить все данные',
      'data-help': 'Экспортируйте полную резервную копию истории ссылок и настроек в файл JSON или импортируйте ранее экспортированную копию, чтобы восстановить её.',
      'about': 'О программе',
      'version': 'Версия',
      'about-desc': 'Копирование ссылок в один клик с историей и экспортом.',
      'developed-by': 'Разработчик:',
      'support': 'Поддержка:',
      'privacy-policy': 'Политика конфиденциальности',
      'terms-of-service': 'Условия использования',
      'report-issue': 'Сообщить о проблеме',
      'settings-saved': 'Настройки успешно сохранены!',
      'settings-save-failed': 'Не удалось сохранить настройки',
      'confirm-clear-history': 'Вы уверены, что хотите очистить всю историю ссылок? Это действие нельзя отменить.',
      'history-cleared': 'История успешно очищена!',
      'clear-history-failed': 'Не удалось очистить историю',
      'no-history-export': 'Нет истории для экспорта',
      'history-exported': 'История успешно экспортирована!',
      'export-history-failed': 'Не удалось экспортировать историю',
      'data-exported': 'Все данные успешно экспортированы!',
      'export-data-failed': 'Не удалось экспортировать данные',
      'file-too-large': 'Файл резервной копии слишком большой.',
      'data-imported': 'Данные успешно импортированы!',
      'import-failed': 'Не удалось импортировать данные. Проверьте формат файла.',
      'confirm-reset': 'Вы уверены, что хотите сбросить ВСЕ данные? Будут удалены история, настройки и статистика. Это действие нельзя отменить.',
      'confirm-reset-final': 'Это последнее предупреждение. Все данные будут удалены безвозвратно. Продолжить?',
      'data-reset': 'Все данные сброшены',
      'reset-failed': 'Не удалось сбросить данные',
      'no-links': 'В истории нет ссылок',
      'just-now': 'Только что',
      'minutes-ago': 'м назад',
      'hours-ago': 'ч назад',
      'days-ago': 'д назад'
    },
    zh: {
      'page-title': '设置 — QuickLink Copier',
      'heading': 'QuickLink Copier 设置',
      'logo': '标志',
      'general-settings': '常规设置',
      'show-notifications': '复制链接时显示通知',
      'auto-tags': '自动为链接生成标签',
      'max-history-size': '最大历史记录数',
      'max-history-hint': '5 到 1000 个链接',
      'save-settings': '保存设置',
      'link-history': '链接历史',
      'total-links': '链接总数',
      'times-copied': '复制次数',
      'clear-all-history': '清除全部历史',
      'export-history': '导出历史',
      'recent-links': '最近链接',
      'data-management': '数据管理',
      'export-all-data': '导出全部数据',
      'import-data': '导入数据',
      'reset-all-data': '重置全部数据',
      'data-help': '将链接历史和设置完整备份导出为 JSON 文件，或导入之前导出的备份进行恢复。',
      'about': '关于',
      'version': '版本',
      'about-desc': '一键复制链接，支持历史记录和导出功能。',
      'developed-by': '开发者：',
      'support': '支持：',
      'privacy-policy': '隐私政策',
      'terms-of-service': '服务条款',
      'report-issue': '报告问题',
      'settings-saved': '设置已成功保存！',
      'settings-save-failed': '保存设置失败',
      'confirm-clear-history': '确定要清除全部链接历史吗？此操作无法撤销。',
      'history-cleared': '历史记录已成功清除！',
      'clear-history-failed': '清除历史记录失败',
      'no-history-export': '没有可导出的历史记录',
      'history-exported': '历史记录已成功导出！',
      'export-history-failed': '导出历史记录失败',
      'data-exported': '全部数据已成功导出！',
      'export-data-failed': '导出数据失败',
      'file-too-large': '备份文件过大。',
      'data-imported': '数据已成功导入！',
      'import-failed': '导入数据失败，请检查文件格式。',
      'confirm-reset': '确定要重置全部数据吗？这将清除您的历史记录、设置和统计数据。此操作无法撤销。',
      'confirm-reset-final': '这是最后一次警告。所有数据将被永久删除。是否继续？',
      'data-reset': '全部数据已重置',
      'reset-failed': '重置数据失败',
      'no-links': '历史记录中没有链接',
      'just-now': '刚刚',
      'minutes-ago': '分钟前',
      'hours-ago': '小时前',
      'days-ago': '天前'
    },
    hi: {
      'page-title': 'सेटिंग — QuickLink Copier',
      'heading': 'QuickLink Copier सेटिंग',
      'logo': 'लोगो',
      'general-settings': 'सामान्य सेटिंग',
      'show-notifications': 'लिंक कॉपी करने पर सूचनाएँ दिखाएँ',
      'auto-tags': 'लिंक के लिए टैग अपने-आप बनाएँ',
      'max-history-size': 'इतिहास का अधिकतम आकार',
      'max-history-hint': '5 से 1000 लिंक के बीच',
      'save-settings': 'सेटिंग सहेजें',
      'link-history': 'लिंक इतिहास',
      'total-links': 'कुल लिंक',
      'times-copied': 'कितनी बार कॉपी हुआ',
      'clear-all-history': 'पूरा इतिहास साफ़ करें',
      'export-history': 'इतिहास एक्सपोर्ट करें',
      'recent-links': 'हाल के लिंक',
      'data-management': 'डेटा प्रबंधन',
      'export-all-data': 'सारा डेटा एक्सपोर्ट करें',
      'import-data': 'डेटा इम्पोर्ट करें',
      'reset-all-data': 'सारा डेटा रीसेट करें',
      'data-help': 'अपने लिंक इतिहास और सेटिंग का पूरा बैकअप JSON फ़ाइल के रूप में एक्सपोर्ट करें, या पहले एक्सपोर्ट किया गया बैकअप इम्पोर्ट करके उसे वापस लाएँ।',
      'about': 'परिचय',
      'version': 'संस्करण',
      'about-desc': 'इतिहास और एक्सपोर्ट सुविधाओं के साथ एक क्लिक में लिंक कॉपी करें।',
      'developed-by': 'विकसित करने वाले:',
      'support': 'सहायता:',
      'privacy-policy': 'प्राइवेसी नीति',
      'terms-of-service': 'सेवा की शर्तें',
      'report-issue': 'समस्या की रिपोर्ट करें',
      'settings-saved': 'सेटिंग सहेज ली गईं!',
      'settings-save-failed': 'सेटिंग सहेजी नहीं जा सकीं',
      'confirm-clear-history': 'क्या आप वाकई पूरा लिंक इतिहास साफ़ करना चाहते हैं? इसे पहले जैसा नहीं किया जा सकता।',
      'history-cleared': 'इतिहास साफ़ हो गया!',
      'clear-history-failed': 'इतिहास साफ़ नहीं हो सका',
      'no-history-export': 'एक्सपोर्ट करने के लिए कोई इतिहास नहीं है',
      'history-exported': 'इतिहास एक्सपोर्ट हो गया!',
      'export-history-failed': 'इतिहास एक्सपोर्ट नहीं हो सका',
      'data-exported': 'सारा डेटा एक्सपोर्ट हो गया!',
      'export-data-failed': 'डेटा एक्सपोर्ट नहीं हो सका',
      'file-too-large': 'बैकअप फ़ाइल बहुत बड़ी है।',
      'data-imported': 'डेटा इम्पोर्ट हो गया!',
      'import-failed': 'डेटा इम्पोर्ट नहीं हो सका। कृपया फ़ाइल का फ़ॉर्मैट जाँचें।',
      'confirm-reset': 'क्या आप वाकई सारा डेटा रीसेट करना चाहते हैं? इससे आपका इतिहास, सेटिंग और आँकड़े मिट जाएँगे। इसे पहले जैसा नहीं किया जा सकता।',
      'confirm-reset-final': 'यह आख़िरी चेतावनी है। सारा डेटा हमेशा के लिए मिट जाएगा। जारी रखें?',
      'data-reset': 'सारा डेटा रीसेट हो गया',
      'reset-failed': 'डेटा रीसेट नहीं हो सका',
      'no-links': 'इतिहास में कोई लिंक नहीं है',
      'just-now': 'अभी-अभी',
      'minutes-ago': 'मि. पहले',
      'hours-ago': 'घं. पहले',
      'days-ago': 'दिन पहले'
    }
  };

  const LANGUAGE_KEY = 'quicklink_language';
  const DATE_LOCALES = { en: 'en-US', ru: 'ru-RU', es: 'es-ES', zh: 'zh-CN', hi: 'hi-IN' };
  let currentLanguage = 'en';

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      return saved && translations[saved] ? saved : 'en';
    } catch (_) {
      return 'en';
    }
  }

  function t(key) {
    const dict = translations[currentLanguage] || translations.en;
    return dict[key] || translations.en[key] || key;
  }

  function applyLanguage(lang) {
    currentLanguage = translations[lang] ? lang : 'en';
    try {
      chrome.storage.local.set({ ui_language: currentLanguage });
    } catch (error) {
      console.error('Error saving ui_language:', error);
    }
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    const attrs = { 'data-i18n-title': 'title', 'data-i18n-placeholder': 'placeholder', 'data-i18n-alt': 'alt', 'data-i18n-aria-label': 'aria-label' };
    Object.entries(attrs).forEach(([dataAttr, attr]) => {
      document.querySelectorAll(`[${dataAttr}]`).forEach((el) => {
        el.setAttribute(attr, t(el.getAttribute(dataAttr)));
      });
    });
  }
  
  // Initialize options page
  async function init() {
    try {
      applyLanguage(readSavedLanguage());
      window.addEventListener('storage', (e) => {
        if (e.key !== null && e.key !== LANGUAGE_KEY) return;
        applyLanguage(readSavedLanguage());
        updateRecentLinksPreview();
      });

      // Load data from storage
      await loadData();
      
      // Setup event listeners
      setupEventListeners();
      
      // Update UI
      updateUI();
      
    } catch (error) {
      console.error('Error initializing options page:', error);
    }
  }
  
  // Load data from Chrome storage
  async function loadData() {
    try {
      const data = await chrome.storage.local.get([
        'settings', 'linkHistory', 'stats'
      ]);

      settings = { ...settings, ...data.settings };
      linkHistory = data.linkHistory || [];
      stats = data.stats || { totalCopied: 0, dailyCopied: 0 };
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // General settings form
    const generalForm = $('#general-settings');
    if (generalForm) {
      generalForm.addEventListener('submit', handleGeneralSettingsSubmit);
    }
    
    // History management
    const clearHistoryBtn = $('#clear-history');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', handleClearHistory);
    }
    
    const exportHistoryBtn = $('#export-history');
    if (exportHistoryBtn) {
      exportHistoryBtn.addEventListener('click', handleExportHistory);
    }
    
    // Data management
    const exportDataBtn = $('#export-data');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', handleExportData);
    }
    
    const importDataBtn = $('#import-data');
    if (importDataBtn) {
      importDataBtn.addEventListener('click', handleImportData);
    }
    
    const resetDataBtn = $('#reset-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', handleResetData);
    }
  }
  
  // Handle general settings form submission
  async function handleGeneralSettingsSubmit(e) {
    e.preventDefault();
    
    try {
      const showNotifications = $('#show-notifications')?.checked ?? true;
      const autoTags = $('#auto-tags')?.checked ?? true;
      const maxHistory = parseInt($('#max-history')?.value ?? '10', 10);
      
      settings.showNotifications = showNotifications;
      settings.autoTags = autoTags;
      settings.maxHistorySize = Math.max(5, Math.min(1000, maxHistory));
      
      await chrome.storage.local.set({ settings });
      showMessage(t('settings-saved'), 'success');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage(t('settings-save-failed'), 'error');
    }
  }
  
  // Handle clear history
  async function handleClearHistory() {
    if (confirm(t('confirm-clear-history'))) {
      try {
        linkHistory = [];
        await chrome.storage.local.set({ linkHistory });
        updateUI();
        showMessage(t('history-cleared'), 'success');
      } catch (error) {
        console.error('Error clearing history:', error);
        showMessage(t('clear-history-failed'), 'error');
      }
    }
  }
  
  // Handle export history
  async function handleExportHistory() {
    if (linkHistory.length === 0) {
      showMessage(t('no-history-export'), 'error');
      return;
    }
    
    try {
      const data = {
        links: linkHistory,
        exportedAt: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `quicklink-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage(t('history-exported'), 'success');
      
    } catch (error) {
      console.error('Error exporting history:', error);
      showMessage(t('export-history-failed'), 'error');
    }
  }
  
  // Handle export all data
  async function handleExportData() {
    try {
      const allData = await chrome.storage.local.get(['linkHistory', 'settings', 'stats']);
      const exportData = {
        ...allData,
        exportedAt: new Date().toISOString(),
        version: chrome.runtime.getManifest().version
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `quicklink-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage(t('data-exported'), 'success');
      
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage(t('export-data-failed'), 'error');
    }
  }
  
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const MAX_HISTORY = 1000;

  // Validate and normalise an imported backup so malformed files can never
  // put the popup/options pages into a state they can't render.
  function sanitizeBackup(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.linkHistory)) {
      throw new Error('Invalid backup file format');
    }
    const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
    const linkHistory = [];
    for (const item of data.linkHistory.slice(0, MAX_HISTORY)) {
      if (!item || typeof item.url !== 'string' || !/^https?:\/\//i.test(item.url)) continue;
      let domain = str(item.domain, 253);
      if (!domain) {
        try { domain = new URL(item.url).hostname; } catch (_) { continue; }
      }
      linkHistory.push({
        url: str(item.url, 2048),
        title: str(item.title, 300) || item.url,
        domain,
        favicon: /^https?:\/\//i.test(item.favicon || '') ? str(item.favicon, 2048) : undefined,
        timestamp: Number.isFinite(item.timestamp) ? item.timestamp : Date.now(),
        tags: Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string').slice(0, 20).map((t) => t.slice(0, 50)) : []
      });
    }
    const src = data.settings && typeof data.settings === 'object' ? data.settings : {};
    const max = Number.parseInt(src.maxHistorySize, 10);
    const cleanSettings = {
      showNotifications: typeof src.showNotifications === 'boolean' ? src.showNotifications : settings.showNotifications,
      autoTags: typeof src.autoTags === 'boolean' ? src.autoTags : settings.autoTags,
      maxHistorySize: Number.isFinite(max) ? Math.max(5, Math.min(MAX_HISTORY, max)) : settings.maxHistorySize
    };
    const s = data.stats && typeof data.stats === 'object' ? data.stats : {};
    const count = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
    const cleanStats = {
      totalCopied: count(s.totalCopied),
      dailyCopied: count(s.dailyCopied),
      lastResetDate: typeof s.lastResetDate === 'string' ? s.lastResetDate : new Date().toDateString()
    };
    return { linkHistory, settings: cleanSettings, stats: cleanStats };
  }

  // Handle import data
  async function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > MAX_IMPORT_BYTES) {
        showMessage(t('file-too-large'), 'error');
        return;
      }
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const clean = sanitizeBackup(data);

        await chrome.storage.local.set(clean);

        // Reload data and update UI
        await loadData();
        updateUI();
        
        showMessage(t('data-imported'), 'success');
        
      } catch (error) {
        console.error('Error importing data:', error);
        showMessage(t('import-failed'), 'error');
      }
    });
    
    input.click();
  }
  
  // Handle reset all data
  async function handleResetData() {
    if (confirm(t('confirm-reset'))) {
      if (confirm(t('confirm-reset-final'))) {
        try {
          await chrome.storage.local.clear();
          applyLanguage(currentLanguage);
          await loadData();
          updateUI();
          showMessage(t('data-reset'), 'success');
        } catch (error) {
          console.error('Error resetting data:', error);
          showMessage(t('reset-failed'), 'error');
        }
      }
    }
  }
  
  // Escape text for safe interpolation into innerHTML templates (history
  // entries come from web pages and from imported backup files).
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  // Update UI
  function updateUI() {
    // Update settings checkboxes
    const showNotificationsCheckbox = $('#show-notifications');
    const autoTagsCheckbox = $('#auto-tags');
    const maxHistoryInput = $('#max-history');
    
    if (showNotificationsCheckbox) {
      showNotificationsCheckbox.checked = settings.showNotifications;
    }
    if (autoTagsCheckbox) {
      autoTagsCheckbox.checked = settings.autoTags;
    }
    if (maxHistoryInput) {
      maxHistoryInput.value = settings.maxHistorySize;
    }

    // Update stats
    updateStats();

    // Update recent links preview
    updateRecentLinksPreview();
  }

  // Update statistics
  function updateStats() {
    const totalLinksEl = $('#total-links');
    const totalCopiedEl = $('#total-copied');
    
    if (totalLinksEl) {
      totalLinksEl.textContent = linkHistory.length;
    }
    if (totalCopiedEl) {
      totalCopiedEl.textContent = stats.totalCopied;
    }
  }
  
  // Update recent links preview
  function updateRecentLinksPreview() {
    const recentLinksPreview = $('#recent-links-preview');
    if (!recentLinksPreview) return;
    
    const recentLinks = linkHistory.slice(0, 5);
    
    if (recentLinks.length === 0) {
      recentLinksPreview.innerHTML = `<div class="no-links">${escapeHtml(t('no-links'))}</div>`;
      return;
    }
    
    recentLinksPreview.innerHTML = recentLinks.map(link => {
      const timeAgo = getTimeAgo(link.timestamp);
      const rawTitle = String(link.title ?? link.url ?? '');
      const title = rawTitle.length > 40 ? rawTitle.substring(0, 40) + '...' : rawTitle;
      
      return `
        <div class="link-preview-item">
          <div class="link-info">
            <div class="link-title">${escapeHtml(title)}</div>
            <div class="link-domain">${escapeHtml(link.domain)}</div>
            <div class="link-time">${escapeHtml(timeAgo)}</div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Utility functions
  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return t('just-now');
    if (minutes < 60) return `${minutes}${t('minutes-ago')}`;
    if (hours < 24) return `${hours}${t('hours-ago')}`;
    if (days < 7) return `${days}${t('days-ago')}`;
    
    return new Date(timestamp).toLocaleDateString(DATE_LOCALES[currentLanguage] || 'en-US');
  }
  
  function showMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = $('#message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.id = 'message';
    messageEl.textContent = message;
    
    const colors = {
      success: '#34A853',
      error: '#EA4335',
      info: '#4285F4'
    };
    
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 4 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 4000);
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();