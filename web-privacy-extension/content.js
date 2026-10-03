// Web Privacy Extension - Content Script
// Shows a short "sensitive site" badge on finance/crypto sites.
// Detection is purely local: nothing is sent to the background page or stored.

(function () {
  // Matched against the hostname only (not the path or query string), to
  // avoid false positives such as /exchange-rates or "bankruptcy" articles.
  const SENSITIVE_HOST = /(^|[.-])(bank|banking|trading|crypto|wallet|paypal|stripe|finance|investment|broker|coinbase|binance|ethereum|bitcoin|blockchain)([.-]|$)/i;

  if (!SENSITIVE_HOST.test(window.location.hostname)) return;

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
    indicator.textContent = '\u{1F512} Sensitive Site';
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 5000);
  }

  if (document.body) {
    addIndicator();
  } else {
    document.addEventListener('DOMContentLoaded', addIndicator, { once: true });
  }
})();
