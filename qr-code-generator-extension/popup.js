(() => {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));

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
      'app-version': 'Version',
      'app-developer': 'Developed by Olé',
      'reset-to-defaults': 'Reset to Defaults',
      'qr-data-too-long': 'Data is too long for QR code. Please shorten the text.',
      'clear': 'Clear',
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
      'position-placeholder': 'Manager',
      'other-products': 'Other Products',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'One-click link copying with history.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Professional privacy protection. One-click cleanup of browsing data.',
      'view-in-store': 'View in Store',
      'quick-link-copier-tooltip': 'QuickLink Copier - One-click link copying with history.',
      'web-privacy-tooltip': 'Web Privacy - Professional privacy protection. One-click cleanup of browsing data.',
      'close': 'Close',
      'close-menu': 'Close menu',
      'back': 'Back',
      'logo': 'Logo'
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
      'app-version': 'Versión',
      'app-developer': 'Desarrollado por Olé',
      'reset-to-defaults': 'Restablecer Valores',
      'qr-data-too-long': 'Los datos son demasiado largos para el código QR. Por favor acorta el texto.',
      'clear': 'Limpiar',
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
      'position-placeholder': 'Gerente',
      'other-products': 'Otros Productos',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'Copia de enlaces con un clic, con historial.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Protección de privacidad profesional. Limpieza de datos de navegación con un clic.',
      'view-in-store': 'Ver en la Tienda',
      'quick-link-copier-tooltip': 'QuickLink Copier - Copia de enlaces con un clic, con historial.',
      'web-privacy-tooltip': 'Web Privacy - Protección de privacidad profesional, limpieza con un clic.',
      'close': 'Cerrar',
      'close-menu': 'Cerrar menú',
      'back': 'Atrás',
      'logo': 'Logotipo'
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
      'app-version': 'Версия',
      'app-developer': 'Разработано Olé',
      'reset-to-defaults': 'Сбросить настройки',
      'qr-data-too-long': 'Данные слишком длинные для QR-кода. Попробуйте сократить текст.',
      'clear': 'Очистить',
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
      'position-placeholder': 'Менеджер',
      'other-products': 'Другие продукты',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'Копирование ссылок в один клик с историей.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Профессиональная защита конфиденциальности. Очистка данных браузера в один клик.',
      'view-in-store': 'Посмотреть в магазине',
      'quick-link-copier-tooltip': 'QuickLink Copier - Копирование ссылок в один клик с историей.',
      'web-privacy-tooltip': 'Web Privacy - Профессиональная защита конфиденциальности в один клик.',
      'close': 'Закрыть',
      'close-menu': 'Закрыть меню',
      'back': 'Назад',
      'logo': 'Логотип'
    },
    zh: {
      'text-url': '文本/URL',
      'wifi': 'WiFi',
      'contact': '联系人',
      'data': '数据',
      'enter-text-url': '输入文本或URL',
      'result': '结果',
      'download-png': '下载PNG',
      'language': '语言',
      'customization': '自定义',
      'size': '大小 (px)',
      'error': '错误',
      'module-color': '模块颜色',
      'background-color': '背景颜色',
      'settings': '设置',
      'about': '关于',
      'developed-by': '开发',
      'menu': '菜单',
      'qr-settings': '设置',
      'select-language': '选择语言',
      'app-name': '二维码生成器',
      'app-version': '版本',
      'app-developer': '由Olé开发',
      'reset-to-defaults': '重置为默认值',
      'qr-data-too-long': '数据太长，无法生成二维码。请缩短文本。',
      'clear': '清除',
      'ssid': 'SSID',
      'password': '密码',
      'encryption-type': '加密类型',
      'hidden-network': '隐藏网络',
      'no-password': '无密码',
      'my-wifi': '我的WiFi',
      'first-name': '名字',
      'last-name': '姓氏',
      'phone': '电话',
      'email': '邮箱',
      'company': '公司',
      'position': '职位',
      'first-name-placeholder': '张',
      'last-name-placeholder': '三',
      'phone-placeholder': '+86 138 0013 8000',
      'email-placeholder': 'zhang@example.com',
      'company-placeholder': '公司',
      'position-placeholder': '经理',
      'other-products': '其他产品',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': '一键复制链接，附带历史记录。',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': '专业隐私保护。一键清理浏览数据。',
      'view-in-store': '在商店中查看',
      'quick-link-copier-tooltip': 'QuickLink Copier - 一键复制链接，附带历史记录。',
      'web-privacy-tooltip': 'Web Privacy - 专业隐私保护，一键清理。',
      'close': '关闭',
      'close-menu': '关闭菜单',
      'back': '返回',
      'logo': '标志'
    },
    hi: {
      'text-url': 'टेक्स्ट/URL',
      'wifi': 'WiFi',
      'contact': 'संपर्क',
      'data': 'डेटा',
      'enter-text-url': 'टेक्स्ट या URL दर्ज करें',
      'result': 'परिणाम',
      'download-png': 'PNG डाउनलोड करें',
      'language': 'भाषा',
      'customization': 'कस्टमाइज़ेशन',
      'size': 'आकार (px)',
      'error': 'त्रुटि',
      'module-color': 'मॉड्यूल का रंग',
      'background-color': 'बैकग्राउंड का रंग',
      'settings': 'सेटिंग',
      'about': 'परिचय',
      'developed-by': 'विकसित करने वाले',
      'menu': 'मेनू',
      'qr-settings': 'सेटिंग',
      'select-language': 'भाषा चुनें',
      'app-name': 'QR कोड जेनरेटर',
      'app-version': 'संस्करण',
      'app-developer': 'Olé द्वारा विकसित',
      'reset-to-defaults': 'डिफ़ॉल्ट पर रीसेट करें',
      'qr-data-too-long': 'QR कोड के लिए डेटा बहुत लंबा है। कृपया टेक्स्ट छोटा करें।',
      'clear': 'साफ़ करें',
      'ssid': 'SSID',
      'password': 'पासवर्ड',
      'encryption-type': 'एन्क्रिप्शन प्रकार',
      'hidden-network': 'छिपा नेटवर्क',
      'no-password': 'बिना पासवर्ड',
      'my-wifi': 'MyWiFi',
      'first-name': 'पहला नाम',
      'last-name': 'उपनाम',
      'phone': 'फ़ोन',
      'email': 'ईमेल',
      'company': 'कंपनी',
      'position': 'पद',
      'first-name-placeholder': 'राहुल',
      'last-name-placeholder': 'शर्मा',
      'phone-placeholder': '+1 555 123 4567',
      'email-placeholder': 'rahul@example.com',
      'company-placeholder': 'कंपनी',
      'position-placeholder': 'मैनेजर',
      'other-products': 'अन्य प्रोडक्ट',
      'quick-link-copier-name': 'QuickLink Copier',
      'quick-link-copier-desc': 'एक क्लिक में लिंक कॉपी करें, इतिहास के साथ।',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'पेशेवर प्राइवेसी सुरक्षा। एक क्लिक में ब्राउज़िंग डेटा साफ़ करें।',
      'view-in-store': 'स्टोर में देखें',
      'quick-link-copier-tooltip': 'QuickLink Copier - एक क्लिक में लिंक कॉपी करें, इतिहास के साथ।',
      'web-privacy-tooltip': 'Web Privacy - पेशेवर प्राइवेसी सुरक्षा। एक क्लिक में ब्राउज़िंग डेटा साफ़ करें।',
      'close': 'बंद करें',
      'close-menu': 'मेनू बंद करें',
      'back': 'वापस',
      'logo': 'लोगो'
    }
  };

  let currentLanguage = localStorage.getItem('qr_language') || 'en';

  function translatePage(lang) {
    currentLanguage = lang;
    localStorage.setItem('qr_language', lang);
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('aria-label', translations[lang][key]);
      }
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('alt', translations[lang][key]);
      }
    });

    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });

    // Update product tooltips in menu footer
    const quickLinkCopierLink = document.querySelector('.menu-product-link[data-product="quick-link-copier"]');
    const webPrivacyLink = document.querySelector('.menu-product-link[data-product="web-privacy"]');

    if (quickLinkCopierLink && translations[lang] && translations[lang]['quick-link-copier-tooltip']) {
      quickLinkCopierLink.setAttribute('title', translations[lang]['quick-link-copier-tooltip']);
    }
    if (webPrivacyLink && translations[lang] && translations[lang]['web-privacy-tooltip']) {
      webPrivacyLink.setAttribute('title', translations[lang]['web-privacy-tooltip']);
    }
  }

  const form = document.getElementById('qr-form');
  const downloadButton = document.getElementById('download');
  const qrContainer = document.getElementById('qrcode');
  const tabButtons = document.querySelectorAll('.tab-button');

  if (!qrContainer) {
    return;
  }
  if (!downloadButton) {
    return;
  }
  if (!form) {
    return;
  }
  if (tabButtons.length === 0) {
    return;
  }

  let defaults = {};
  try {
    defaults = JSON.parse(localStorage.getItem('qr_defaults') || '{}') || {};
  } catch (e) {
    localStorage.removeItem('qr_defaults'); // corrupted value
  }

  const sizeElement = document.getElementById('size');
  const colorDarkElement = document.getElementById('color-dark');
  const colorLightElement = document.getElementById('color-light');
  const ecLevelElement = document.getElementById('ec-level');

  if (defaults.size && sizeElement) {
    sizeElement.value = defaults.size;
  }
  if (defaults.colorDark && colorDarkElement) {
    colorDarkElement.value = defaults.colorDark;
  }
  if (defaults.colorLight && colorLightElement) {
    colorLightElement.value = defaults.colorLight;
  }
  if (defaults.ec && ecLevelElement) {
    ecLevelElement.value = defaults.ec;
  }

  // Initialize language
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener('change', (e) => {
      translatePage(e.target.value);
      updateClearButtonState();
    });
  }

  // Translate page on load
  translatePage(currentLanguage);

  // Reset settings functionality
  const resetBtn = document.getElementById('reset-settings');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset to default values
      const sizeEl = document.getElementById('size');
      const ecLevelEl = document.getElementById('ec-level');
      const colorDarkEl = document.getElementById('color-dark');
      const colorLightEl = document.getElementById('color-light');
      
      if (sizeEl) sizeEl.value = 256;
      if (ecLevelEl) ecLevelEl.value = 'M';
      if (colorDarkEl) colorDarkEl.value = '#000000';
      if (colorLightEl) colorLightEl.value = '#ffffff';
      
      // Clear saved defaults
      localStorage.removeItem('qr_defaults');
      
      // Regenerate QR code with default settings
      renderQR();
      updateClearButtonState();
    });
  }


  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      // Only hide form sections in the main form, not in menu panels
      const formSections = document.querySelectorAll('#qr-form .form-section');
      formSections.forEach((sec) => {
        sec.classList.add('hidden');
      });
      const targetSection = document.querySelector(`#qr-form .form-section[data-section="${type}"]`);
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }

      // Update clear button state when switching tabs
      updateClearButtonState();
    });
  });

  function sanitizeText(value) {
    return (value || '').toString().trim();
  }

  function buildPayload() {
    const activeButton = document.querySelector('.tab-button.active');
    if (!activeButton) {
      return '';
    }
    const activeType = activeButton.dataset.type;
    if (activeType === 'text') {
      const textInput = document.getElementById('text-input');
      const text = sanitizeText(textInput ? textInput.value : '');
      return text;
    }
    if (activeType === 'wifi') {
      const ssidInput = document.getElementById('wifi-ssid');
      const passInput = document.getElementById('wifi-password');
      const authSelect = document.getElementById('wifi-auth');
      const hiddenCheckbox = document.getElementById('wifi-hidden');
      
      const ssid = sanitizeText(ssidInput ? ssidInput.value : '');
      const pass = sanitizeText(passInput ? passInput.value : '');
      const auth = authSelect ? authSelect.value : 'WPA';
      const hidden = hiddenCheckbox && hiddenCheckbox.checked ? 'true' : 'false';
      let payload = `WIFI:T:${auth};S:${escapeWiFi(ssid)};`;
      if (auth !== 'nopass') payload += `P:${escapeWiFi(pass)};`;
      if (hidden === 'true') payload += 'H:true;';
      payload += ';';
      return payload;
    }
    if (activeType === 'vcard') {
      const firstInput = document.getElementById('v-first');
      const lastInput = document.getElementById('v-last');
      const phoneInput = document.getElementById('v-phone');
      const emailInput = document.getElementById('v-email');
      const orgInput = document.getElementById('v-org');
      const titleInput = document.getElementById('v-title');
      
      const first = sanitizeText(firstInput ? firstInput.value : '');
      const last = sanitizeText(lastInput ? lastInput.value : '');
      const phone = sanitizeText(phoneInput ? phoneInput.value : '');
      const email = sanitizeText(emailInput ? emailInput.value : '');
      const org = sanitizeText(orgInput ? orgInput.value : '');
      const title = sanitizeText(titleInput ? titleInput.value : '');
      // vCard 3.0 text escaping: backslash, ; , and newlines must not leak
      // into the structure of the card.
      const v = QRPayload.escapeVCard;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${v(last)};${v(first)};;;`,
        `FN:${v(`${first} ${last}`.trim())}`,
        phone ? `TEL;TYPE=CELL:${v(phone)}` : '',
        email ? `EMAIL:${v(email)}` : '',
        org ? `ORG:${v(org)}` : '',
        title ? `TITLE:${v(title)}` : '',
        'END:VCARD'
      ].filter(Boolean);
      return lines.join('\n');
    }
    return '';
  }

  const escapeWiFi = QRPayload.escapeWiFi;

  function getOptions() {
    // Get values with fallbacks in case elements are hidden
    const sizeElement = document.getElementById('size');
    const colorDarkElement = document.getElementById('color-dark');
    const colorLightElement = document.getElementById('color-light');
    const ecLevelElement = document.getElementById('ec-level');
    
    const size = Math.max(120, Math.min(1024, parseInt(
      (sizeElement && sizeElement.value) || '256', 10
    )));
    const colorDark = (colorDarkElement && colorDarkElement.value) || '#000000';
    const colorLight = (colorLightElement && colorLightElement.value) || '#ffffff';
    const ecVal = (ecLevelElement && ecLevelElement.value) || 'M';
    
    const correctLevel = {
      L: QRCode.CorrectLevel.L,
      M: QRCode.CorrectLevel.M,
      Q: QRCode.CorrectLevel.Q,
      H: QRCode.CorrectLevel.H
    }[ecVal] || QRCode.CorrectLevel.M;
    
    return { size, colorDark, colorLight, correctLevel, ecVal };
  }

  function clearQR() {
    while (qrContainer.firstChild) {
      qrContainer.removeChild(qrContainer.firstChild);
    }
  }

  let renderTimer = null;

  function renderQR() {
    const text = buildPayload();
    const { size, colorDark, colorLight, correctLevel, ecVal } = getOptions();
    if (!text) {
      clearQR();
      downloadButton.disabled = true;
      return;
    }
    clearQR();
    
    // Try to generate QR code with error handling
    try {
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
    } catch (error) {
      // Data too long for this error-correction level: a *lower* level holds
      // more data, so step down (H -> Q -> M -> L) until it fits.
      const order = ['H', 'Q', 'M', 'L'];
      for (const level of order.slice(order.indexOf(ecVal) + 1)) {
        clearQR();
        try {
          new QRCode(qrContainer, {
            text,
            width: size,
            height: size,
            colorDark,
            colorLight,
            correctLevel: QRCode.CorrectLevel[level]
          });
          const ecLevelElement = document.getElementById('ec-level');
          if (ecLevelElement) ecLevelElement.value = level;
          setTimeout(() => {
            downloadButton.disabled = !qrContainer.querySelector('canvas');
          }, 0);
          return;
        } catch (nextError) {
          // try the next lower level
        }
      }
      showQRError(translations[currentLanguage]['qr-data-too-long']);
    }
  }

  function showQRError(message) {
    clearQR();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'qr-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 256px;
      height: 256px;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      color: #6c757d;
      font-size: 14px;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    qrContainer.appendChild(errorDiv);
    downloadButton.disabled = true;
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

  // Clear button logic
  const clearButton = document.getElementById('clear');
  
  // Function to check if any fields have content
  function hasContent() {
    // Check URL tab
    const textInput = document.getElementById('text-input');
    if (textInput && textInput.value.trim()) return true;
    
    // Check WiFi tab
    const ssidInput = document.getElementById('wifi-ssid');
    const passInput = document.getElementById('wifi-password');
    const authSelect = document.getElementById('wifi-auth');
    const hiddenCheckbox = document.getElementById('wifi-hidden');
    
    if (ssidInput && ssidInput.value.trim()) return true;
    if (passInput && passInput.value.trim()) return true;
    if (authSelect && authSelect.value !== 'WPA') return true;
    if (hiddenCheckbox && hiddenCheckbox.checked) return true;
    
    // Check Contact tab
    const firstInput = document.getElementById('v-first');
    const lastInput = document.getElementById('v-last');
    const phoneInput = document.getElementById('v-phone');
    const emailInput = document.getElementById('v-email');
    const orgInput = document.getElementById('v-org');
    const titleInput = document.getElementById('v-title');
    
    if (firstInput && firstInput.value.trim()) return true;
    if (lastInput && lastInput.value.trim()) return true;
    if (phoneInput && phoneInput.value.trim()) return true;
    if (emailInput && emailInput.value.trim()) return true;
    if (orgInput && orgInput.value.trim()) return true;
    if (titleInput && titleInput.value.trim()) return true;
    
    return false;
  }
  
  // Function to update clear button state
  function updateClearButtonState() {
    if (clearButton) {
      clearButton.disabled = !hasContent();
    }
  }
  
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      // Clear all form inputs in all tabs
      
      // Clear URL tab
      const textInput = document.getElementById('text-input');
      if (textInput) textInput.value = '';
      
      // Clear WiFi tab
      const ssidInput = document.getElementById('wifi-ssid');
      const passInput = document.getElementById('wifi-password');
      const authSelect = document.getElementById('wifi-auth');
      const hiddenCheckbox = document.getElementById('wifi-hidden');
      
      if (ssidInput) ssidInput.value = '';
      if (passInput) passInput.value = '';
      if (authSelect) authSelect.value = 'WPA';
      if (hiddenCheckbox) hiddenCheckbox.checked = false;
      
      // Clear Contact tab
      const firstInput = document.getElementById('v-first');
      const lastInput = document.getElementById('v-last');
      const phoneInput = document.getElementById('v-phone');
      const emailInput = document.getElementById('v-email');
      const orgInput = document.getElementById('v-org');
      const titleInput = document.getElementById('v-title');
      
      if (firstInput) firstInput.value = '';
      if (lastInput) lastInput.value = '';
      if (phoneInput) phoneInput.value = '';
      if (emailInput) emailInput.value = '';
      if (orgInput) orgInput.value = '';
      if (titleInput) titleInput.value = '';
      
      // Clear QR code and disable download button
      clearQR();
      downloadButton.disabled = true;
      
      // Update clear button state
      updateClearButtonState();
    });
  }

  // Add input listeners only to main form fields, not menu fields
  const mainFormInputs = document.querySelectorAll('#qr-form input, #qr-form textarea, #qr-form select');
  if (mainFormInputs.length > 0) {
    mainFormInputs.forEach(input => {
      input.addEventListener('input', () => {
        updateClearButtonState();
        clearTimeout(renderTimer);
        renderTimer = setTimeout(renderQR, 150);
      });
    });
  }

  // Add change listeners to QR settings fields in menu
  const qrSettingsInputs = document.querySelectorAll('#settings-panel input, #settings-panel select');
  if (qrSettingsInputs.length > 0) {
    qrSettingsInputs.forEach(input => {
      input.addEventListener('change', () => {
        renderQR();
        updateClearButtonState();
      });
    });
  }

  // Wait a bit to ensure all elements are loaded
  setTimeout(() => {
    renderQR();
    updateClearButtonState();
  }, 100);

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

  function showOtherProductsPanel() {
    const otherProductsPanel = document.getElementById('other-products-panel');
    if (otherProductsPanel) {
      otherProductsPanel.classList.remove('hidden');
    }
    // Hide menu items when showing other products panel
    const menuItemsContainer = document.querySelector('.menu-items');
    if (menuItemsContainer) {
      menuItemsContainer.style.display = 'none';
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


  function hideOtherProductsPanel() {
    const otherProductsPanel = document.getElementById('other-products-panel');
    if (otherProductsPanel) {
      otherProductsPanel.classList.add('hidden');
    }
    // Show menu items when hiding other products panel
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
      hideOtherProductsPanel();
      hideAboutPanel();
    });
  });

  // Menu item handlers
  if (menuItems.length > 0) {
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;

        // Handle different menu sections
        switch (section) {
          case 'settings':
            showSettingsPanel();
            break;
          case 'language':
            showLanguagePanel();
            break;
          case 'other-products':
            showOtherProductsPanel();
            break;
          case 'about':
            showAboutPanel();
            break;
        }
      });
    });
  }
})();
