// Background script for QuickLink Copier Extension
// Handles context menus, clipboard operations, and storage management

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
  console.log('QuickLink Copier extension installed');
  
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
  
  chrome.contextMenus.create({
    id: 'copy-all-links',
    title: 'Copy all links on page (Premium)',
    contexts: ['page']
  });
  
  // Initialize storage with default values
  const defaultData = {
    linkHistory: [],
    settings: {
      maxHistorySize: 10, // Free limit
      autoTags: true,
      showNotifications: true
    },
    premium: {
      active: false,
      expiryDate: null
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
      case 'copy-all-links':
        await copyAllLinksOnPage(tab);
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
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [url]
    });
    
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
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [linkUrl]
    });
    
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

// Copy all links on page (Premium feature)
async function copyAllLinksOnPage(tab) {
  try {
    // Check premium status
    const data = await chrome.storage.local.get(['premium']);
    if (!data.premium.active) {
      await showNotification('Premium Required', 'This feature requires a premium subscription.');
      return;
    }
    
    // Get all links from page
    let links = [];
    try {
      // Try using chrome.scripting if available
      if (chrome.scripting && chrome.scripting.executeScript) {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: getAllLinksFromPage
        });
        links = result[0].result;
      } else {
        // Fallback: send message to content script
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'getAllLinks'
        });
        links = response.links || [];
      }
    } catch (scriptError) {
      console.warn('Scripting failed, trying alternative method:', scriptError);
      // Alternative: use chrome.tabs.sendMessage to content script
      try {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'getAllLinks'
        });
        links = response.links || [];
      } catch (messageError) {
        console.error('All methods failed:', messageError);
        throw new Error('Unable to get links from page');
      }
    }
    if (links.length === 0) {
      await showNotification('No Links Found', 'No clickable links found on this page.');
      return;
    }
    
    // Format links for clipboard
    const linkText = links.map(link => `${link.text}: ${link.url}`).join('\n');
    
    // Copy to clipboard
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [linkText]
    });
    
    // Save each link to history
    for (const link of links) {
      await saveToHistory({
        url: link.url,
        title: link.text,
        domain: new URL(link.url).hostname,
        timestamp: Date.now(),
        tags: ['bulk-copy']
      });
    }
    
    // Update stats
    await updateStats();
    
    // Show notification
    await showNotification('All Links Copied!', `Copied ${links.length} links to clipboard.`);
    
  } catch (error) {
    console.error('Error copying all links:', error);
  }
}

// Save link to history
async function saveToHistory(linkData) {
  try {
    const data = await chrome.storage.local.get(['linkHistory', 'settings', 'premium']);
    let history = data.linkHistory || [];
    const settings = data.settings || { maxHistorySize: 10 };
    const premium = data.premium || { active: false };
    
    // Add new link to beginning of history
    history.unshift(linkData);
    
    // Apply history size limit
    const maxSize = premium.active ? 1000 : settings.maxHistorySize;
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
    
    if (settings.showNotifications) {
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
  navigator.clipboard.writeText(text).then(() => {
    console.log('Text copied to clipboard:', text);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function getAllLinksFromPage() {
  const links = [];
  const linkElements = document.querySelectorAll('a[href]');
  
  linkElements.forEach(link => {
    const url = link.href;
    const text = link.textContent.trim() || link.title || url;
    
    // Filter out invalid URLs
    try {
      new URL(url);
      if (url.startsWith('http://') || url.startsWith('https://')) {
        links.push({ url, text });
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  return links;
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
      
    case 'getPremiumStatus':
      chrome.storage.local.get(['premium']).then(data => {
        sendResponse({ premium: data.premium || { active: false } });
      });
      return true;
      
    case 'updateSettings':
      chrome.storage.local.set({ settings: request.settings }).then(() => {
        sendResponse({ success: true });
      });
      return true;
  }
});
