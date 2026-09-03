// Web Privacy Extension - Background Service Worker
// Handles alarms, notifications, and background tasks

class WebPrivacyBackground {
  constructor() {
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.setupAlarmListener();
    this.setupCommandListener();
    this.setupInstallListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'sensitive-site-detected':
          this.handleSensitiveSiteDetection(request.data);
          break;
        case 'schedule-cleanup':
          this.scheduleCleanup(request.data);
          break;
        case 'cancel-schedule':
          this.cancelSchedule();
          break;
      }
    });
  }

  setupAlarmListener() {
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'privacy-cleanup') {
        this.runConfiguredCleanup();
      }
    });
  }

  setupCommandListener() {
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'cleanup-now') {
        this.runConfiguredCleanup();
      }
    });
  }

  setupInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        this.handleFirstInstall();
      }
    });
  }

  handleSensitiveSiteDetection(data) {
    this.storeSensitiveSiteVisit(data);
  }

  async storeSensitiveSiteVisit(data) {
    try {
      const result = await chrome.storage.local.get(['sensitiveSiteVisits']);
      const visits = result.sensitiveSiteVisits || [];

      visits.push({
        ...data,
        timestamp: new Date().toISOString()
      });

      // Keep only last 100 visits
      if (visits.length > 100) {
        visits.splice(0, visits.length - 100);
      }

      await chrome.storage.local.set({ sensitiveSiteVisits: visits });
    } catch (error) {
      console.error('Failed to store sensitive site visit:', error);
    }
  }

  async scheduleCleanup(data) {
    try {
      // Clear existing alarm
      await chrome.alarms.clear('privacy-cleanup');

      // Set new recurring alarm based on schedule
      const periodInMinutes = this.calculateSchedulePeriod(data.schedule);

      if (periodInMinutes) {
        await chrome.alarms.create('privacy-cleanup', {
          delayInMinutes: periodInMinutes,
          periodInMinutes: periodInMinutes
        });
      }
    } catch (error) {
      console.error('Failed to schedule cleanup:', error);
    }
  }

  calculateSchedulePeriod(schedule) {
    switch (schedule) {
      case 'hourly':
        return 60;
      case 'daily':
        return 24 * 60;
      case 'weekly':
        return 7 * 24 * 60;
      default:
        return null;
    }
  }

  async cancelSchedule() {
    try {
      await chrome.alarms.clear('privacy-cleanup');
    } catch (error) {
      console.error('Failed to cancel schedule:', error);
    }
  }

  // Shared by the recurring alarm (scheduled auto-cleanup) and the
  // "cleanup-now" keyboard shortcut (chrome.commands) -- both just run
  // a cleanup using whatever the user last saved in settings.
  async runConfiguredCleanup() {
    try {
      // Get cleanup settings
      const result = await chrome.storage.sync.get(['webPrivacySettings']);
      const settings = result.webPrivacySettings || {};

      // Prepare cleanup options
      const cleanupOptions = {
        cookies: settings.cookies !== false,
        cache: settings.cache !== false,
        history: settings.history || false,
        downloads: settings.downloads || false,
        passwords: settings.passwords || false,
        formData: settings.formData || false
      };

      // Execute cleanup
      await this.performCleanup(cleanupOptions);

      // Show notification
      if (settings.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Web Privacy',
          message: 'Privacy cleanup completed successfully!'
        });
      }

      // Update stats
      await this.updateCleanupStats();

    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
    }
  }

  async performCleanup(options) {
    return new Promise((resolve, reject) => {
      const dataTypes = {};
      const timeRange = { since: 0 };

      if (options.cookies) dataTypes.cookies = true;
      if (options.cache) dataTypes.cache = true;
      if (options.history) dataTypes.history = true;
      if (options.downloads) dataTypes.downloads = true;
      if (options.passwords) dataTypes.passwords = true;
      if (options.formData) dataTypes.formData = true;

      chrome.browsingData.remove(timeRange, dataTypes, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  async updateCleanupStats() {
    try {
      const result = await chrome.storage.local.get(['cleanupCount', 'lastCleanup']);
      const count = (result.cleanupCount || 0) + 1;

      await chrome.storage.local.set({
        cleanupCount: count,
        lastCleanup: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update cleanup stats:', error);
    }
  }

  async handleFirstInstall() {
    try {
      // Set default settings
      const defaultSettings = {
        cookies: true,
        cache: true,
        history: false,
        downloads: false,
        notifications: true
      };

      await chrome.storage.sync.set({ webPrivacySettings: defaultSettings });

      // Show welcome notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Web Privacy Installed',
        message: 'Your privacy protection is now active. Click the extension icon to get started!'
      });

    } catch (error) {
      console.error('Failed to handle first install:', error);
    }
  }
}

// Initialize background service
new WebPrivacyBackground();
