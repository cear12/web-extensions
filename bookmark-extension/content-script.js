// content-script.js
// Injected on every http(s)/file page (see manifest.json). Chrome's match-pattern
// syntax cannot reliably match "*.txt" once a query string is present, and cannot
// vary by case, so we self-filter here based on the actual pathname instead.
// If the current document is not a plain-text/markdown file, the script exits
// immediately and does nothing else.

(function () {
  const SUPPORTED_EXT = /\.(txt|md|markdown)$/i;

  function isSupportedTextFile() {
    try {
      const path = decodeURIComponent(location.pathname || "");
      return SUPPORTED_EXT.test(path);
    } catch (e) {
      return false;
    }
  }

  if (!isSupportedTextFile()) {
    return; // Not a page we handle.
  }

  // Chrome renders local/remote plain-text files as a single <pre> element
  // inside a minimal synthetic document. We treat document.body.innerText as
  // the canonical text content for the purposes of computing a scroll
  // position and an "anchor" snippet used to re-locate that position later
  // even if a few characters earlier in the file changed.

  function getFullText() {
    return document.body ? document.body.innerText || "" : "";
  }

  function currentScrollRatio() {
    const scrollable = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    return Math.min(Math.max(window.scrollY / scrollable, 0), 1);
  }

  function anchorAt(ratio, text) {
    if (!text.length) return "";
    let idx = Math.round(ratio * text.length);
    idx = Math.min(Math.max(idx, 0), Math.max(text.length - 1, 0));
    // Expand to the nearest preceding whitespace so we start on a word boundary.
    let start = idx;
    while (start > 0 && !/\s/.test(text[start - 1])) start--;
    const ANCHOR_LEN = 80;
    return text.slice(start, start + ANCHOR_LEN).trim();
  }

  function getPosition() {
    const text = getFullText();
    const ratio = currentScrollRatio();
    return {
      scrollRatio: ratio,
      anchorText: anchorAt(ratio, text),
      textLength: text.length,
    };
  }

  function scrollToRatio(ratio) {
    const scrollable = Math.max(
      document.documentElement.scrollHeight - window.innerHeight,
      1
    );
    window.scrollTo(0, ratio * scrollable);
  }

  function restorePosition({ scrollRatio, anchorText }) {
    const text = getFullText();
    let anchorFound = false;

    if (anchorText && anchorText.length > 0) {
      const idx = text.indexOf(anchorText);
      if (idx !== -1) {
        const newRatio = text.length ? idx / text.length : 0;
        scrollToRatio(newRatio);
        anchorFound = true;
      }
    }

    if (!anchorFound && typeof scrollRatio === "number") {
      // Fall back to the raw ratio saved at bookmark time. This is less
      // precise if the file changed length, but still gets the user close.
      scrollToRatio(scrollRatio);
    }

    return { anchorFound };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") return;

    if (message.type === "GET_POSITION") {
      sendResponse(getPosition());
      return;
    }

    if (message.type === "RESTORE_POSITION") {
      // Give layout a brief moment to settle for very large files.
      setTimeout(() => {
        const result = restorePosition(message);
        sendResponse(result);
      }, 60);
      return true; // keep the message channel open for the async sendResponse
    }
  });
})();
