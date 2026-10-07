// Web Privacy Extension - Content Script
// Shows a short "sensitive site" badge on finance/crypto sites.
// Detection is purely local: nothing is sent to the background page or stored.

(function () {
  // Matched against the hostname only (not the path or query string), to
  // avoid false positives such as /exchange-rates or "bankruptcy" articles.
  const SENSITIVE_HOST = /(^|[.-])(bank|banking|trading|crypto|wallet|paypal|stripe|finance|investment|broker|coinbase|binance|ethereum|bitcoin|blockchain)([.-]|$)/i;

  if (!SENSITIVE_HOST.test(window.location.hostname)) return;

  const LABELS = {
    en: 'Sensitive Site',
    es: 'Sitio sensible',
    ru: 'Чувствительный сайт',
    zh: '敏感网站',
    hi: 'संवेदनशील साइट'
  };
  let lang = 'ru';

  function pickLang(value) {
    return Object.prototype.hasOwnProperty.call(LABELS, value) ? value : null;
  }

  function detectBrowserLanguage() {
    return pickLang(String(navigator.language || '').toLowerCase().split(/[-_]/)[0]) || 'ru';
  }

  function labelText() {
    return '\u{1F512} ' + LABELS[lang];
  }

  function updateLabel() {
    const el = document.getElementById('web-privacy-sensitive-indicator');
    if (el) {
      el.textContent = labelText();
      el.lang = lang;
    }
  }

  async function loadLanguage() {
    lang = detectBrowserLanguage();
    try {
      const { ui_language } = await chrome.storage.local.get('ui_language');
      if (pickLang(ui_language)) {
        lang = ui_language;
      } else {
        const { webPrivacyLanguage } = await chrome.storage.sync.get('webPrivacyLanguage');
        if (pickLang(webPrivacyLanguage)) lang = webPrivacyLanguage;
      }
    } catch (e) {}
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.ui_language && pickLang(changes.ui_language.newValue)) {
        lang = changes.ui_language.newValue;
        updateLabel();
      }
    });
  } catch (e) {}

  function addIndicator() {
    if (document.getElementById('web-privacy-sensitive-indicator')) return;
    const indicator = document.createElement('div');
    indicator.id = 'web-privacy-sensitive-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ff8c00;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      z-index: 2147483647;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    indicator.lang = lang;
    indicator.textContent = labelText();
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 5000);
  }

  loadLanguage().then(() => {
    if (document.body) {
      addIndicator();
    } else {
      document.addEventListener('DOMContentLoaded', addIndicator, { once: true });
    }
  });
})();
