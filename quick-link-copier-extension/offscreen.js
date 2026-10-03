// Offscreen document used by the service worker to write to the clipboard
// on pages where script injection is impossible (chrome://, Web Store, ...).
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id || message.target !== 'offscreen' || message.action !== 'copy') return;
  const buf = document.getElementById('buf');
  buf.value = message.text;
  buf.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (_) { /* reported via ok */ }
  buf.value = '';
  sendResponse({ ok });
});
