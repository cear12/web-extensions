# Random LeetCode Problem (Chrome & Safari)

Shows a random free LeetCode problem to practice, with difficulty filtering.

Features:
- One click gets a random free LeetCode problem (title, difficulty, direct link)
- Difficulty filter: All / Easy / Medium / Hard
- Problem list is cached locally for 24h so opening the popup doesn't re-fetch LeetCode's full problem list every time — "Refresh list" in Settings forces an update
- Copy button puts the problem title + link on the clipboard
- Dark/light theme (auto-detect), UI in English/Spanish/Russian

## Install in Chrome
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select the `random-leetcode-problem` folder

## Safari (macOS)
1. Install the latest Xcode
2. In Xcode: File > New > Project > Safari Web Extension (or run `xcrun safari-web-extension-converter random-leetcode-problem`)
3. Follow Xcode's signing/build steps. The extension will show up under Safari > Extensions.

## Permissions (why so few)
- `host_permissions: ["https://leetcode.com/*"]` — the extension's only job is fetching LeetCode's public problem list (`/api/problems/all/`); this is the one host it ever talks to.
- `storage` — caches the free-problem list and your difficulty filter locally.
- `clipboardWrite` — for the Copy button.

No `activeTab`, no content scripts, no access to the page you're browsing.

## Data
Everything (cached problem list, difficulty filter) stays in `chrome.storage.local` on your machine. Nothing is sent anywhere except the read-only request to LeetCode's own public API.

## Where this came from
Based on a small personal script that did a live fetch + random pick with no caching, filtering, or error handling. Restyled to match `qr-code-generator-extension` / `quick-link-copier-extension` in this repo — same popup/menu structure, i18n, and local-storage approach — and reuses their shared logo.
