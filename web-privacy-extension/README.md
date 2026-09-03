# Web Privacy - 1-Click Cleanup (Chrome & Safari)

One-click browsing data cleanup (cookies, cache, history, downloads, saved
passwords, form data), with an optional recurring auto-cleanup schedule, an
emergency keyboard shortcut, and a lightweight sensitive-site detector.

Features:
- Popup "Quick Settings": toggle cookies/cache/history/downloads and clear
  them immediately with one click (`chrome.browsingData.remove`)
- Options page adds Saved Passwords and Form Data to the cleanup set, an
  Auto Schedule (Hourly/Daily/Weekly, via `chrome.alarms`) that runs the
  same cleanup in the background on a recurring timer, and a
  Ctrl+Shift+Delete shortcut (`chrome.commands`) that runs an immediate
  cleanup using your saved settings even if the popup isn't open
- Content script flags sites matching common banking/trading/crypto/payment
  patterns (bank, PayPal, Coinbase, etc.): shows a brief on-page badge and
  logs the visit locally so the Options page can show a "Sensitive Sites
  Visited" count
- Optional notifications on install and after each cleanup
- Cleanup stats (count, last-run time) shown in both the popup and Options
- Export/import settings as JSON from the Options page
- Site Management on the Options page: save a whitelist/blacklist of
  domains locally for your own reference. Note: this list is not yet
  consulted by the cleanup or sensitive-site detection logic — it's a
  saved list only, not an enforced rule, today
- UI in English, Spanish, Russian, and Chinese
- "Other Products" cross-promo panel linking to this developer's other
  published extensions: QR Code Generator and QuickLink Copier

## Install in Chrome
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select the `web-privacy-extension` folder

## Safari (macOS)
1. Install the latest Xcode
2. In Xcode: File > New > Project > Safari Web Extension (or run `xcrun safari-web-extension-converter web-privacy-extension`)
3. Follow Xcode's signing/build steps. The extension will show up under Safari > Extensions.

## Permissions (why each one)
- `browsingData` — core functionality: clears cookies, cache, history,
  downloads, saved passwords, and form data on request.
- `storage` — settings, cleanup stats, and the sensitive-site visit log,
  all local/synced via `chrome.storage`.
- `alarms` — the recurring Auto Schedule cleanup.
- `notifications` — the install welcome message and post-cleanup
  confirmations (both optional, off by disabling "Show Notifications").
- `host_permissions: ["<all_urls>"]` + a `document_start` content script —
  needed to detect sensitive sites as they load, across all sites. This is
  the one broad permission this extension asks for; the content script
  only pattern-matches the URL/hostname and (if it matches) shows a
  small on-page badge — it doesn't read page content.

No `tabs` or `activeTab` — despite what an earlier version of this
manifest's `permissions_justification` implied, nothing here calls
`chrome.tabs.*`; sensitive-site detection runs entirely from the content
script above.

## Data
Everything (settings, stats, sensitive-site visit log) stays in
`chrome.storage` (local/synced within your own browser profile). Nothing
is sent to any external server — cleanup calls Chrome's own
`chrome.browsingData` API directly.

## Where this came from
Synced from the published Chrome Web Store package (v1.0.1), which had
evolved independently of earlier work on this extension — see this
folder's git history for the bug-fix and cross-promo-normalization passes
applied on import.
