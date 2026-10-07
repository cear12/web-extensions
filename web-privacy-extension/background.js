// Web Privacy Extension - Background Service Worker
// Handles alarms, notifications, and background tasks

importScripts('cleanup.js');

const BG_I18N = {
  en: {
    title: 'Web Privacy',
    installedTitle: 'Web Privacy Installed',
    done: 'Privacy cleanup completed successfully!',
    failed: 'Privacy cleanup failed: ',
    welcome: 'Your privacy protection is now active. Click the extension icon to get started!'
  },
  es: {
    title: 'Web Privacy',
    installedTitle: 'Web Privacy instalado',
    done: '¡Limpieza de privacidad completada con éxito!',
    failed: 'Error en la limpieza de privacidad: ',
    welcome: 'Tu protección de privacidad ya está activa. ¡Haz clic en el icono de la extensión para empezar!'
  },
  ru: {
    title: 'Web Privacy',
    installedTitle: 'Web Privacy установлен',
    done: 'Очистка приватности успешно завершена!',
    failed: 'Не удалось выполнить очистку: ',
    welcome: 'Защита приватности активна. Нажмите на значок расширения, чтобы начать!'
  },
  zh: {
    title: 'Web Privacy',
    installedTitle: 'Web Privacy 已安装',
    done: '隐私清理已成功完成！',
    failed: '隐私清理失败：',
    welcome: '隐私保护现已启用。点击扩展图标即可开始！'
  },
  hi: {
    title: 'Web Privacy',
    installedTitle: 'Web Privacy इंस्टॉल हो गया',
    done: 'प्राइवेसी सफ़ाई सफलतापूर्वक पूरी हुई!',
    failed: 'प्राइवेसी सफ़ाई विफल रही: ',
    welcome: 'आपकी प्राइवेसी सुरक्षा अब चालू है। शुरू करने के लिए एक्सटेंशन आइकन पर क्लिक करें!'
  }
};

// Mirrors popup.js: saved choice, else browser language, else 'ru'.
function detectBrowserLanguage() {
  let raw = '';
  try { raw = (self.navigator && navigator.language) || chrome.i18n.getUILanguage() || ''; } catch (e) {}
  const lang = String(raw).toLowerCase().split(/[-_]/)[0];
  return BG_I18N[lang] ? lang : 'ru';
}

async function getUiLanguage() {
  try {
    const { ui_language } = await chrome.storage.local.get('ui_language');
    if (BG_I18N[ui_language]) return ui_language;
    const { webPrivacyLanguage } = await chrome.storage.sync.get('webPrivacyLanguage');
    const lang = BG_I18N[webPrivacyLanguage] ? webPrivacyLanguage : detectBrowserLanguage();
    await chrome.storage.local.set({ ui_language: lang });
    return lang;
  } catch (e) {
    return detectBrowserLanguage();
  }
}

async function bgT(key) {
  const lang = await getUiLanguage();
  return (BG_I18N[lang] && BG_I18N[lang][key]) || BG_I18N.en[key];
}

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
      getUiLanguage();
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
          title: await bgT('title'),
          message: await bgT('done')
        });
      }

    } catch (error) {
      console.error('Scheduled cleanup failed:', error);
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: await bgT('title'),
        message: (await bgT('failed')) + error.message
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
        title: await bgT('installedTitle'),
        message: await bgT('welcome')
      });

    } catch (error) {
      console.error('Failed to handle first install:', error);
    }
  }
}

// Initialize background service
new WebPrivacyBackground();
