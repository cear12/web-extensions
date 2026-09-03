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
  let premium = { active: false };
  let settings = { showNotifications: true, autoTags: true, maxHistorySize: 5 };

  // Translation system
  const translations = {
    en: {
      'menu': 'Menu',
      'link-history': 'Link History',
      'settings': 'Settings',
      'language': 'Language',
      'premium': 'Premium',
      'about': 'About',
      'preferences': 'Preferences',
      'history': 'History',
      'select-language': 'Select Language',
      'current-page': 'Current Page',
      'copy-current-url': 'Copy Current URL',
      'total-copied': 'Total Copied',
      'today': 'Today',
      'recent-links': 'Recent Links',
      'view-all': 'View All',
      'clear-history': 'Clear History',
      'export-history': 'Export History',
      'show-notifications': 'Show notifications',
      'auto-tags': 'Auto-generate tags',
      'max-history-size': 'Max history size',
      'premium-features': 'Premium Features',
      'upgrade-to-premium': 'Upgrade to Premium',
      'start-trial': 'Start 7-day Free Trial',
      'developed-by': 'Developed by',
      'link-copied': 'Link copied!',
      'url-copied': 'URL copied to clipboard!',
      'copied': 'Copied',
      'failed': 'Failed',
      'history-cleared': 'History cleared',
      'no-links': 'No links copied yet',
      'no-history': 'No links in history',
      'just-now': 'Just now',
      'minutes-ago': 'm ago',
      'hours-ago': 'h ago',
      'days-ago': 'd ago',
      'no-active-tab': 'No active tab found',
      'failed-to-clear-history': 'Failed to clear history',
      'export-premium-feature': 'Export is a premium feature',
      'no-history-to-export': 'No history to export',
      'export-coming-soon': 'Export functionality coming soon!',
      'premium-upgrade-coming-soon': 'Premium upgrade coming soon!',
      'free-trial-coming-soon': 'Free trial coming soon!',
      'other-products': 'Other Products',
      'wordHeroName': 'WordHero',
      'wordHeroDescription': 'Learn vocabulary while browsing. Expand your word knowledge with interactive flashcards.',
      'qrCodeGeneratorName': 'QR Code Generator',
      'qrCodeGeneratorDescription': 'Generate QR codes for any URL instantly. Share links easily with mobile devices.',
      'viewInStore': 'View in Store'
    },
    es: {
      'menu': 'Menú',
      'link-history': 'Historial de Enlaces',
      'settings': 'Configuración',
      'language': 'Idioma',
      'premium': 'Premium',
      'about': 'Acerca de',
      'preferences': 'Preferencias',
      'history': 'Historial',
      'select-language': 'Seleccionar Idioma',
      'current-page': 'Página Actual',
      'copy-current-url': 'Copiar URL Actual',
      'total-copied': 'Total Copiados',
      'today': 'Hoy',
      'recent-links': 'Enlaces Recientes',
      'view-all': 'Ver Todo',
      'clear-history': 'Limpiar Historial',
      'export-history': 'Exportar Historial',
      'show-notifications': 'Mostrar notificaciones',
      'auto-tags': 'Generar etiquetas automáticamente',
      'max-history-size': 'Tamaño máximo del historial',
      'premium-features': 'Características Premium',
      'upgrade-to-premium': 'Actualizar a Premium',
      'start-trial': 'Iniciar Prueba Gratuita de 7 Días',
      'developed-by': 'Desarrollado por',
      'link-copied': '¡Enlace copiado!',
      'url-copied': '¡URL copiada al portapapeles!',
      'copied': 'Copiado',
      'failed': 'Falló',
      'history-cleared': 'Historial limpiado',
      'no-links': 'Aún no se han copiado enlaces',
      'no-history': 'No hay enlaces en el historial',
      'just-now': 'Ahora mismo',
      'minutes-ago': 'm atrás',
      'hours-ago': 'h atrás',
      'days-ago': 'd atrás',
      'no-active-tab': 'No se encontró pestaña activa',
      'failed-to-clear-history': 'Error al limpiar historial',
      'export-premium-feature': 'La exportación es una función premium',
      'no-history-to-export': 'No hay historial para exportar',
      'export-coming-soon': '¡Funcionalidad de exportación próximamente!',
      'premium-upgrade-coming-soon': '¡Actualización premium próximamente!',
      'free-trial-coming-soon': '¡Prueba gratuita próximamente!',
      'other-products': 'Otros Productos',
      'wordHeroName': 'WordHero',
      'wordHeroDescription': 'Aprende vocabulario mientras navegas. Expande tu conocimiento de palabras con tarjetas interactivas.',
      'qrCodeGeneratorName': 'Generador de Códigos QR',
      'qrCodeGeneratorDescription': 'Genera códigos QR para cualquier URL al instante. Comparte enlaces fácilmente con dispositivos móviles.',
      'viewInStore': 'Ver en la Tienda'
    },
    ru: {
      'menu': 'Меню',
      'link-history': 'История Ссылок',
      'settings': 'Настройки',
      'language': 'Язык',
      'premium': 'Премиум',
      'about': 'О программе',
      'preferences': 'Предпочтения',
      'history': 'История',
      'select-language': 'Выберите язык',
      'current-page': 'Текущая страница',
      'copy-current-url': 'Копировать текущий URL',
      'total-copied': 'Всего скопировано',
      'today': 'Сегодня',
      'recent-links': 'Недавние ссылки',
      'view-all': 'Показать все',
      'clear-history': 'Очистить историю',
      'export-history': 'Экспорт истории',
      'show-notifications': 'Показывать уведомления',
      'auto-tags': 'Автоматически создавать теги',
      'max-history-size': 'Максимальный размер истории',
      'premium-features': 'Премиум функции',
      'upgrade-to-premium': 'Обновить до Премиум',
      'start-trial': 'Начать 7-дневную пробную версию',
      'developed-by': 'Разработано',
      'link-copied': 'Ссылка скопирована!',
      'url-copied': 'URL скопирован в буфер обмена!',
      'copied': 'Скопировано',
      'failed': 'Ошибка',
      'history-cleared': 'История очищена',
      'no-links': 'Ссылки еще не копировались',
      'no-history': 'Нет ссылок в истории',
      'just-now': 'Только что',
      'minutes-ago': 'м назад',
      'hours-ago': 'ч назад',
      'days-ago': 'д назад',
      'no-active-tab': 'Активная вкладка не найдена',
      'failed-to-clear-history': 'Ошибка при очистке истории',
      'export-premium-feature': 'Экспорт - это премиум функция',
      'no-history-to-export': 'Нет истории для экспорта',
      'export-coming-soon': 'Функция экспорта скоро появится!',
      'premium-upgrade-coming-soon': 'Обновление до премиум скоро!',
      'free-trial-coming-soon': 'Бесплатная пробная версия скоро!',
      'other-products': 'Другие Продукты',
      'wordHeroName': 'WordHero',
      'wordHeroDescription': 'Изучайте словарный запас во время просмотра. Расширяйте знания слов с помощью интерактивных карточек.',
      'qrCodeGeneratorName': 'Генератор QR Кодов',
      'qrCodeGeneratorDescription': 'Генерируйте QR коды для любой ссылки мгновенно. Легко делитесь ссылками с мобильными устройствами.',
      'viewInStore': 'Посмотреть в Магазине'
    },
    zh: {
      'menu': '菜单',
      'link-history': '链接历史',
      'settings': '设置',
      'language': '语言',
      'premium': '高级版',
      'about': '关于',
      'preferences': '偏好设置',
      'history': '历史记录',
      'select-language': '选择语言',
      'current-page': '当前页面',
      'copy-current-url': '复制当前URL',
      'total-copied': '总计复制',
      'today': '今天',
      'recent-links': '最近链接',
      'view-all': '查看全部',
      'clear-history': '清除历史',
      'export-history': '导出历史',
      'show-notifications': '显示通知',
      'auto-tags': '自动生成标签',
      'max-history-size': '最大历史记录大小',
      'premium-features': '高级功能',
      'upgrade-to-premium': '升级到高级版',
      'start-trial': '开始7天免费试用',
      'developed-by': '开发者',
      'link-copied': '链接已复制！',
      'url-copied': 'URL已复制到剪贴板！',
      'copied': '已复制',
      'failed': '失败',
      'history-cleared': '历史记录已清除',
      'no-links': '尚未复制任何链接',
      'no-history': '历史记录中无链接',
      'just-now': '刚刚',
      'minutes-ago': '分钟前',
      'hours-ago': '小时前',
      'days-ago': '天前',
      'no-active-tab': '未找到活动标签页',
      'failed-to-clear-history': '清除历史记录失败',
      'export-premium-feature': '导出是高级功能',
      'no-history-to-export': '没有历史记录可导出',
      'export-coming-soon': '导出功能即将推出！',
      'premium-upgrade-coming-soon': '高级版升级即将推出！',
      'free-trial-coming-soon': '免费试用即将推出！',
      'other-products': '其他产品',
      'wordHeroName': 'WordHero',
      'wordHeroDescription': '在浏览时学习词汇。通过互动卡片扩展您的词汇知识。',
      'qrCodeGeneratorName': '二维码生成器',
      'qrCodeGeneratorDescription': '为任何URL即时生成二维码。轻松与移动设备分享链接。',
      'viewInStore': '在商店中查看'
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
        'linkHistory', 'stats', 'premium', 'settings'
      ]);
      
      linkHistory = data.linkHistory || [];
      stats = data.stats || { totalCopied: 0, dailyCopied: 0 };
      premium = data.premium || { active: false };
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
      console.log('Popup lost focus, attempting to close');
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
    
    // Export history button
    const exportHistoryBtn = $('#export-history');
    if (exportHistoryBtn) {
      exportHistoryBtn.addEventListener('click', exportHistory);
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
    
    // Premium buttons
    const upgradeBtn = $('#upgrade-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        showToast(t('premium-upgrade-coming-soon'), 'info');
      });
    }
    
    const trialBtn = $('#trial-btn');
    if (trialBtn) {
      trialBtn.addEventListener('click', () => {
        showToast(t('free-trial-coming-soon'), 'info');
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
      const maxSize = premium.active ? 1000 : settings.maxHistorySize;
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
    
    // Update premium banner
    updatePremiumBanner();
    
    // Update settings checkboxes
    const showNotificationsCheckbox = $('#show-notifications');
    const autoTagsCheckbox = $('#auto-tags');
    
    if (showNotificationsCheckbox) {
      showNotificationsCheckbox.checked = settings.showNotifications;
    }
    if (autoTagsCheckbox) {
      autoTagsCheckbox.checked = settings.autoTags;
    }
    
    // Update premium status
    updatePremiumStatus();
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
  
  // Update premium banner
  function updatePremiumBanner() {
    const banner = $('#premium-banner');
    if (!banner) return;
    
    if (premium.active) {
      banner.classList.add('hidden');
  } else {
      banner.classList.remove('hidden');
    }
  }
  
  // Update premium status
  function updatePremiumStatus() {
    const premiumStatus = $('#premium-status');
    if (!premiumStatus) return;
    
    if (premium.active) {
      premiumStatus.innerHTML = `
        <div class="status-premium">
          <h4>Premium Active</h4>
          <p>You have access to all premium features!</p>
        </div>
      `;
    } else {
      premiumStatus.innerHTML = `
        <div class="status-free">
          <h4>Free Version</h4>
          <p>You're using the free version with basic features.</p>
        </div>
      `;
    }
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
  
  // Export history
  async function exportHistory() {
    if (!premium.active) {
      showToast(t('export-premium-feature'), 'error');
      return;
    }
    
    if (linkHistory.length === 0) {
      showToast(t('no-history-to-export'), 'error');
      return;
    }
    
    // TODO: Implement export functionality
    showToast(t('export-coming-soon'), 'info');
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
