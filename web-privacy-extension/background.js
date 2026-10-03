// Web Privacy Extension - Background Service Worker
// Handles alarms, notifications, and background tasks

importScripts('cleanup.js');

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
    chrome.runtime.onMessage.addListener((request, sender) => {
      // Only our own extension pages may change the schedule.
      if (sender.id !== chrome.runtime.id || !(sender.url || '').startsWith(chrome.runtime.getURL(''))) return;
      switch (request.action) {
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
      await WebPrivacyCleanup.run(cleanupOptions, settings.whitelist);

      await WebPrivacyCleanup.recordCleanup();

      if (settings.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon48.png',
          title: 'Web Privacy',
          message: 'Privacy cleanup completed successfully!'
        });
      }

    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Web Privacy',
        message: 'Privacy cleanup failed: ' + error.message
      });
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
