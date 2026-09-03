// Popup script for QuickLink Copier Extension
// Handles UI interactions, link copying, and history management

(() => {
  'use strict';
  
  // DOM elements
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // State
  let currentTab = null;
  let linkHistory = [];
  let stats = { totalCopied: 0, dailyCopied: 0 };
  let settings = { showNotifications: true, autoTags: true, maxHistorySize: 5 };

  // Translation system
  const translations = {
    en: {
      'menu': 'Menu',
      'settings': 'Settings',
      'language': 'Language',
      'about': 'About',
      'preferences': 'Preferences',
      'history': 'History',
      'select-language': 'Select Language',
      'current-page': 'Current Page',
      'copy-current-url': 'Copy Current URL',
      'total-copied': 'Total Copied',
      'today': 'Today',
      'recent-links': 'Recent Links',
      'clear-history': 'Clear History',
      'show-notifications': 'Show notifications',
      'auto-tags': 'Auto-generate tags',
      'max-history-size': 'Max history size',
      'developed-by': 'Developed by',
      'copied': 'Copied',
      'failed': 'Failed',
      'no-links': 'No links copied yet',
      'just-now': 'Just now',
      'minutes-ago': 'm ago',
      'hours-ago': 'h ago',
      'days-ago': 'd ago',
      'no-active-tab': 'No active tab found',
      'failed-to-clear-history': 'Failed to clear history',
      'other-products': 'Other Products',
      'view-in-store': 'View in Store',
      'qr-code-generator-name': 'QR Code Generator',
      'qr-code-generator-desc': 'Generate QR codes for text, URL, WiFi, and contacts with customization and PNG download.',
      'web-privacy-name': 'Web Privacy - 1-Click Cleanup',
      'web-privacy-desc': 'Professional privacy protection. One-click cleanup of browsing data.'
    },
    es: {
      'menu': 'Menú',
      'settings': 'Configuración',
      'language': 'Idioma',
      'about': 'Acerca de',
      'preferences': 'Preferencias',
      'history': 'Historial',
      'select-language': 'Seleccionar Idioma',
      'current-page': 'Página Actual',
      'copy-current-url': 'Copiar URL Actual',
      'total-copied': 'Total Copiados',
      'today': 'Hoy',
      'recent-links': 'Enlaces Recientes',
      'clear-history': 'Limpiar Historial',
      'show-notifications': 'Mostrar notificaciones',
      'auto-tags': 'Generar etiquetas automáticamente',
      'max-history-size': 'Tamaño máximo del historial',
      'developed-by': 'Desarrollado por',
      'copied': 'Copiado',
      'failed': 'Falló',
      'no-links': 'Aún no se han copiado enlaces',
      'just-now': 'Ahora mismo',
      'minutes-ago': 'm atrás',
      'hours-ago': 'h atrás',
      'days-ago': 'd atrás',
      'no-active-tab': 'No se encontró pestaña activa',
      'failed-to-clear-history': 'Error al limpiar historial',
      'other-products': 'Otros Productos',
      'view-in-store': 'Ver en la Tienda',
      'qr-code-generator-name': 'Generador de Códigos QR',
      'qr-code-generator-desc': 'Genera códigos QR para texto, URL, WiFi y contactos con personalización y descarga en PNG.',
      'web-privacy-name': 'Web Privacy - Limpieza en 1 Clic',
      'web-privacy-desc': 'Protección de privacidad profesional. Limpieza de datos de navegación con un clic.'
    },
    ru: {
      'menu': 'Меню',
      'settings': 'Настройки',
      'language': 'Язык',
      'about': 'О программе',
      'preferences': 'Предпочтения',
      'history': 'История',
      'select-language': 'Выберите язык',
      'current-page': 'Текущая страница',
      'copy-current-url': 'Копировать текущий URL',
      'total-copied': 'Всего скопировано',
      'today': 'Сегодня',
      'recent-links': 'Недавние ссылки',
      'clear-history': 'Очистить историю',
      'show-notifications': 'Показывать уведомления',
      'auto-tags': 'Автоматически создавать теги',
      'max-history-size': 'Максимальный размер истории',
      'developed-by': 'Разработано',
      'copied': 'Скопировано',
      'failed': 'Ошибка',
      'no-links': 'Ссылки еще не копировались',
      'just-now': 'Только что',
      'minutes-ago': 'м назад',
      'hours-ago': 'ч назад',
      'days-ago': 'д назад',
      'no-active-tab': 'Активная вкладка не найдена',
      'failed-to-clear-history': 'Ошибка при очистке истории',
      'other-products': 'Другие Продукты',
      'view-in-store': 'Посмотреть в Магазине',
      'qr-code-generator-name': 'Генератор QR Кодов',
      'qr-code-generator-desc': 'Генерируйте QR-коды для текста, URL, WiFi и контактов с настройкой и загрузкой в PNG.',
      'web-privacy-name': 'Web Privacy - Очистка в 1 клик',
      'web-privacy-desc': 'Профессиональная защита конфиденциальности. Очистка данных браузера в один клик.'
    },
    zh: {
      'menu': '菜单',
      'settings': '设置',
      'language': '语言',
      'about': '关于',
      'preferences': '偏好设置',
      'history': '历史记录',
      'select-language': '选择语言',
      'current-page': '当前页面',
      'copy-current-url': '复制当前URL',
      'total-copied': '总计复制',
      'today': '今天',
      'recent-links': '最近链接',
      'clear-history': '清除历史',
      'show-notifications': '显示通知',
      'auto-tags': '自动生成标签',
      'max-history-size': '最大历史记录大小',
      'developed-by': '开发者',
      'copied': '已复制',
      'failed': '失败',
      'no-links': '尚未复制任何链接',
      'just-now': '刚刚',
      'minutes-ago': '分钟前',
      'hours-ago': '小时前',
      'days-ago': '天前',
      'no-active-tab': '未找到活动标签页',
      'failed-to-clear-history': '清除历史记录失败',
      'other-products': '其他产品',
      'view-in-store': '在商店中查看',
      'qr-code-generator-name': '二维码生成器',
      'qr-code-generator-desc': '为文本、URL、WiFi和联系人生成二维码，支持自定义并下载为PNG。',
      'web-privacy-name': 'Web Privacy - 一键清理',
      'web-privacy-desc': '专业隐私保护。一键清理浏览数据。'
    }
  };
  
  let currentLanguage = localStorage.getItem('quicklink_language') || 'en';
  
  // Translation functions
  function translatePage(lang) {
    currentLanguage = lang;
    localStorage.setItem('quicklink_language', lang);
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
  }
  
  function t(key) {
    return translations[currentLanguage] && translations[currentLanguage][key] 
      ? translations[currentLanguage][key] 
      : key;
  }
  
  // Initialize popup
  async function init() {
    try {
      // Get current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tabs[0];
      
      // Load data from storage
      await loadData();
      
      // Setup UI
      setupEventListeners();
      updateUI();
      
      // Initialize language
      translatePage(currentLanguage);
      
      // Show current page info
      if (currentTab) {
        showCurrentPageInfo();
      }
      
    } catch (error) {
      console.error('Error initializing popup:', error);
    }
  }
  
  // Load data from Chrome storage
  async function loadData() {
    try {
      const data = await chrome.storage.local.get([
        'linkHistory', 'stats', 'settings'
      ]);

      linkHistory = data.linkHistory || [];
      stats = data.stats || { totalCopied: 0, dailyCopied: 0 };
      settings = { ...settings, ...data.settings };
      
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
  
  // Setup event listeners
  function setupEventListeners() {
    // Copy current URL button
    const copyBtn = $('#copy-current-url');
    if (copyBtn) {
      copyBtn.addEventListener('click', copyCurrentUrl);
    }
    
    // Menu button
    const menuBtn = $('#menu-btn');
    if (menuBtn) {
      menuBtn.addEventListener('click', openMenu);
    }
    
    // Close button
    const closeBtn = $('#close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => window.close());
    }
    
    // Close popup when it loses focus (same as left-click behavior)
    window.addEventListener('blur', () => {
      // Try to close popup by sending message to background script
      chrome.runtime.sendMessage({ action: 'closePopup' });
    });
    
    // Menu close button
    const menuCloseBtn = $('#menu-close');
    if (menuCloseBtn) {
      menuCloseBtn.addEventListener('click', closeMenu);
    }
    
    // Menu overlay
    const menuOverlay = $('#menu-overlay');
    if (menuOverlay) {
      menuOverlay.addEventListener('click', closeMenu);
    }
    
    // Menu items
    const menuItems = $$('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        showMenuPanel(section);
      });
    });
    
    // Back buttons
    const backBtns = $$('.back-btn');
    backBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const backTo = btn.dataset.back;
        if (backTo === 'menu') {
          showMenuItems();
        }
      });
    });
    
    
    
    // Clear history button in main window
    const clearHistoryMainBtn = $('#clear-history-main');
    if (clearHistoryMainBtn) {
      clearHistoryMainBtn.addEventListener('click', clearHistory);
    }

    // Settings checkboxes
    const showNotificationsCheckbox = $('#show-notifications');
    if (showNotificationsCheckbox) {
      showNotificationsCheckbox.addEventListener('change', updateSettings);
    }
    
    const autoTagsCheckbox = $('#auto-tags');
    if (autoTagsCheckbox) {
      autoTagsCheckbox.addEventListener('change', updateSettings);
    }
    
    // Language selection
    const languageSelect = $('#language-select');
  if (languageSelect) {
    languageSelect.value = currentLanguage;
    languageSelect.addEventListener('change', (e) => {
      translatePage(e.target.value);
      });
    }
  }
  
  // Copy current URL
  async function copyCurrentUrl() {
    try {
      if (!currentTab) {
        showToast(t('no-active-tab'), 'error');
        return;
      }

      const url = currentTab.url;
      const title = currentTab.title;
      const domain = new URL(url).hostname;

      // Copy to clipboard
      await navigator.clipboard.writeText(url);

      // Save to history
      const linkData = {
        url,
        title,
        domain,
        favicon: currentTab.favIconUrl,
        timestamp: Date.now(),
        tags: settings.autoTags ? generateTags(url, title) : []
      };

      await saveToHistory(linkData);

      // Update stats
      await updateStats();

      // Show success feedback on button
      const copyBtn = $('#copy-current-url');
      if (copyBtn) {
        changeButtonState(copyBtn, t('copied'), null, 2000);
      }

      // Update UI
      updateUI();

    } catch (error) {
      console.error('Error copying URL:', error);

      // Show error feedback on button
      const copyBtn = $('#copy-current-url');
      if (copyBtn) {
        changeButtonState(copyBtn, t('failed'), '#EA4335', 2000);
      }
    }
  }
  
  // Save link to history
  async function saveToHistory(linkData) {
    try {
      // Add to beginning of history
      linkHistory.unshift(linkData);

      // Apply size limit
      const maxSize = settings.maxHistorySize;
      if (linkHistory.length > maxSize) {
        linkHistory = linkHistory.slice(0, maxSize);
      }
      
      // Save to storage
      await chrome.storage.local.set({ linkHistory });
      
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }
  
  // Update statistics
  async function updateStats() {
    try {
      stats.totalCopied++;
      stats.dailyCopied++;
      
      // Reset daily counter if new day
      const today = new Date().toDateString();
      if (stats.lastResetDate !== today) {
        stats.dailyCopied = 1;
        stats.lastResetDate = today;
      }
      
      await chrome.storage.local.set({ stats });
      
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }
  
  // Generate automatic tags
  function generateTags(url, title) {
    const tags = [];
    
    try {
      const domain = new URL(url).hostname;
      
      // Add domain-based tags
      if (domain.includes('github.com')) tags.push('github');
      if (domain.includes('stackoverflow.com')) tags.push('stackoverflow');
      if (domain.includes('youtube.com')) tags.push('youtube');
      if (domain.includes('twitter.com') || domain.includes('x.com')) tags.push('social');
      if (domain.includes('linkedin.com')) tags.push('linkedin');
      if (domain.includes('reddit.com')) tags.push('reddit');
      if (domain.includes('medium.com')) tags.push('medium');
      if (domain.includes('dev.to')) tags.push('dev');
      
      // Add content-based tags
      if (title.toLowerCase().includes('tutorial')) tags.push('tutorial');
      if (title.toLowerCase().includes('documentation')) tags.push('docs');
      if (title.toLowerCase().includes('api')) tags.push('api');
      if (title.toLowerCase().includes('blog')) tags.push('blog');
      
    } catch (error) {
      console.error('Error generating tags:', error);
    }
    
    return tags;
  }
  
  // Change button state temporarily
  function changeButtonState(button, text, color, duration = 2000) {
    const originalText = button.querySelector('.btn-text').textContent;
    const originalColor = button.style.backgroundColor;
    
    // Change button appearance
    button.querySelector('.btn-text').textContent = text;
    if (color) {
      button.style.backgroundColor = color;
    }
    button.disabled = true;
    
    // Restore original state after duration
          setTimeout(() => {
      button.querySelector('.btn-text').textContent = originalText;
      if (color) {
        button.style.backgroundColor = originalColor;
      }
      button.disabled = false;
    }, duration);
  }

  // Show current page info
  function showCurrentPageInfo() {
    const pageInfo = $('#current-page-info');
    if (!pageInfo || !currentTab) return;
    
    const domain = new URL(currentTab.url).hostname;
    const title = currentTab.title.length > 50 
      ? currentTab.title.substring(0, 50) + '...' 
      : currentTab.title;
    
    // Truncate URL if too long
    const fullUrl = currentTab.url.length > 60 
      ? currentTab.url.substring(0, 60) + '...' 
      : currentTab.url;
    
    // Get favicon if available
    let faviconHtml = '';
    if (currentTab.favIconUrl && !currentTab.favIconUrl.startsWith('chrome://') && !currentTab.favIconUrl.startsWith('chrome-extension://')) {
      faviconHtml = `<img src="${currentTab.favIconUrl}" alt="Favicon" class="page-favicon" />`;
    }
    
    pageInfo.innerHTML = `
      <div class="page-header">
        ${faviconHtml}
        <div class="page-title">${title}</div>
      </div>
      <div class="page-domain">${domain}</div>
      <div class="page-url">${fullUrl}</div>
    `;
    
    // Add click handler to copy URL
    pageInfo.addEventListener('click', async () => {
      const titleElement = pageInfo.querySelector('.page-title');
      const originalText = titleElement.textContent;
      
      try {
        // Show "Copied" in the title
        titleElement.textContent = t('copied');
        
        await copyCurrentUrl();
        
        // Restore original text after 2 seconds
        setTimeout(() => {
          titleElement.textContent = originalText;
        }, 2000);
        
      } catch (error) {
        console.error('Error copying URL from page info:', error);
        titleElement.textContent = t('failed');
        setTimeout(() => {
          titleElement.textContent = originalText;
        }, 2000);
      }
    });
  }
  
  // Update UI
  function updateUI() {
    // Update stats
    const totalCopiedEl = $('#total-copied');
    const dailyCopiedEl = $('#daily-copied');
    
    if (totalCopiedEl) totalCopiedEl.textContent = stats.totalCopied;
    if (dailyCopiedEl) dailyCopiedEl.textContent = stats.dailyCopied;
    
    // Update recent links
    updateRecentLinks();
    
    // Update clear history button state
    updateClearHistoryButton();

    // Update settings checkboxes
    const showNotificationsCheckbox = $('#show-notifications');
    const autoTagsCheckbox = $('#auto-tags');
    
    if (showNotificationsCheckbox) {
      showNotificationsCheckbox.checked = settings.showNotifications;
    }
    if (autoTagsCheckbox) {
      autoTagsCheckbox.checked = settings.autoTags;
    }
  }
  
  // Update recent links
  function updateRecentLinks() {
    const recentLinksEl = $('#recent-links');
    if (!recentLinksEl) return;
    
    const recentLinks = linkHistory.slice(0, 5);
    
    if (recentLinks.length === 0) {
      recentLinksEl.innerHTML = `<div class="no-links">${t('no-links')}</div>`;
      return;
    }
    
    recentLinksEl.innerHTML = recentLinks.map(link => {
      const timeAgo = getTimeAgo(link.timestamp);
      const title = link.title.length > 30 
        ? link.title.substring(0, 30) + '...' 
        : link.title;
      
      // Get favicon if available
      let faviconHtml = '';
      if (link.favicon && !link.favicon.startsWith('chrome://') && !link.favicon.startsWith('chrome-extension://')) {
        faviconHtml = `<img src="${link.favicon}" alt="Favicon" class="link-favicon" />`;
      }
      
      return `
        <div class="recent-link-item" data-url="${link.url}">
          <div class="link-header">
            ${faviconHtml}
            <div class="link-title">${title}</div>
          </div>
          <div class="link-domain">${link.domain}</div>
          <div class="link-url">${link.url}</div>
          <div class="link-time">${timeAgo}</div>
        </div>
      `;
    }).join('');
    
    // Add click handlers to recent links
    const recentLinkItems = $$('.recent-link-item');
    recentLinkItems.forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        const titleElement = item.querySelector('.link-title');
        const originalText = titleElement.textContent;
        
        navigator.clipboard.writeText(url).then(() => {
          // Show "Copied" in the element
          titleElement.textContent = t('copied');
          
          // Restore original text after 2 seconds
          setTimeout(() => {
            titleElement.textContent = originalText;
          }, 2000);
        });
      });
    });
  }
  
  // Menu functions
  function openMenu() {
    const menuWidget = $('#menu-widget');
    const menuOverlay = $('#menu-overlay');
    
    if (menuWidget) menuWidget.classList.remove('hidden');
    if (menuOverlay) menuOverlay.classList.remove('hidden');
    
    showMenuItems();
  }

  function closeMenu() {
    const menuWidget = $('#menu-widget');
    const menuOverlay = $('#menu-overlay');
    
    if (menuWidget) menuWidget.classList.add('hidden');
    if (menuOverlay) menuOverlay.classList.add('hidden');
    
    hideAllPanels();
  }
  
  function showMenuItems() {
    const menuItems = $('.menu-items');
    if (menuItems) menuItems.style.display = 'block';
    hideAllPanels();
  }
  
  function showMenuPanel(section) {
    hideAllPanels();
    
    const panel = $(`#${section}-panel`);
    if (panel) {
      panel.classList.remove('hidden');
    }
    
    const menuItems = $('.menu-items');
    if (menuItems) menuItems.style.display = 'none';
    
    // Load panel-specific data
  }
  
  function hideAllPanels() {
    const panels = $$('.menu-panel');
    panels.forEach(panel => panel.classList.add('hidden'));
  }
  
  // Update clear history button state
  function updateClearHistoryButton() {
    const clearHistoryBtn = $('#clear-history-main');
    if (clearHistoryBtn) {
      if (linkHistory.length === 0) {
        clearHistoryBtn.disabled = true;
    } else {
        clearHistoryBtn.disabled = false;
      }
    }
  }
  
  // Clear history
  async function clearHistory() {
    // Clear history immediately without confirmation
      try {
        linkHistory = [];
        stats = { totalCopied: 0, dailyCopied: 0 };
        await chrome.storage.local.set({ linkHistory, stats });
        updateRecentLinks();
        updateUI();
      } catch (error) {
        console.error('Error clearing history:', error);
        showToast(t('failed-to-clear-history'), 'error');
      }
  }
  
  // Update settings
  async function updateSettings() {
    try {
      const showNotifications = $('#show-notifications')?.checked ?? true;
      const autoTags = $('#auto-tags')?.checked ?? true;
      
      settings.showNotifications = showNotifications;
      settings.autoTags = autoTags;
      
      await chrome.storage.local.set({ settings });
      
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }
  
  // Utility functions
  function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return t('just-now');
    if (minutes < 60) return `${minutes}${t('minutes-ago')}`;
    if (hours < 24) return `${hours}${t('hours-ago')}`;
    if (days < 7) return `${days}${t('days-ago')}`;
    
    return new Date(timestamp).toLocaleDateString();
  }
  
  function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = $('#toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    
    const colors = {
      success: '#34A853',
      error: '#EA4335',
      info: '#4285F4'
    };
    
    toast.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type] || colors.info};
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    `;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 3000);
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
