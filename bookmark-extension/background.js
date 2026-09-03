// background.js (MV3 service worker)
//
// Storage schema (chrome.storage.local, key "bookmarks"):
// {
//   id: string,
//   ext: "txt" | "md" | "markdown",   // real file extension, for the popup's badge
//   title: string,
//   baseUrl: string,   // URL with any #fragment stripped -- used to match "same file"
//   createdAt: number,
//   scrollRatio: number,
//   anchorText: string
// }
//
// PDF support was dropped: Chrome's built-in PDF viewer runs as a separate
// component extension and blocks content scripts from reaching its DOM or
// its own extension origin (confirmed via Chrome's own manifest validation,
// not just observed behavior -- see git history / README for the two
// approaches that were tried). Without that, there's no way to read or
// restore a page position automatically, only a manual "type the page
// number you see in the viewer" flow -- which isn't a bookmark feature
// worth shipping. TXT/MD bookmarking (scroll position + a text anchor) has
// no such platform restriction and works reliably.

const STORAGE_KEY = "bookmarks";
const EXT_PATTERN = /\.(txt|md|markdown)$/i;

function stripFragment(urlStr) {
  try {
    const u = new URL(urlStr);
    u.hash = "";
    return u.toString();
  } catch (e) {
    return urlStr;
  }
}

function detectExt(urlStr) {
  try {
    const u = new URL(urlStr);
    const path = decodeURIComponent(u.pathname);
    const m = EXT_PATTERN.exec(path);
    return m ? m[1].toLowerCase() : null;
  } catch (e) {
    return null;
  }
}

async function getBookmarks() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
}

async function saveBookmarks(list) {
  await chrome.storage.local.set({ [STORAGE_KEY]: list });
}

function uuid() {
  return (
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10)
  );
}

async function sendMessageToTab(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null); // no content script there (unsupported page, or the
                        // "Allow access to file URLs" toggle isn't on)
      } else {
        resolve(response);
      }
    });
  });
}

async function addBookmarkForTab(tab) {
  if (!tab || !tab.url) {
    return { ok: false, errorCode: "no-active-tab" };
  }
  const ext = detectExt(tab.url);
  if (!ext) {
    return { ok: false, errorCode: "unsupported-file-type" };
  }

  const baseUrl = stripFragment(tab.url);
  const bookmark = {
    id: uuid(),
    ext,
    title: tab.title || tab.url,
    baseUrl,
    createdAt: Date.now(),
    scrollRatio: 0,
    anchorText: "",
  };

  const pos = await sendMessageToTab(tab.id, { type: "GET_POSITION" });
  if (pos) {
    bookmark.scrollRatio = pos.scrollRatio;
    bookmark.anchorText = pos.anchorText;
  }
  // If pos is null, the content script wasn't reachable (most likely a
  // file:// tab without "Allow access to file URLs" enabled). We still save
  // the bookmark rather than failing outright -- it'll just restore to the
  // top of the file until that's fixed -- but tell the caller so the popup
  // can surface the real reason instead of pretending it worked perfectly.

  const list = await getBookmarks();
  list.unshift(bookmark);
  await saveBookmarks(list);
  return { ok: true, bookmark, positionCaptured: !!pos };
}

async function findOpenTabForUrl(baseUrl) {
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    if (t.url && stripFragment(t.url) === baseUrl) return t;
  }
  return null;
}

function waitForTabComplete(tabId, timeoutMs = 8000) {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        chrome.tabs.onUpdated.removeListener(listener);
        resolve(false);
      }
    }, timeoutMs);

    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        if (!done) {
          done = true;
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(listener);
          resolve(true);
        }
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function gotoBookmark(id) {
  const list = await getBookmarks();
  const bookmark = list.find((b) => b.id === id);
  if (!bookmark) return { ok: false, errorCode: "not-found" };

  let tab = await findOpenTabForUrl(bookmark.baseUrl);
  if (tab) {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    tab = await chrome.tabs.create({ url: bookmark.baseUrl });
    await chrome.windows.update(tab.windowId, { focused: true });
    await waitForTabComplete(tab.id);
  }

  let result = await sendMessageToTab(tab.id, {
    type: "RESTORE_POSITION",
    scrollRatio: bookmark.scrollRatio,
    anchorText: bookmark.anchorText,
  });

  if (!result) {
    // Content script may not have been ready yet (e.g. a freshly-created
    // tab); retry once before concluding it's genuinely unreachable.
    await new Promise((r) => setTimeout(r, 300));
    result = await sendMessageToTab(tab.id, {
      type: "RESTORE_POSITION",
      scrollRatio: bookmark.scrollRatio,
      anchorText: bookmark.anchorText,
    });
  }

  // Distinguish "the tab replied, but couldn't find the exact anchor"
  // (anchorFound: false) from "nothing replied at all" (result === null,
  // most likely a file:// tab without file-URL access enabled) -- these
  // need different messages in the popup.
  if (!result) {
    return { ok: true, reached: false };
  }
  return { ok: true, reached: true, anchorFound: result.anchorFound };
}

async function deleteBookmark(id) {
  const list = await getBookmarks();
  const next = list.filter((b) => b.id !== id);
  await saveBookmarks(next);
  return { ok: true };
}

async function renameBookmark(id, title) {
  const list = await getBookmarks();
  const bookmark = list.find((b) => b.id === id);
  if (!bookmark) return { ok: false, errorCode: "not-found" };
  bookmark.title = title;
  await saveBookmarks(list);
  return { ok: true };
}

async function getActiveTabInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return { supported: false };
  const ext = detectExt(tab.url);
  return {
    supported: !!ext,
    ext,
    url: tab.url,
    title: tab.title,
  };
}

// ---- Context menu ----
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-file-bookmark",
    title: "Add bookmark here",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "add-file-bookmark" && tab) {
    await addBookmarkForTab(tab);
  }
});

// ---- Message router (popup <-> background) ----
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") return;

  (async () => {
    switch (message.type) {
      case "GET_BOOKMARKS": {
        const list = await getBookmarks();
        sendResponse({ ok: true, bookmarks: list });
        break;
      }
      case "ADD_BOOKMARK_CURRENT_TAB": {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const result = await addBookmarkForTab(tab);
        sendResponse(result);
        break;
      }
      case "GOTO_BOOKMARK": {
        const result = await gotoBookmark(message.id);
        sendResponse(result);
        break;
      }
      case "DELETE_BOOKMARK": {
        const result = await deleteBookmark(message.id);
        sendResponse(result);
        break;
      }
      case "RENAME_BOOKMARK": {
        const result = await renameBookmark(message.id, message.title);
        sendResponse(result);
        break;
      }
      case "GET_ACTIVE_TAB_INFO": {
        const info = await getActiveTabInfo();
        sendResponse(info);
        break;
      }
      default:
        sendResponse({ ok: false, errorCode: "unknown-message" });
    }
  })();

  return true; // keep the message channel open for the async response
});
