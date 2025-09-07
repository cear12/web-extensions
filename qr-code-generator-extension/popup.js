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
      'text-url': 'Text/URL',
      'wifi': 'WiFi',
      'contact': 'Contact',
      'data': 'Data',
      'enter-text-url': 'Enter text or URL',
      'result': 'Result',
      'download-png': 'Download PNG',
      'language': 'Language',
      'customization': 'Customization',
      'size': 'Size (px)',
      'error': 'Error',
      'module-color': 'Module Color',
      'background-color': 'Background Color',
      'settings': 'Settings',
      'about': 'About',
      'developed-by': 'Developed by',
      'menu': 'Menu',
      'qr-settings': 'Settings',
      'select-language': 'Select Language',
      'app-name': 'QR Code Generator',
      'app-version': 'Version 1.0',
      'app-developer': 'Developed by Olé',
      'reset-to-defaults': 'Reset to Defaults',
      'ssid': 'SSID',
      'password': 'Password',
      'encryption-type': 'Encryption Type',
      'hidden-network': 'Hidden Network',
      'no-password': 'No Password',
      'my-wifi': 'MyWiFi',
      'first-name': 'First Name',
      'last-name': 'Last Name',
      'phone': 'Phone',
      'email': 'Email',
      'company': 'Company',
      'position': 'Position',
      'first-name-placeholder': 'John',
      'last-name-placeholder': 'Doe',
      'phone-placeholder': '+1 555 123 4567',
      'email-placeholder': 'john@example.com',
      'company-placeholder': 'Company',
      'position-placeholder': 'Manager'
    },
    es: {
      'text-url': 'Texto/URL',
      'wifi': 'WiFi',
      'contact': 'Contacto',
      'data': 'Datos',
      'enter-text-url': 'Ingrese texto o URL',
      'result': 'Resultado',
      'download-png': 'Descargar PNG',
      'language': 'Idioma',
      'customization': 'Personalización',
      'size': 'Tamaño (px)',
      'error': 'Error',
      'module-color': 'Color del Módulo',
      'background-color': 'Color de Fondo',
      'settings': 'Configuración',
      'about': 'Acerca de',
      'developed-by': 'Desarrollado por',
      'menu': 'Menú',
      'qr-settings': 'Configuración',
      'select-language': 'Seleccionar Idioma',
      'app-name': 'Generador de Códigos QR',
      'app-version': 'Versión 1.0',
      'app-developer': 'Desarrollado por Olé',
      'reset-to-defaults': 'Restablecer Valores',
      'ssid': 'SSID',
      'password': 'Contraseña',
      'encryption-type': 'Tipo de Cifrado',
      'hidden-network': 'Red Oculta',
      'no-password': 'Sin Contraseña',
      'my-wifi': 'MiWiFi',
      'first-name': 'Nombre',
      'last-name': 'Apellido',
      'phone': 'Teléfono',
      'email': 'Email',
      'company': 'Empresa',
      'position': 'Cargo',
      'first-name-placeholder': 'Juan',
      'last-name-placeholder': 'Pérez',
      'phone-placeholder': '+1 555 123 4567',
      'email-placeholder': 'juan@ejemplo.com',
      'company-placeholder': 'Empresa',
      'position-placeholder': 'Gerente'
    },
    ru: {
      'text-url': 'Текст/URL',
      'wifi': 'WiFi',
      'contact': 'Контакт',
      'data': 'Данные',
      'enter-text-url': 'Введите текст или URL',
      'result': 'Результат',
      'download-png': 'Скачать PNG',
      'language': 'Язык',
      'customization': 'Кастомизация',
      'size': 'Размер (px)',
      'error': 'Ошибка',
      'module-color': 'Цвет модулей',
      'background-color': 'Цвет фона',
      'settings': 'Настройки',
      'about': 'О программе',
      'developed-by': 'Разработано',
      'menu': 'Меню',
      'qr-settings': 'Настройки',
      'select-language': 'Выберите язык',
      'app-name': 'Генератор QR-кодов',
      'app-version': 'Версия 1.0',
      'app-developer': 'Разработано Olé',
      'reset-to-defaults': 'Сбросить настройки',
      'ssid': 'SSID',
      'password': 'Пароль',
      'encryption-type': 'Тип шифрования',
      'hidden-network': 'Скрытая сеть',
      'no-password': 'Без пароля',
      'my-wifi': 'MyWiFi',
      'first-name': 'Имя',
      'last-name': 'Фамилия',
      'phone': 'Телефон',
      'email': 'Email',
      'company': 'Компания',
      'position': 'Должность',
      'first-name-placeholder': 'Иван',
      'last-name-placeholder': 'Иванов',
      'phone-placeholder': '+1 555 123 4567',
      'email-placeholder': 'ivan@example.com',
      'company-placeholder': 'Компания',
      'position-placeholder': 'Менеджер'
    }
  };

  let currentLanguage = localStorage.getItem('qr_language') || 'en';

  function translatePage(lang) {
    currentLanguage = lang;
    localStorage.setItem('qr_language', lang);
    
    const elements = $$('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    const placeholderElements = $$('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });
  }

  const form = $('#qr-form');
  const downloadButton = $('#download');
  const qrContainer = $('#qrcode');
  const tabButtons = $$('.tab-button');

  const defaults = JSON.parse(localStorage.getItem('qr_defaults') || '{}');
  if (defaults.size) $('#size').value = defaults.size;
  if (defaults.colorDark) $('#color-dark').value = defaults.colorDark;
  if (defaults.colorLight) $('#color-light').value = defaults.colorLight;
  if (defaults.ec) $('#ec-level').value = defaults.ec;

  // Initialize language
  const languageSelect = $('#language-select');
  if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener('change', (e) => {
      translatePage(e.target.value);
    });
  }

  // Translate page on load
  translatePage(currentLanguage);

  // Reset settings functionality
  const resetBtn = document.getElementById('reset-settings');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset to default values
      $('#size').value = 256;
      $('#ec-level').value = 'M';
      $('#color-dark').value = '#000000';
      $('#color-light').value = '#ffffff';
      
      // Clear saved defaults
      localStorage.removeItem('qr_defaults');
      
      // Regenerate QR code with default settings
      renderQR();
    });
  }


  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      $$('.form-section').forEach((sec) => sec.classList.add('hidden'));
      $(`.form-section[data-section="${type}"]`).classList.remove('hidden');
    });
  });

  function sanitizeText(value) {
    return (value || '').toString().trim();
  }

  function buildPayload() {
    const activeType = document.querySelector('.tab-button.active').dataset.type;
    if (activeType === 'text') {
      const text = sanitizeText($('#text-input').value);
      return text;
    }
    if (activeType === 'wifi') {
      const ssid = sanitizeText($('#wifi-ssid').value);
      const pass = sanitizeText($('#wifi-password').value);
      const auth = $('#wifi-auth').value;
      const hidden = $('#wifi-hidden').checked ? 'true' : 'false';
      let payload = `WIFI:T:${auth};S:${escapeWiFi(ssid)};`;
      if (auth !== 'nopass') payload += `P:${escapeWiFi(pass)};`;
      if (hidden === 'true') payload += 'H:true;';
      payload += ';';
      return payload;
    }
    if (activeType === 'vcard') {
      const first = sanitizeText($('#v-first').value);
      const last = sanitizeText($('#v-last').value);
      const phone = sanitizeText($('#v-phone').value);
      const email = sanitizeText($('#v-email').value);
      const org = sanitizeText($('#v-org').value);
      const title = sanitizeText($('#v-title').value);
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${last};${first};;;`,
        `FN:${first} ${last}`.trim(),
        phone ? `TEL;TYPE=CELL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        org ? `ORG:${org}` : '',
        title ? `TITLE:${title}` : '',
        'END:VCARD'
      ].filter(Boolean);
      return lines.join('\n');
    }
    return '';
  }

  function escapeWiFi(text) {
    return text.replace(/([\\,;\"])/g, '\\$1');
  }

  function getOptions() {
    const size = Math.max(120, Math.min(1024, parseInt($('#size').value || '256', 10)));
    const colorDark = $('#color-dark').value || '#000000';
    const colorLight = $('#color-light').value || '#ffffff';
    const ecVal = $('#ec-level').value;
    const correctLevel = {
      L: QRCode.CorrectLevel.L,
      M: QRCode.CorrectLevel.M,
      Q: QRCode.CorrectLevel.Q,
      H: QRCode.CorrectLevel.H
    }[ecVal] || QRCode.CorrectLevel.M;
    return { size, colorDark, colorLight, correctLevel, ecVal };
  }

  function clearQR() {
    while (qrContainer.firstChild) qrContainer.removeChild(qrContainer.firstChild);
  }

  function renderQR() {
    const text = buildPayload();
    const { size, colorDark, colorLight, correctLevel, ecVal } = getOptions();
    if (!text) {
      clearQR();
      downloadButton.disabled = true;
      return;
    }
    clearQR();
    new QRCode(qrContainer, {
      text,
      width: size,
      height: size,
      colorDark,
      colorLight,
      correctLevel
    });
    localStorage.setItem('qr_defaults', JSON.stringify({ size, colorDark, colorLight, ec: ecVal }));
    setTimeout(() => {
      const canvas = qrContainer.querySelector('canvas');
      downloadButton.disabled = !canvas;
    }, 0);
  }

  function downloadPNG() {
    const canvas = qrContainer.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  downloadButton.addEventListener('click', downloadPNG);

  document.getElementById('qr-form').addEventListener('input', () => {
    renderQR();
  });

  renderQR();

  // Close button logic
  const closeBtn = document.getElementById('close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      window.close();
    });
  }

  // Menu logic
  const menuBtn = document.getElementById('menu-btn');
  const menuWidget = document.getElementById('menu-widget');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuCloseBtn = document.getElementById('menu-close');
  const menuItems = document.querySelectorAll('.menu-item');
  const settingsPanel = document.getElementById('settings-panel');
  const languagePanel = document.getElementById('language-panel');
  const aboutPanel = document.getElementById('about-panel');
  const backBtn = document.querySelector('.back-btn');

  function openMenu() {
    menuWidget.classList.remove('hidden');
    menuOverlay.classList.remove('hidden');
    // Hide all panels when opening menu
    if (settingsPanel) {
      settingsPanel.classList.add('hidden');
    }
    if (languagePanel) {
      languagePanel.classList.add('hidden');
    }
    if (aboutPanel) {
      aboutPanel.classList.add('hidden');
    }
    // Show menu items when opening menu
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'block';
    }
  }

  function closeMenu() {
    menuWidget.classList.add('hidden');
    menuOverlay.classList.add('hidden');
    // Hide all panels when closing menu
    if (settingsPanel) {
      settingsPanel.classList.add('hidden');
    }
    if (languagePanel) {
      languagePanel.classList.add('hidden');
    }
    if (aboutPanel) {
      aboutPanel.classList.add('hidden');
    }
  }

  function showSettingsPanel() {
    if (settingsPanel) {
      settingsPanel.classList.remove('hidden');
    }
    // Hide menu items when showing settings
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'none';
    }
  }

  function showLanguagePanel() {
    if (languagePanel) {
      languagePanel.classList.remove('hidden');
    }
    // Hide menu items when showing language panel
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'none';
    }
  }

  function hideSettingsPanel() {
    if (settingsPanel) {
      settingsPanel.classList.add('hidden');
    }
    // Show menu items when hiding settings
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'block';
    }
  }

  function showAboutPanel() {
    if (aboutPanel) {
      aboutPanel.classList.remove('hidden');
    }
    // Hide menu items when showing about panel
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'none';
    }
  }

  function hideLanguagePanel() {
    if (languagePanel) {
      languagePanel.classList.add('hidden');
    }
    // Show menu items when hiding language panel
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'block';
    }
  }


  function hideAboutPanel() {
    if (aboutPanel) {
      aboutPanel.classList.add('hidden');
    }
    // Show menu items when hiding about panel
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'block';
    }
  }

  // Open menu
  if (menuBtn) {
    menuBtn.addEventListener('click', openMenu);
  }

  // Close menu
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
  }

  // Close menu on overlay click
  if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
  }

  // Back button handlers
  const backBtns = document.querySelectorAll('.back-btn');
  backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hideSettingsPanel();
      hideLanguagePanel();
      hideAboutPanel();
    });
  });

  // Menu item handlers
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      console.log(`Menu item clicked: ${section}`);
      
      // Handle different menu sections
      switch (section) {
        case 'settings':
          showSettingsPanel();
          break;
        case 'language':
          showLanguagePanel();
          break;
        case 'about':
          showAboutPanel();
          break;
      }
    });
  });
})();
