# QuickLink Copier (Chrome & Safari)

One-click link copying with local history.

Features:
- Copy the current page's URL from the popup ("Copy Current URL"), the right-click context menu ("Copy page URL"), or the keyboard shortcut Ctrl+Shift+C (Cmd+Shift+C on macOS) — the shortcut is handled in-page by the content script, not a browser-level `chrome.commands` binding
- Copy any link via the right-click context menu ("Copy this link"), or by hovering over a link on the page and clicking the small copy button the content script adds
- Local history of recently-copied links (shown in the popup and on the Options page), with a configurable max size (5-1000 links) and automatic tags based on the link's domain (GitHub, StackOverflow, YouTube, etc.) and title keywords (tutorial, docs, api, blog)
- Export History, Export All Data (full JSON backup), and Import Data, all on the Options page
- Optional OS notifications confirming a copy, toggle in Settings
- UI in English, Spanish, Russian, and Chinese; light/dark theme auto-detected
- "Other Products" cross-promo panel (popup menu) linking to this developer's other published extensions: QR Code Generator and Web Privacy - 1-Click Cleanup

## Install in Chrome
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select the `quick-link-copier-extension` folder

## Safari (macOS)
1. Install the latest Xcode
2. In Xcode: File > New > Project > Safari Web Extension (or run `xcrun safari-web-extension-converter quick-link-copier-extension`)
3. Follow Xcode's signing/build steps. The extension will show up under Safari > Extensions.

## Permissions (why each one)
- `activeTab` — read the current tab's URL/title when you invoke the extension (popup click or context-menu item)
- `contextMenus` — the "Copy page URL" / "Copy this link" right-click menu items
- `storage` — `chrome.storage.local` holds your history, settings, and stats
- `clipboardWrite` — writing the copied URL to the clipboard
- `scripting` — `chrome.scripting.executeScript` runs the actual clipboard write inside the page when a context-menu action fires
- `notifications` — the optional "Link copied!" OS notification
- `host_permissions: ["<all_urls>"]` plus a content script matching `<all_urls>` — the hover-to-copy button on links and the in-page Ctrl+Shift+C shortcut both need to run on any page you're browsing; this is the one permission that's broader than "only when you click something," and it exists solely for that feature

## Data
Your link history, settings, and stats stay local in `chrome.storage.local`. The extension makes no network requests and sends nothing to any server.
