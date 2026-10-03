// Options page script for QuickLink Copier Extension
// Handles settings management and data operations

(() => {
  'use strict';

  // DOM elements
  const $ = (sel) => document.querySelector(sel);

  // State
  let settings = { showNotifications: true, autoTags: true, maxHistorySize: 10 };
  let linkHistory = [];
  let stats = { totalCopied: 0, dailyCopied: 0 };
  
  // Initialize options page
  async function init() {
    try {
      // Load data from storage
      await loadData();
      
      // Setup event listeners
      setupEventListeners();
      
      // Update UI
      updateUI();
      
    } catch (error) {
      console.error('Error initializing options page:', error);
    }
  }
  
  // Load data from Chrome storage
  async function loadData() {
    try {
      const data = await chrome.storage.local.get([
        'settings', 'linkHistory', 'stats'
      ]);

      settings = { ...settings, ...data.settings };
      linkHistory = data.linkHistory || [];
      stats = data.stats || { totalCopied: 0, dailyCopied: 0 };
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // General settings form
    const generalForm = $('#general-settings');
    if (generalForm) {
      generalForm.addEventListener('submit', handleGeneralSettingsSubmit);
    }
    
    // History management
    const clearHistoryBtn = $('#clear-history');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', handleClearHistory);
    }
    
    const exportHistoryBtn = $('#export-history');
    if (exportHistoryBtn) {
      exportHistoryBtn.addEventListener('click', handleExportHistory);
    }
    
    // Data management
    const exportDataBtn = $('#export-data');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', handleExportData);
    }
    
    const importDataBtn = $('#import-data');
    if (importDataBtn) {
      importDataBtn.addEventListener('click', handleImportData);
    }
    
    const resetDataBtn = $('#reset-data');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', handleResetData);
    }
  }
  
  // Handle general settings form submission
  async function handleGeneralSettingsSubmit(e) {
    e.preventDefault();
    
    try {
      const showNotifications = $('#show-notifications')?.checked ?? true;
      const autoTags = $('#auto-tags')?.checked ?? true;
      const maxHistory = parseInt($('#max-history')?.value ?? '10', 10);
      
      settings.showNotifications = showNotifications;
      settings.autoTags = autoTags;
      settings.maxHistorySize = Math.max(5, Math.min(1000, maxHistory));
      
      await chrome.storage.local.set({ settings });
      showMessage('Settings saved successfully!', 'success');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('Failed to save settings', 'error');
    }
  }
  
  // Handle clear history
  async function handleClearHistory() {
    if (confirm('Are you sure you want to clear all link history? This action cannot be undone.')) {
      try {
        linkHistory = [];
        await chrome.storage.local.set({ linkHistory });
        updateUI();
        showMessage('History cleared successfully!', 'success');
      } catch (error) {
        console.error('Error clearing history:', error);
        showMessage('Failed to clear history', 'error');
      }
    }
  }
  
  // Handle export history
  async function handleExportHistory() {
    if (linkHistory.length === 0) {
      showMessage('No history to export', 'error');
      return;
    }
    
    try {
      const data = {
        links: linkHistory,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `quicklink-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('History exported successfully!', 'success');
      
    } catch (error) {
      console.error('Error exporting history:', error);
      showMessage('Failed to export history', 'error');
    }
  }
  
  // Handle export all data
  async function handleExportData() {
    try {
      const allData = await chrome.storage.local.get(['linkHistory', 'settings', 'stats']);
      const exportData = {
        ...allData,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `quicklink-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('All data exported successfully!', 'success');
      
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('Failed to export data', 'error');
    }
  }
  
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const MAX_HISTORY = 1000;

  // Validate and normalise an imported backup so malformed files can never
  // put the popup/options pages into a state they can't render.
  function sanitizeBackup(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.linkHistory)) {
      throw new Error('Invalid backup file format');
    }
    const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
    const linkHistory = [];
    for (const item of data.linkHistory.slice(0, MAX_HISTORY)) {
      if (!item || typeof item.url !== 'string' || !/^https?:\/\//i.test(item.url)) continue;
      let domain = str(item.domain, 253);
      if (!domain) {
        try { domain = new URL(item.url).hostname; } catch (_) { continue; }
      }
      linkHistory.push({
        url: str(item.url, 2048),
        title: str(item.title, 300) || item.url,
        domain,
        favicon: /^https?:\/\//i.test(item.favicon || '') ? str(item.favicon, 2048) : undefined,
        timestamp: Number.isFinite(item.timestamp) ? item.timestamp : Date.now(),
        tags: Array.isArray(item.tags) ? item.tags.filter((t) => typeof t === 'string').slice(0, 20).map((t) => t.slice(0, 50)) : []
      });
    }
    const src = data.settings && typeof data.settings === 'object' ? data.settings : {};
    const max = Number.parseInt(src.maxHistorySize, 10);
    const cleanSettings = {
      showNotifications: typeof src.showNotifications === 'boolean' ? src.showNotifications : settings.showNotifications,
      autoTags: typeof src.autoTags === 'boolean' ? src.autoTags : settings.autoTags,
      maxHistorySize: Number.isFinite(max) ? Math.max(5, Math.min(MAX_HISTORY, max)) : settings.maxHistorySize
    };
    const s = data.stats && typeof data.stats === 'object' ? data.stats : {};
    const count = (v) => (Number.isFinite(v) && v >= 0 ? Math.floor(v) : 0);
    const cleanStats = {
      totalCopied: count(s.totalCopied),
      dailyCopied: count(s.dailyCopied),
      lastResetDate: typeof s.lastResetDate === 'string' ? s.lastResetDate : new Date().toDateString()
    };
    return { linkHistory, settings: cleanSettings, stats: cleanStats };
  }

  // Handle import data
  async function handleImportData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > MAX_IMPORT_BYTES) {
        showMessage('Backup file is too large.', 'error');
        return;
      }
      
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        const clean = sanitizeBackup(data);

        await chrome.storage.local.set(clean);

        // Reload data and update UI
        await loadData();
        updateUI();
        
        showMessage('Data imported successfully!', 'success');
        
      } catch (error) {
        console.error('Error importing data:', error);
        showMessage('Failed to import data. Please check the file format.', 'error');
      }
    });
    
    input.click();
  }
  
  // Handle reset all data
  async function handleResetData() {
    if (confirm('Are you sure you want to reset ALL data? This will clear your history, settings, and stats. This action cannot be undone.')) {
      if (confirm('This is your final warning. All data will be permanently deleted. Continue?')) {
        try {
          await chrome.storage.local.clear();
          await loadData();
          updateUI();
          showMessage('All data has been reset', 'success');
        } catch (error) {
          console.error('Error resetting data:', error);
          showMessage('Failed to reset data', 'error');
        }
      }
    }
  }
  
  // Escape text for safe interpolation into innerHTML templates (history
  // entries come from web pages and from imported backup files).
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  // Update UI
  function updateUI() {
    // Update settings checkboxes
    const showNotificationsCheckbox = $('#show-notifications');
    const autoTagsCheckbox = $('#auto-tags');
    const maxHistoryInput = $('#max-history');
    
    if (showNotificationsCheckbox) {
      showNotificationsCheckbox.checked = settings.showNotifications;
    }
    if (autoTagsCheckbox) {
      autoTagsCheckbox.checked = settings.autoTags;
    }
    if (maxHistoryInput) {
      maxHistoryInput.value = settings.maxHistorySize;
    }

    // Update stats
    updateStats();

    // Update recent links preview
    updateRecentLinksPreview();
  }

  // Update statistics
  function updateStats() {
    const totalLinksEl = $('#total-links');
    const totalCopiedEl = $('#total-copied');
    
    if (totalLinksEl) {
      totalLinksEl.textContent = linkHistory.length;
    }
    if (totalCopiedEl) {
      totalCopiedEl.textContent = stats.totalCopied;
    }
  }
  
  // Update recent links preview
  function updateRecentLinksPreview() {
    const recentLinksPreview = $('#recent-links-preview');
    if (!recentLinksPreview) return;
    
    const recentLinks = linkHistory.slice(0, 5);
    
    if (recentLinks.length === 0) {
      recentLinksPreview.innerHTML = '<div class="no-links">No links in history</div>';
      return;
    }
    
    recentLinksPreview.innerHTML = recentLinks.map(link => {
      const timeAgo = getTimeAgo(link.timestamp);
      const rawTitle = String(link.title ?? link.url ?? '');
      const title = rawTitle.length > 40 ? rawTitle.substring(0, 40) + '...' : rawTitle;
      
      return `
        <div class="link-preview-item">
          <div class="link-info">
            <div class="link-title">${escapeHtml(title)}</div>
            <div class="link-domain">${escapeHtml(link.domain)}</div>
            <div class="link-time">${timeAgo}</div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  // Utility functions
  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
  
  function showMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = $('#message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message
    const messageEl = document.createElement('div');
    messageEl.id = 'message';
    messageEl.textContent = message;
    
    const colors = {
      success: '#34A853',
      error: '#EA4335',
      info: '#4285F4'
    };
    
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 4 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 4000);
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();