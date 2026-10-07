// Content script for QuickLink Copier Extension
// Handles page interaction and link detection

// Initialize content script
(function() {
  'use strict';

  // UI language mirrored by the popup into chrome.storage.local.ui_language
  // (content scripts cannot read the extension's localStorage).
  const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'zh', 'hi'];
  const MESSAGES = {
    en: { pageCopied: 'Page URL copied!', copyUrlFailed: 'Failed to copy URL', copyLinkFailed: 'Failed to copy link', copyLink: 'Copy link' },
    ru: { pageCopied: 'URL страницы скопирован!', copyUrlFailed: 'Не удалось скопировать URL', copyLinkFailed: 'Не удалось скопировать ссылку', copyLink: 'Копировать ссылку' },
    es: { pageCopied: '¡URL de la página copiada!', copyUrlFailed: 'Error al copiar la URL', copyLinkFailed: 'Error al copiar el enlace', copyLink: 'Copiar enlace' },
    zh: { pageCopied: '页面 URL 已复制！', copyUrlFailed: '复制 URL 失败', copyLinkFailed: '复制链接失败', copyLink: '复制链接' },
    hi: { pageCopied: 'पेज का URL कॉपी हो गया!', copyUrlFailed: 'URL कॉपी नहीं हो सका', copyLinkFailed: 'लिंक कॉपी नहीं हो सका', copyLink: 'लिंक कॉपी करें' }
  };

  function normalizeLanguage(lang) {
    const base = String(lang || '').toLowerCase().split(/[-_]/)[0];
    return SUPPORTED_LANGUAGES.includes(base) ? base : 'en';
  }

  let language = 'en';
  try { language = normalizeLanguage(chrome.i18n.getUILanguage()); } catch (_) { /* keep 'en' */ }

  function t(key) {
    return (MESSAGES[language] && MESSAGES[language][key]) || MESSAGES.en[key] || key;
  }

  function setLanguage(lang) {
    if (lang && SUPPORTED_LANGUAGES.includes(lang)) language = lang;
    if (copyBtn) {
      copyBtn.title = t('copyLink');
      copyBtn.setAttribute('aria-label', t('copyLink'));
    }
  }

  try {
    chrome.storage.local.get('ui_language').then((data) => setLanguage(data && data.ui_language), () => {});
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.ui_language) setLanguage(changes.ui_language.newValue);
    });
  } catch (_) { /* extension context invalidated */ }

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Alt + Shift + C to copy current page URL (Ctrl+Shift+C opens DevTools'
    // element picker in Chrome, so it cannot be used reliably).
    if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyC') {
      e.preventDefault();
      copyCurrentPageUrl();
    }
  });

  
  // Copy current page URL
  async function copyCurrentPageUrl() {
    try {
      const url = window.location.href;
      const title = document.title;
      
      await navigator.clipboard.writeText(url);
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: 'copyCurrentPage',
        data: {
          url,
          title,
          domain: window.location.hostname,
          timestamp: Date.now()
        }
      });
      
      // Show visual feedback
      showToast(t('pageCopied'), 'success');
      
    } catch (error) {
      console.error('Error copying page URL:', error);
      showToast(t('copyUrlFailed'), 'error');
    }
  }
  
  // Show toast notification
  function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.getElementById('quicklink-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.id = 'quicklink-toast';
    toast.textContent = message;
    
    // Style the toast
    const colors = {
      success: '#34A853',
      error: '#EA4335',
      info: '#4285F4'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }
  
  // One floating copy button shared by all links (event delegation), so the
  // cost does not grow with the number of links and nothing needs to be
  // re-attached when a dynamic page adds content.
  let copyBtn = null;
  let activeLink = null;
  let hideTimer = null;

  function removeButton() {
    clearTimeout(hideTimer);
    if (copyBtn) {
      copyBtn.remove();
      copyBtn = null;
    }
    activeLink = null;
  }

  function showButtonFor(link) {
    if (activeLink === link && copyBtn) return;
    removeButton();
    activeLink = link;

    copyBtn = document.createElement('button');
    copyBtn.className = 'quicklink-copy-btn';
    copyBtn.textContent = '\u{1F4CB}';
    copyBtn.title = t('copyLink');
    copyBtn.setAttribute('aria-label', t('copyLink'));
    copyBtn.style.cssText = `
      position: fixed;
      background: #4285F4;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 12px;
      cursor: pointer;
      z-index: 2147483647;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    const rect = link.getBoundingClientRect();
    // position: fixed -> viewport coordinates, correct while scrolled.
    copyBtn.style.left = `${Math.max(0, Math.min(rect.right - 30, window.innerWidth - 40))}px`;
    copyBtn.style.top = `${Math.max(0, rect.top)}px`;

    const btn = copyBtn;
    btn.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    btn.addEventListener('mouseleave', () => { hideTimer = setTimeout(removeButton, 150); });
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const href = link.href;
      try {
        await navigator.clipboard.writeText(href);
        let domain = '';
        try { domain = new URL(href).hostname; } catch (_) { /* non-http(s) href */ }
        chrome.runtime.sendMessage({
          action: 'copyLink',
          data: {
            url: href,
            title: link.textContent.trim() || link.title || href,
            domain,
            timestamp: Date.now()
          }
        });
        btn.textContent = '\u2713';
        btn.style.background = '#34A853';
        setTimeout(() => { if (copyBtn === btn) removeButton(); }, 1000);
      } catch (error) {
        console.error('Error copying link:', error);
        showToast(t('copyLinkFailed'), 'error');
      }
    });

    document.body.appendChild(btn);
  }

  document.addEventListener('mouseover', (e) => {
    if (!(e.target instanceof Element)) return;
    if (copyBtn && copyBtn.contains(e.target)) return;
    const link = e.target.closest('a[href]');
    if (link) {
      clearTimeout(hideTimer);
      showButtonFor(link);
    }
  }, true);

  document.addEventListener('mouseout', (e) => {
    if (!activeLink || !(e.target instanceof Element)) return;
    if (e.target.closest('a[href]') !== activeLink) return;
    if (e.relatedTarget instanceof Node && (activeLink.contains(e.relatedTarget) || (copyBtn && copyBtn.contains(e.relatedTarget)))) return;
    hideTimer = setTimeout(removeButton, 150);
  }, true);

  window.addEventListener('scroll', removeButton, { passive: true, capture: true });

})();
