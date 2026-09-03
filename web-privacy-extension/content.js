// Web Privacy Extension - Content Script
// Detects sensitive sites

class SensitiveSiteDetector {
  constructor() {
    this.sensitivePatterns = [
      /bank/i, /trading/i, /crypto/i, /wallet/i,
      /paypal/i, /stripe/i, /finance/i, /investment/i,
      /broker/i, /exchange/i, /coinbase/i, /binance/i,
      /ethereum/i, /bitcoin/i, /blockchain/i
    ];
    
    this.init();
  }

  init() {
    this.detectSensitiveSite();
    this.setupMessageListener();
  }

  detectSensitiveSite() {
    const url = window.location.href;
    const domain = window.location.hostname;
    
    const isSensitive = this.sensitivePatterns.some(pattern => 
      pattern.test(url) || pattern.test(domain)
    );
    
    if (isSensitive) {
      this.notifyBackground('sensitive-site-detected', {
        url: url,
        domain: domain,
        timestamp: new Date().toISOString()
      });
      
      // Add visual indicator for sensitive site
      this.addSensitiveIndicator();
    }
  }

  addSensitiveIndicator() {
    // Create a subtle indicator that this is a sensitive site
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
      z-index: 10000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    indicator.textContent = '🔒 Sensitive Site';
    
    document.body.appendChild(indicator);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 5000);
  }

  setupMessageListener() {
    // No specific message handling needed for sensitive site detection
  }

  notifyBackground(action, data) {
    chrome.runtime.sendMessage({
      action: action,
      data: data
    });
  }
}

// Initialize sensitive site detector
new SensitiveSiteDetector();
