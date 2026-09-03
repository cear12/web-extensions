// Content script for QuickLink Copier Extension
// Handles page interaction and link detection

// Initialize content script
(function() {
  'use strict';

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + C to copy current page URL
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
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
  
  // Add copy button to links on hover
  function addCopyButtonsToLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      if (link.querySelector('.quicklink-copy-btn')) {
        return; // Already has button
      }

      let copyBtn = null;

      link.addEventListener('mouseenter', () => {
        if (copyBtn) return;

        copyBtn = document.createElement('button');
        copyBtn.className = 'quicklink-copy-btn';
        copyBtn.innerHTML = '📋';
        copyBtn.title = 'Copy link';

        copyBtn.style.cssText = `
          position: absolute;
          background: #4285F4;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 6px;
          font-size: 12px;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        `;

        // Position button
        const rect = link.getBoundingClientRect();
        copyBtn.style.left = `${rect.right - 30}px`;
        copyBtn.style.top = `${rect.top}px`;

        document.body.appendChild(copyBtn);

        copyBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();

          try {
            await navigator.clipboard.writeText(link.href);

            // Send message to background script
            chrome.runtime.sendMessage({
              action: 'copyLink',
              data: {
                url: link.href,
                title: link.textContent.trim() || link.title || link.href,
                domain: new URL(link.href).hostname,
                timestamp: Date.now()
              }
            });

            // Visual feedback
            copyBtn.innerHTML = '✓';
            copyBtn.style.background = '#34A853';

            setTimeout(() => {
              if (copyBtn && copyBtn.parentNode) {
                copyBtn.parentNode.removeChild(copyBtn);
              }
              copyBtn = null;
            }, 1000);

          } catch (error) {
            console.error('Error copying link:', error);
          }
        });
      });

      link.addEventListener('mouseleave', () => {
        if (copyBtn && copyBtn.parentNode) {
          copyBtn.parentNode.removeChild(copyBtn);
          copyBtn = null;
        }
      });
    });
  }
  
  // Initialize link copy buttons
  addCopyButtonsToLinks();
  
  // Re-initialize when new content is added (for dynamic pages)
  const observer = new MutationObserver((mutations) => {
    let shouldReinit = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldReinit = true;
      }
    });
    
    if (shouldReinit) {
      setTimeout(addCopyButtonsToLinks, 500);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
