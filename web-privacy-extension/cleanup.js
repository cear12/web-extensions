// Shared cleanup logic, loaded by both the popup (<script>) and the
// service worker (importScripts). Keeps the browsingData call, the
// whitelist handling and the stats bookkeeping in one place.
(function (root) {
  const TYPES = ['cookies', 'cache', 'history', 'downloads', 'passwords', 'formData'];

  // Turn user-entered domains into origins accepted by browsingData.
  // Whitelisted sites are protected for the data types that support
  // origin filtering (cookies, cache, ...). History/downloads cannot be
  // filtered per site by the browsingData API.
  function whitelistToOrigins(whitelist) {
    const origins = [];
    for (const raw of Array.isArray(whitelist) ? whitelist : []) {
      const host = String(raw).trim().toLowerCase()
        .replace(/^[a-z]+:\/\//, '').replace(/\/.*$/, '').replace(/^\*\./, '');
      if (!/^[a-z0-9.-]+$/.test(host)) continue;
      origins.push(`https://${host}`, `http://${host}`);
    }
    return origins;
  }

  function run(options, whitelist) {
    const dataTypes = {};
    for (const key of TYPES) {
      if (options[key]) dataTypes[key] = true;
    }
    const removal = { since: 0 };
    const excludeOrigins = whitelistToOrigins(whitelist);
    if (excludeOrigins.length) removal.excludeOrigins = excludeOrigins;

    return new Promise((resolve, reject) => {
      chrome.browsingData.remove(removal, dataTypes, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message || 'Unknown error'));
        } else {
          resolve();
        }
      });
    });
  }

  // Read-modify-write on the freshest stored value, so the popup and the
  // service worker cannot overwrite each other with stale counters.
  async function recordCleanup() {
    const data = await chrome.storage.local.get(['cleanupCount']);
    const cleanupCount = (data.cleanupCount || 0) + 1;
    const lastCleanup = new Date().toISOString();
    await chrome.storage.local.set({ cleanupCount, lastCleanup });
    return { cleanupCount, lastCleanup };
  }

  root.WebPrivacyCleanup = { run, recordCleanup, whitelistToOrigins };
})(typeof self !== 'undefined' ? self : this);
