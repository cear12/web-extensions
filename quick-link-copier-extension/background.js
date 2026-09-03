// Background script for QuickLink Copier Extension
// Handles context menus, the copy-current-url keyboard command, clipboard
// operations (via one-shot chrome.scripting injection), and storage.

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async () => {
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
    title: 'Copy all links on page',
    contexts: ['page']
  });

  // Initialize storage with default values (only if this is a fresh install --
  // don't clobber an existing user's history/settings on update).
  const defaultData = {
    linkHistory: [],
    settings: {
      maxHistorySize: 50,
      autoTags: true,
      showNotifications: true
    },
    stats: {
      totalCopied: 0,
      dailyCopied: 0,
      lastResetDate: new Date().toDateString()
    }
  };

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

// Handle the copy-current-url keyboard shortcut (Ctrl/Cmd+Shift+C, see
// manifest.json "commands"). Using chrome.commands instead of a content
// script listening for keydown means this works without injecting anything
// into every page, and without needing <all_urls> host permissions --
// activeTab (already granted per-invocation by commands/contextMenus) is
// enough for the one-shot script injection below.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'copy-current-url') return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      await copyCurrentPageUrl(tab);
    }
  } catch (error) {
    console.error('Error handling copy-current-url command:', error);
  }
});

// Copy current page URL
async function copyCurrentPageUrl(tab) {
  try {
    const url = tab.url;
    const title = tab.title;
    const domain = new URL(url).hostname;

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [url]
    });

    await saveToHistory({
      url,
      title,
      domain,
      timestamp: Date.now(),
      tags: []
    });

    await updateStats();
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

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [linkUrl]
    });

    await saveToHistory({
      url: linkUrl,
      title,
      domain,
      timestamp: Date.now(),
      tags: []
    });

    await updateStats();
    await showNotification('Link copied!', `Copied: ${title}`);

  } catch (error) {
    console.error('Error copying link URL:', error);
  }
}

// Copy all links on the current page
async function copyAllLinksOnPage(tab) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getAllLinksFromPage
    });
    const links = result[0].result;

    if (links.length === 0) {
      await showNotification('No Links Found', 'No clickable links found on this page.');
      return;
    }

    const linkText = links.map(link => `${link.text}: ${link.url}`).join('\n');

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyToClipboard,
      args: [linkText]
    });

    for (const link of links) {
      await saveToHistory({
        url: link.url,
        title: link.text,
        domain: new URL(link.url).hostname,
        timestamp: Date.now(),
        tags: ['bulk-copy']
      });
    }

    await updateStats();
    await showNotification('All Links Copied!', `Copied ${links.length} links to clipboard.`);

  } catch (error) {
    console.error('Error copying all links:', error);
  }
}

// Save link to history
async function saveToHistory(linkData) {
  try {
    const data = await chrome.storage.local.get(['linkHistory', 'settings']);
    let history = data.linkHistory || [];
    const settings = data.settings || { maxHistorySize: 50 };

    history.unshift(linkData);

    const maxSize = settings.maxHistorySize || 50;
    if (history.length > maxSize) {
      history = history.slice(0, maxSize);
    }

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

    const today = new Date().toDateString();
    if (stats.lastResetDate !== today) {
      stats.dailyCopied = 0;
      stats.lastResetDate = today;
    }

    stats.totalCopied++;
    stats.dailyCopied++;

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

// Functions below are injected into the target page via
// chrome.scripting.executeScript -- they run in the page's own context, not
// this service worker's, so they can't reference anything defined above.

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function getAllLinksFromPage() {
  const links = [];
  const linkElements = document.querySelectorAll('a[href]');

  linkElements.forEach(link => {
    const url = link.href;
    const text = link.textContent.trim() || link.title || url;

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
