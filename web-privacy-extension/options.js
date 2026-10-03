// Web Privacy Extension - Options Page Script
let settings = {
  notifications: true,
  cookies: true,
  cache: true,
  history: false,
  downloads: false,
  passwords: false,
  formData: false,
  schedule: 'none',
  whitelist: [],
  blacklist: []
};

let stats = {
  totalCleanups: 0,
  lastCleanup: null,
  sensitiveSites: 0
};

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();
  setupEventListeners();
  updateUI();
});

async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['webPrivacySettings']);
    if (result.webPrivacySettings) {
      settings = { ...settings, ...result.webPrivacySettings };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettings() {
  try {
    await chrome.storage.sync.set({ webPrivacySettings: settings });
    applySchedule();
    showNotification('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showNotification('Failed to save settings', 'error');
  }
}

// The alarm-based auto-cleanup schedule lives in the background service
// worker (chrome.alarms). Tell it about the current choice every time
// settings are saved -- background.js already knows how to turn this into
// a recurring alarm (or cancel one) via these two message actions.
function applySchedule() {
  if (settings.schedule && settings.schedule !== 'none') {
    chrome.runtime.sendMessage({ action: 'schedule-cleanup', data: { schedule: settings.schedule } });
  } else {
    chrome.runtime.sendMessage({ action: 'cancel-schedule' });
  }
}

async function loadStats() {
  try {
    const result = await chrome.storage.local.get(['cleanupCount', 'lastCleanup', 'sensitiveSiteVisits']);
    stats.totalCleanups = result.cleanupCount || 0;
    stats.lastCleanup = result.lastCleanup || null;
    stats.sensitiveSites = (result.sensitiveSiteVisits || []).length;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function setupEventListeners() {
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // Export settings button
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  
  // Import settings button
  document.getElementById('import-settings').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  // Import file input
  document.getElementById('import-file').addEventListener('change', importSettings);
  
  // General settings
  document.getElementById('notifications').addEventListener('change', (e) => {
    settings.notifications = e.target.checked;
  });

  // Cleanup options
  document.getElementById('cookies').addEventListener('change', (e) => {
    settings.cookies = e.target.checked;
  });
  
  document.getElementById('cache').addEventListener('change', (e) => {
    settings.cache = e.target.checked;
  });
  
  document.getElementById('history').addEventListener('change', (e) => {
    settings.history = e.target.checked;
  });
  
  document.getElementById('downloads').addEventListener('change', (e) => {
    settings.downloads = e.target.checked;
  });
  
  document.getElementById('passwords').addEventListener('change', (e) => {
    settings.passwords = e.target.checked;
  });
  
  document.getElementById('form-data').addEventListener('change', (e) => {
    settings.formData = e.target.checked;
  });
  
  // Schedule options
  document.querySelectorAll('input[name="schedule"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      settings.schedule = e.target.value;
    });
  });
  
  
  // Whitelist/Blacklist
  document.getElementById('add-whitelist').addEventListener('click', addToWhitelist);
  document.getElementById('add-blacklist').addEventListener('click', addToBlacklist);
}

function updateUI() {
  // Update checkboxes
  document.getElementById('notifications').checked = settings.notifications;
  document.getElementById('cookies').checked = settings.cookies;
  document.getElementById('cache').checked = settings.cache;
  document.getElementById('history').checked = settings.history;
  document.getElementById('downloads').checked = settings.downloads;
  document.getElementById('passwords').checked = settings.passwords;
  document.getElementById('form-data').checked = settings.formData;
  
  // Update radio buttons
  document.querySelector(`input[name="schedule"][value="${settings.schedule}"]`).checked = true;
  
  // Update stats
  document.getElementById('total-cleanups').textContent = stats.totalCleanups;
  document.getElementById('last-cleanup').textContent = stats.lastCleanup ? 
    new Date(stats.lastCleanup).toLocaleString() : 'Never';
  document.getElementById('financial-sites').textContent = stats.sensitiveSites;
  
  // Update whitelist/blacklist
  updateWhitelist();
  updateBlacklist();
}

function updateWhitelist() {
  const whitelistContainer = document.getElementById('whitelist');
  const existingItems = whitelistContainer.querySelectorAll('.site-item:not(:first-child)');
  existingItems.forEach(item => item.remove());
  
  settings.whitelist.forEach(domain => {
    const item = createSiteItem(domain, 'whitelist');
    whitelistContainer.appendChild(item);
  });
}

function updateBlacklist() {
  const blacklistContainer = document.getElementById('blacklist');
  const existingItems = blacklistContainer.querySelectorAll('.site-item:not(:first-child)');
  existingItems.forEach(item => item.remove());
  
  settings.blacklist.forEach(domain => {
    const item = createSiteItem(domain, 'blacklist');
    blacklistContainer.appendChild(item);
  });
}

function createSiteItem(domain, type) {
  const item = document.createElement('div');
  item.className = 'site-item';
  const label = document.createElement('span');
  label.className = 'domain';
  label.textContent = domain;
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => removeFromList(domain, type));
  item.append(label, removeBtn);
  
  return item;
}

// Accept "example.com", "https://example.com/path" or "*.example.com";
// store the bare hostname. Returns '' for anything that isn't a hostname.
function normalizeDomain(raw) {
  const host = String(raw).trim().toLowerCase()
    .replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/^\*\./, '');
  return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(host) ? host : '';
}

function addToWhitelist() {
  const input = document.getElementById('whitelist-input');
  const domain = normalizeDomain(input.value);
  
  if (domain && !settings.whitelist.includes(domain)) {
    settings.whitelist.push(domain);
    input.value = '';
    updateWhitelist();
  }
}

function addToBlacklist() {
  const input = document.getElementById('blacklist-input');
  const domain = normalizeDomain(input.value);
  
  if (domain && !settings.blacklist.includes(domain)) {
    settings.blacklist.push(domain);
    input.value = '';
    updateBlacklist();
  }
}

function removeFromList(domain, type) {
  if (type === 'whitelist') {
    settings.whitelist = settings.whitelist.filter(d => d !== domain);
    updateWhitelist();
  } else if (type === 'blacklist') {
    settings.blacklist = settings.blacklist.filter(d => d !== domain);
    updateBlacklist();
  }
}

async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    settings = {
      notifications: true,
      cookies: true,
      cache: true,
      history: false,
      downloads: false,
      passwords: false,
      formData: false,
      schedule: 'none',
      whitelist: [],
      blacklist: []
    };
    
    await saveSettings();
    updateUI();
  }
}

function exportSettings() {
  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'web-privacy-settings.json';
  link.click();
  
  URL.revokeObjectURL(url);
  showNotification('Settings exported successfully!', 'success');
}

function importSettings(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
        throw new Error('Not a settings object');
      }
      const clean = {};
      for (const key of ['notifications', 'cookies', 'cache', 'history', 'downloads', 'passwords', 'formData']) {
        if (typeof imported[key] === 'boolean') clean[key] = imported[key];
      }
      if (['none', 'hourly', 'daily', 'weekly'].includes(imported.schedule)) clean.schedule = imported.schedule;
      for (const key of ['whitelist', 'blacklist']) {
        if (Array.isArray(imported[key])) {
          clean[key] = [...new Set(imported[key].map(normalizeDomain).filter(Boolean))];
        }
      }
      settings = { ...settings, ...clean };
      saveSettings();
      updateUI();
      showNotification('Settings imported successfully!', 'success');
    } catch (error) {
      console.error('Failed to import settings:', error);
      showNotification('Failed to import settings. Invalid file format.', 'error');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#dc3545' : '#28a745'};
    color: white;
    padding: 12px 16px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}