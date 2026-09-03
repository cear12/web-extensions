// Background script for QuickLink Copier Extension
// Handles context menus, clipboard operations, and storage management

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  // Create context menu items
  chrome.contextMenus.create({
    id: 'copy-current-url',
    title: 'Copy page URL',
    contexts: ['page']
  });
  
  chrome.contextMenus.create({
    id: 'copy-link-url',
    title: 'Copy this link',
    contexts: ['link']
  });
  
  
  // Initialize storage with default values
  const defaultData = {
    linkHistory: [],
    settings: {
      maxHistorySize: 10,
      autoTags: true,
      showNotifications: true
    },
    stats: {
      totalCopied: 0,
      dailyCopied: 0,
      lastResetDate: new Date().toDateString()
    }
  };
  
  // Set default data if not exists
  const existingData = await chrome.storage.local.get();
  if (!existingData.linkHistory) {
    await chrome.storage.local.set(defaultData);
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    switch (info.menuItemId) {
      case 'copy-current-url':
        await copyCurrentPageUrl(tab);
        break;
      case 'copy-link-url':
        await copyLinkUrl(info.linkUrl, info.linkText, tab);
        break;
    }
  } catch (error) {
    console.error('Error handling context menu click:', error);
  }
});

// Copy current page URL
async function copyCurrentPageUrl(tab) {
  try {
    const url = tab.url;
    const title = tab.title;
    const domain = new URL(url).hostname;
    
    // Copy to clipboard
    if (chrome.scripting && chrome.scripting.executeScript) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: copyToClipboard,
          args: [url]
        });
      } catch (scriptError) {
        console.warn('Scripting failed, trying alternative method:', scriptError);
        // Alternative: inject inline script
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => {
              const textarea = document.createElement('textarea');
              textarea.value = text;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            },
            args: [url]
          });
        } catch (finalError) {
          console.error('All copy methods failed:', finalError);
          // If copying fails, still save to history
          await showNotification('Copy Failed', 'Unable to copy to clipboard, but link saved to history.');
        }
      }
    } else {
      console.warn('chrome.scripting not available, skipping clipboard copy');
      await showNotification('Copy Failed', 'Unable to copy to clipboard, but link saved to history.');
    }
    
    // Save to history
    await saveToHistory({
      url,
      title,
      domain,
      timestamp: Date.now(),
      tags: []
    });
    
    // Update stats
    await updateStats();
    
    // Show notification
    await showNotification('Link copied!', `Copied: ${title}`);
    
  } catch (error) {
    console.error('Error copying current page URL:', error);
  }
}

// Copy specific link URL
async function copyLinkUrl(linkUrl, linkText, tab) {
  try {
    const domain = new URL(linkUrl).hostname;
    const title = linkText || linkUrl;
    
    // Copy to clipboard
    if (chrome.scripting && chrome.scripting.executeScript) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: copyToClipboard,
          args: [linkUrl]
        });
      } catch (scriptError) {
        console.warn('Scripting failed, trying alternative method:', scriptError);
        // Alternative: inject inline script
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => {
              const textarea = document.createElement('textarea');
              textarea.value = text;
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand('copy');
              document.body.removeChild(textarea);
            },
            args: [linkUrl]
          });
        } catch (finalError) {
          console.error('All copy methods failed:', finalError);
          // If copying fails, still save to history
          await showNotification('Copy Failed', 'Unable to copy to clipboard, but link saved to history.');
        }
      }
    } else {
      console.warn('chrome.scripting not available, skipping clipboard copy');
      await showNotification('Copy Failed', 'Unable to copy to clipboard, but link saved to history.');
    }
    
    // Save to history
    await saveToHistory({
      url: linkUrl,
      title,
      domain,
      timestamp: Date.now(),
      tags: []
    });
    
    // Update stats
    await updateStats();
    
    // Show notification
    await showNotification('Link copied!', `Copied: ${title}`);
    
  } catch (error) {
    console.error('Error copying link URL:', error);
  }
}

// Save link to history
async function saveToHistory(linkData) {
  try {
    const data = await chrome.storage.local.get(['linkHistory', 'settings']);
    let history = data.linkHistory || [];
    const settings = data.settings || { maxHistorySize: 10 };

    // Add new link to beginning of history
    history.unshift(linkData);

    // Apply history size limit
    const maxSize = settings.maxHistorySize;
    if (history.length > maxSize) {
      history = history.slice(0, maxSize);
    }
    
    // Save updated history
    await chrome.storage.local.set({ linkHistory: history });
    
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

// Update statistics
async function updateStats() {
  try {
    const data = await chrome.storage.local.get(['stats']);
    const stats = data.stats || {
      totalCopied: 0,
      dailyCopied: 0,
      lastResetDate: new Date().toDateString()
    };
    
    // Reset daily counter if new day
    const today = new Date().toDateString();
    if (stats.lastResetDate !== today) {
      stats.dailyCopied = 0;
      stats.lastResetDate = today;
    }
    
    // Update counters
    stats.totalCopied++;
    stats.dailyCopied++;
    
    // Save updated stats
    await chrome.storage.local.set({ stats });
    
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// Show notification
async function showNotification(title, message) {
  try {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || { showNotifications: true };
    
    if (settings.showNotifications && chrome.notifications && chrome.notifications.create) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: title,
        message: message
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Functions to be injected into content scripts
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getHistory':
      chrome.storage.local.get(['linkHistory']).then(data => {
        sendResponse({ history: data.linkHistory || [] });
      });
      return true; // Keep message channel open for async response
      
    case 'clearHistory':
      chrome.storage.local.set({ linkHistory: [] }).then(() => {
        sendResponse({ success: true });
      });
      return true;
      
    case 'getStats':
      chrome.storage.local.get(['stats']).then(data => {
        sendResponse({ stats: data.stats || { totalCopied: 0, dailyCopied: 0 } });
      });
      return true;
      
    case 'updateSettings':
      chrome.storage.local.set({ settings: request.settings }).then(() => {
        sendResponse({ success: true });
      });
      return true;

    case 'copyCurrentPage':
    case 'copyLink':
      // Sent by content.js after it copies a URL to the clipboard directly
      // (keyboard shortcut / hover copy button) -- record it the same way
      // the context-menu copy actions do.
      (async () => {
        await saveToHistory(request.data);
        await updateStats();
        sendResponse({ success: true });
      })();
      return true;
    case 'closePopup':
      // Close popup by temporarily disabling and re-enabling it
      try {
        chrome.action.setPopup({ popup: '' });
        setTimeout(() => {
          chrome.action.setPopup({ popup: 'popup.html' });
        }, 100);
      } catch (e) {
        // Ignore errors if popup is not open
      }
      sendResponse({ success: true });
      return true;
  }
});
