(() => {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));
  const translations = {
    en: {
      'page-title': 'Settings — QR Code Generator',
      'heading': 'Default Settings',
      'size': 'Size (px)',
      'module-color': 'Module Color',
      'background-color': 'Background Color',
      'error': 'Error Correction',
      'save': 'Save',
      'reset': 'Reset',
      'note': 'Settings are stored locally and applied in the popup.',
      'saved': 'Saved'
    },
    es: {
      'page-title': 'Configuración — QR Code Generator',
      'heading': 'Configuración predeterminada',
      'size': 'Tamaño (px)',
      'module-color': 'Color del módulo',
      'background-color': 'Color de fondo',
      'error': 'Corrección de errores',
      'save': 'Guardar',
      'reset': 'Restablecer',
      'note': 'La configuración se guarda localmente y se aplica en la ventana emergente.',
      'saved': 'Guardado'
    },
    ru: {
      'page-title': 'Настройки — QR Code Generator',
      'heading': 'Настройки по умолчанию',
      'size': 'Размер (px)',
      'module-color': 'Цвет модулей',
      'background-color': 'Цвет фона',
      'error': 'Коррекция ошибок',
      'save': 'Сохранить',
      'reset': 'Сбросить',
      'note': 'Настройки сохраняются локально и применяются во всплывающем окне.',
      'saved': 'Сохранено'
    },
    zh: {
      'page-title': '设置 — QR Code Generator',
      'heading': '默认设置',
      'size': '尺寸 (px)',
      'module-color': '模块颜色',
      'background-color': '背景颜色',
      'error': '纠错级别',
      'save': '保存',
      'reset': '重置',
      'note': '设置保存在本地，并应用于弹出窗口。',
      'saved': '已保存'
    },
    hi: {
      'page-title': 'सेटिंग्स — QR Code Generator',
      'heading': 'डिफ़ॉल्ट सेटिंग्स',
      'size': 'आकार (px)',
      'module-color': 'मॉड्यूल का रंग',
      'background-color': 'पृष्ठभूमि का रंग',
      'error': 'त्रुटि सुधार',
      'save': 'सहेजें',
      'reset': 'रीसेट करें',
      'note': 'सेटिंग्स स्थानीय रूप से सहेजी जाती हैं और पॉपअप में लागू होती हैं।',
      'saved': 'सहेजा गया'
    }
  };

  function getLanguage() {
    let lang = 'en';
    try { lang = localStorage.getItem('qr_language') || 'en'; } catch (e) { /* storage unavailable */ }
    return translations[lang] ? lang : 'en';
  }

  let currentLanguage = getLanguage();

  function t(key) {
    return (translations[currentLanguage] && translations[currentLanguage][key]) || translations.en[key] || key;
  }

  function applyTranslations() {
    currentLanguage = getLanguage();
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
  }

  applyTranslations();
  window.addEventListener('storage', (e) => {
    if (e.key === null || e.key === 'qr_language') applyTranslations();
  });

  const form = document.getElementById('defaults-form');
  const size = document.getElementById('d-size');
  const dark = document.getElementById('d-dark');
  const light = document.getElementById('d-light');
  const ec = document.getElementById('d-ec');
  const reset = document.getElementById('reset');

  function load() {
    let d = {};
    try { d = JSON.parse(localStorage.getItem('qr_defaults') || '{}') || {}; } catch (e) { /* ignore corrupted value */ }
    size.value = d.size || 256;
    dark.value = d.colorDark || '#000000';
    light.value = d.colorLight || '#ffffff';
    ec.value = d.ec || 'M';
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      size: Math.max(120, Math.min(1024, parseInt(size.value || '256', 10))),
      colorDark: dark.value || '#000000',
      colorLight: light.value || '#ffffff',
      ec: ec.value || 'M'
    };
    localStorage.setItem('qr_defaults', JSON.stringify(payload));
    alert(t('saved'));
  });

  reset.addEventListener('click', () => {
    localStorage.removeItem('qr_defaults');
    load();
  });

  load();
})();
