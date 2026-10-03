// Content script for QuickLink Copier Extension
// Handles page interaction and link detection

// Initialize content script
(function() {
  'use strict';

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
      showToast('Page URL copied!', 'success');
      
    } catch (error) {
      console.error('Error copying page URL:', error);
      showToast('Failed to copy URL', 'error');
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
    copyBtn.title = 'Copy link';
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
        showToast('Failed to copy link', 'error');
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
