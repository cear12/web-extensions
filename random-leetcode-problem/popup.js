// Popup script for Random LeetCode Problem
// Fetches the public LeetCode problem list, caches the free-tier subset in
// chrome.storage.local (with a TTL so we don't re-fetch on every popup open),
// and shows a random problem with optional difficulty filtering.

(() => {
  'use strict';

  // Match the Chrome look-and-feel used by the other extensions in this
  // repo -- same detection snippet as qr-code-generator-extension.
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isChromium = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  document.documentElement.setAttribute('data-browser', isSafari ? 'safari' : (isChromium ? 'chrome' : 'chrome'));

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const API_URL = 'https://leetcode.com/api/problems/all/';
  const PROBLEM_URL = 'https://leetcode.com/problems/';
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h -- the problem list rarely changes

  // State
  let allProblems = [];              // normalized, free-only: {id, title, slug, difficulty}
  let cacheMeta = { fetchedAt: 0 };
  let currentProblem = null;
  let lastSlug = null;               // avoid showing the same problem twice in a row
  let settings = { difficulty: 'all' };

  // Translation system
  const translations = {
    en: {
      'menu': 'Menu',
      'settings': 'Settings',
      'language': 'Language',
      'about': 'About',
      'difficulty-filter': 'Difficulty',
      'show-problems': 'Show problems',
      'difficulty-all': 'All difficulties',
      'difficulty-easy': 'Easy',
      'difficulty-medium': 'Medium',
      'difficulty-hard': 'Hard',
      'problem-database': 'Problem database',
      'refresh-list': 'Refresh list',
      'refreshing': 'Refreshing…',
      'reset-to-defaults': 'Reset settings',
      'select-language': 'Select Language',
      'app-name': 'Random LeetCode Problem',
      'app-version': 'Version',
      'app-developer': 'Developed by Olé',
      'app-description': 'Picks a random free LeetCode problem so you can practice without endless scrolling.',
      'loading': 'Loading problems…',
      'next-problem': 'Next problem',
      'copy': 'Copy',
      'copied': 'Copied!',
      'copy-failed': 'Copy failed',
      'developed-by': 'Developed by',
      'error-loading': "Couldn't load problems.",
      'retry': 'Retry',
      'no-problems-filter': 'No problems match this filter.',
      'settings-reset': 'Settings reset',
      'cache-refreshed': 'Problem list refreshed',
      'refresh-failed': 'Refresh failed',
      'problems-cached': '{count} free problems cached',
      'not-loaded-yet': 'Not loaded yet',
      'updated-ago': 'Updated {time} ago',
      'updated-just-now': 'Updated just now'
    },
    es: {
      'menu': 'Menú',
      'settings': 'Configuración',
      'language': 'Idioma',
      'about': 'Acerca de',
      'difficulty-filter': 'Dificultad',
      'show-problems': 'Mostrar problemas',
      'difficulty-all': 'Todas las dificultades',
      'difficulty-easy': 'Fácil',
      'difficulty-medium': 'Media',
      'difficulty-hard': 'Difícil',
      'problem-database': 'Base de problemas',
      'refresh-list': 'Actualizar lista',
      'refreshing': 'Actualizando…',
      'reset-to-defaults': 'Restablecer ajustes',
      'select-language': 'Seleccionar idioma',
      'app-name': 'Random LeetCode Problem',
      'app-version': 'Versión',
      'app-developer': 'Desarrollado por Olé',
      'app-description': 'Elige un problema gratuito de LeetCode al azar para practicar sin tanto scroll.',
      'loading': 'Cargando problemas…',
      'next-problem': 'Siguiente problema',
      'copy': 'Copiar',
      'copied': '¡Copiado!',
      'copy-failed': 'Error al copiar',
      'developed-by': 'Desarrollado por',
      'error-loading': 'No se pudieron cargar los problemas.',
      'retry': 'Reintentar',
      'no-problems-filter': 'Ningún problema coincide con este filtro.',
      'settings-reset': 'Ajustes restablecidos',
      'cache-refreshed': 'Lista de problemas actualizada',
      'refresh-failed': 'Error al actualizar',
      'problems-cached': '{count} problemas gratuitos en caché',
      'not-loaded-yet': 'Aún no cargado',
      'updated-ago': 'Actualizado hace {time}',
      'updated-just-now': 'Actualizado justo ahora'
    },
    ru: {
      'menu': 'Меню',
      'settings': 'Настройки',
      'language': 'Язык',
      'about': 'О программе',
      'difficulty-filter': 'Сложность',
      'show-problems': 'Показывать задачи',
      'difficulty-all': 'Любая сложность',
      'difficulty-easy': 'Лёгкая',
      'difficulty-medium': 'Средняя',
      'difficulty-hard': 'Сложная',
      'problem-database': 'База задач',
      'refresh-list': 'Обновить список',
      'refreshing': 'Обновление…',
      'reset-to-defaults': 'Сбросить настройки',
      'select-language': 'Выберите язык',
      'app-name': 'Random LeetCode Problem',
      'app-version': 'Версия',
      'app-developer': 'Разработано Olé',
      'app-description': 'Выбирает случайную бесплатную задачу LeetCode, чтобы не листать список вручную.',
      'loading': 'Загрузка задач…',
      'next-problem': 'Следующая задача',
      'copy': 'Копировать',
      'copied': 'Скопировано!',
      'copy-failed': 'Не удалось скопировать',
      'developed-by': 'Разработано',
      'error-loading': 'Не удалось загрузить задачи.',
      'retry': 'Повторить',
      'no-problems-filter': 'Нет задач по этому фильтру.',
      'settings-reset': 'Настройки сброшены',
      'cache-refreshed': 'Список задач обновлён',
      'refresh-failed': 'Не удалось обновить',
      'problems-cached': 'В кэше {count} бесплатных задач',
      'not-loaded-yet': 'Ещё не загружено',
      'updated-ago': 'Обновлено {time} назад',
      'updated-just-now': 'Обновлено только что'
    }
  };

  let currentLanguage = localStorage.getItem('leetcode_language') || 'en';

  function t(key) {
    return (translations[currentLanguage] && translations[currentLanguage][key]) || key;
  }

  function tFormat(key, vars) {
    let str = t(key);
    Object.keys(vars).forEach((name) => {
      str = str.replace(`{${name}}`, vars[name]);
    });
    return str;
  }

  function translatePage(lang) {
    currentLanguage = lang;
    localStorage.setItem('leetcode_language', lang);

    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    // Dynamic content isn't tagged with data-i18n (it's rendered from JS), so
    // re-render it explicitly to pick up the new language.
    updateCacheInfo();
    if (currentProblem) {
      renderProblem(currentProblem);
    }
  }

  // ---- Storage ----

  async function loadSettings() {
    const data = await chrome.storage.local.get(['settings']);
    settings = { ...settings, ...data.settings };
  }

  async function saveSettings() {
    await chrome.storage.local.set({ settings });
  }

  async function loadCache() {
    const data = await chrome.storage.local.get(['problemsCache']);
    if (data.problemsCache && Array.isArray(data.problemsCache.problems)) {
      allProblems = data.problemsCache.problems;
      cacheMeta.fetchedAt = data.problemsCache.fetchedAt || 0;
    }
  }

  function isCacheFresh() {
    return allProblems.length > 0 && (Date.now() - cacheMeta.fetchedAt) < CACHE_TTL_MS;
  }

  // ---- LeetCode API ----

  async function fetchProblems() {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`LeetCode API responded with ${response.status}`);
    }
    const data = await response.json();
    const pairs = Array.isArray(data.stat_status_pairs) ? data.stat_status_pairs : [];

    // Only free problems, so the generated link always works without
    // LeetCode Premium. Normalized down to the handful of fields we
    // actually use -- the raw payload carries a lot we'd otherwise cache
    // for nothing.
    const normalized = pairs
      .filter((p) => p.paid_only === false)
      .map((p) => ({
        id: p.stat.frontend_question_id,
        title: p.stat.question__title,
        slug: p.stat.question__title_slug,
        difficulty: p.difficulty.level // 1 = Easy, 2 = Medium, 3 = Hard
      }));

    allProblems = normalized;
    cacheMeta.fetchedAt = Date.now();
    await chrome.storage.local.set({
      problemsCache: { problems: normalized, fetchedAt: cacheMeta.fetchedAt }
    });

    return normalized;
  }

  // ---- Problem selection ----

  function filteredPool() {
    if (settings.difficulty === 'all') return allProblems;
    const level = { easy: 1, medium: 2, hard: 3 }[settings.difficulty];
    return allProblems.filter((p) => p.difficulty === level);
  }

  function pickRandomProblem() {
    let pool = filteredPool();
    if (pool.length === 0) return null;

    // Avoid immediately repeating the same problem when the pool allows it.
    if (pool.length > 1 && lastSlug) {
      const withoutLast = pool.filter((p) => p.slug !== lastSlug);
      if (withoutLast.length > 0) pool = withoutLast;
    }

    const problem = pool[Math.floor(Math.random() * pool.length)];
    lastSlug = problem.slug;
    return problem;
  }

  function difficultyLabel(level) {
    if (level === 1) return { text: t('difficulty-easy'), cls: 'easy' };
    if (level === 2) return { text: t('difficulty-medium'), cls: 'medium' };
    if (level === 3) return { text: t('difficulty-hard'), cls: 'hard' };
    return { text: '?', cls: '' };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Rendering ----

  function renderLoading() {
    const card = $('#problem-card');
    if (card) card.innerHTML = `<div class="problem-state">${t('loading')}</div>`;
    setCopyEnabled(false);
  }

  function renderError() {
    const card = $('#problem-card');
    if (card) {
      card.innerHTML = `
        <div class="problem-state error">${t('error-loading')}</div>
        <button type="button" id="retry-btn" class="retry-btn">${t('retry')}</button>
      `;
      $('#retry-btn')?.addEventListener('click', () => loadAndShow(false));
    }
    setCopyEnabled(false);
  }

  function renderEmpty() {
    const card = $('#problem-card');
    if (card) card.innerHTML = `<div class="problem-state">${t('no-problems-filter')}</div>`;
    currentProblem = null;
    setCopyEnabled(false);
  }

  function renderProblem(problem) {
    currentProblem = problem;
    const { text, cls } = difficultyLabel(problem.difficulty);
    const url = PROBLEM_URL + problem.slug;
    const card = $('#problem-card');
    if (!card) return;

    card.innerHTML = `
      <a href="${url}" target="_blank" rel="noopener" class="problem-title">${escapeHtml(problem.title)}</a>
      <div class="problem-meta">
        <span class="difficulty-badge ${cls}">${text}</span>
        <span class="problem-number">#${problem.id}</span>
      </div>
    `;
    setCopyEnabled(true);
  }

  function setCopyEnabled(enabled) {
    const btn = $('#copy-btn');
    if (btn) btn.disabled = !enabled;
  }

  function timeAgoShort(ts) {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return null;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  function updateCacheInfo() {
    const el = $('#cache-info');
    if (!el) return;

    if (allProblems.length === 0 || !cacheMeta.fetchedAt) {
      el.textContent = t('not-loaded-yet');
      return;
    }

    const countText = tFormat('problems-cached', { count: allProblems.length });
    const ago = timeAgoShort(cacheMeta.fetchedAt);
    const agoText = ago ? tFormat('updated-ago', { time: ago }) : t('updated-just-now');
    el.textContent = `${countText} · ${agoText}`;
  }

  // ---- Actions ----

  async function showNextProblem() {
    const problem = pickRandomProblem();
    if (!problem) {
      renderEmpty();
      return;
    }
    renderProblem(problem);
  }

  async function loadAndShow(useCacheIfFresh = true) {
    try {
      if (!(useCacheIfFresh && isCacheFresh())) {
        renderLoading();
        await fetchProblems();
      }
      updateCacheInfo();
      await showNextProblem();
    } catch (error) {
      console.error('Error loading LeetCode problems:', error);
      renderError();
    }
  }

  async function handleRefreshClick() {
    const btn = $('#refresh-list');
    if (!btn) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('refreshing');

    try {
      await fetchProblems();
      updateCacheInfo();
      showToast(t('cache-refreshed'), 'success');
      await showNextProblem();
    } catch (error) {
      console.error('Error refreshing problem list:', error);
      showToast(t('refresh-failed'), 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  async function handleDifficultyChange(e) {
    settings.difficulty = e.target.value;
    await saveSettings();
    await showNextProblem();
  }

  async function handleResetSettings() {
    settings = { difficulty: 'all' };
    await saveSettings();

    const filterSelect = $('#difficulty-filter');
    if (filterSelect) filterSelect.value = 'all';

    showToast(t('settings-reset'), 'success');
    await showNextProblem();
  }

  async function handleCopyClick() {
    if (!currentProblem) return;
    const btn = $('#copy-btn');
    const url = PROBLEM_URL + currentProblem.slug;
    const text = `${currentProblem.title} — ${url}`;

    try {
      await navigator.clipboard.writeText(text);
      changeButtonState(btn, t('copied'));
    } catch (error) {
      console.error('Error copying problem link:', error);
      changeButtonState(btn, t('copy-failed'));
    }
  }

  function changeButtonState(button, text, duration = 1500) {
    if (!button) return;
    const original = button.textContent;
    button.disabled = true;
    button.textContent = text;
    setTimeout(() => {
      button.textContent = original;
      button.disabled = !currentProblem;
    }, duration);
  }

  // ---- Menu ----

  function openMenu() {
    $('#menu-widget')?.classList.remove('hidden');
    $('#menu-overlay')?.classList.remove('hidden');
    showMenuItems();
  }

  function closeMenu() {
    $('#menu-widget')?.classList.add('hidden');
    $('#menu-overlay')?.classList.add('hidden');
    hideAllPanels();
  }

  function showMenuItems() {
    const menuItems = $('.menu-items');
    if (menuItems) menuItems.style.display = 'block';
    hideAllPanels();
  }

  function showMenuPanel(section) {
    hideAllPanels();
    $(`#${section}-panel`)?.classList.remove('hidden');
    const menuItems = $('.menu-items');
    if (menuItems) menuItems.style.display = 'none';
  }

  function hideAllPanels() {
    $$('.menu-panel').forEach((panel) => panel.classList.add('hidden'));
  }

  // ---- Toast ----

  function showToast(message, type = 'info') {
    $('#toast')?.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;

    const colors = { success: '#34A853', error: '#EA4335', info: '#4285F4' };
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
    setTimeout(() => toast.remove(), 3000);
  }

  // ---- Init ----

  function setupEventListeners() {
    $('#menu-btn')?.addEventListener('click', openMenu);
    $('#close-btn')?.addEventListener('click', () => window.close());
    $('#menu-close')?.addEventListener('click', closeMenu);
    $('#menu-overlay')?.addEventListener('click', closeMenu);

    $$('.menu-item').forEach((item) => {
      item.addEventListener('click', () => showMenuPanel(item.dataset.section));
    });

    $$('.back-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.back === 'menu') showMenuItems();
      });
    });

    const languageSelect = $('#language-select');
    if (languageSelect) {
      languageSelect.value = currentLanguage;
      languageSelect.addEventListener('change', (e) => translatePage(e.target.value));
    }

    const difficultySelect = $('#difficulty-filter');
    if (difficultySelect) {
      difficultySelect.value = settings.difficulty;
      difficultySelect.addEventListener('change', handleDifficultyChange);
    }

    $('#refresh-list')?.addEventListener('click', handleRefreshClick);
    $('#reset-settings')?.addEventListener('click', handleResetSettings);
    $('#next-btn')?.addEventListener('click', showNextProblem);
    $('#copy-btn')?.addEventListener('click', handleCopyClick);
  }

  async function init() {
    try {
      await Promise.all([loadSettings(), loadCache()]);
      setupEventListeners();
      translatePage(currentLanguage);
      await loadAndShow(true);
    } catch (error) {
      console.error('Error initializing popup:', error);
      renderError();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
