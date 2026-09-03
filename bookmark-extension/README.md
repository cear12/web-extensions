# File Bookmarks (TXT / MD)

Bookmark your place in a TXT or Markdown file opened in Chrome, and jump straight back to it
the next time you open the same file.

Features:
- Bookmark the current tab from the popup or the right-click context menu ("Add bookmark here")
- Jump back with one click — reuses an already-open tab for that file if there is one, otherwise opens a new one
- Position is stored as a scroll ratio *and* a short text anchor, so if the file changes slightly the bookmark still finds the right spot by searching for that text rather than trusting a raw scroll percentage
- Rename or delete bookmarks from the popup
- Dark/light theme (auto-detect), UI in English/Spanish/Russian/Chinese

## Install in Chrome
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select the `bookmark-extension` folder
4. If you plan to bookmark local files (`file://...`): open the extension's card → **Details** → enable **Allow access to file URLs**. Without this, the extension can't read a local TXT/MD file's content or restore your position in it.

## Why no PDF support

The original design tried to support PDF bookmarking too, with the page number entered
manually (Chrome's built-in PDF viewer doesn't expose the current page to extensions, and
Chrome's own manifest validation blocks the one workaround that was tried — a content
script targeting the viewer's `chrome-extension://` origin directly; that's rejected
outright as an invalid scheme, not just fragile). A bookmark feature that can't tell you
where you actually were isn't worth shipping, so PDF support was dropped rather than kept
as a half-working manual-entry form. TXT/MD bookmarking has no such platform restriction —
Chrome renders both as plain text on a normal page, which a content script can read and
scroll like any other page.

## Permissions (why so few)
- `storage` — saves your bookmarks locally.
- `contextMenus` — the right-click "Add bookmark here" item.
- `tabs` + host permissions for `file://`, `http://`, `https://` — needed to detect whether
  a matching file is already open in another tab (so "Go" can focus it instead of opening
  a duplicate) and to open/focus tabs when jumping to a bookmark. The content script itself
  only ever runs on `.txt`/`.md`/`.markdown` pages — see `content-script.js`'s own filter.

## Known limitations
- If the saved text anchor (an ~80-character snippet) appears more than once in the file,
  the bookmark jumps to the first match, not necessarily the original one. Rare in practice
  for a real anchor length, but worth knowing.
- A `.md` file served by a web server with a MIME type that makes Chrome offer it as a
  download instead of rendering it as text isn't supported — there's nothing for the
  extension to read.

## Data
Everything (bookmarks, language choice) stays in `chrome.storage.local` on your machine.
Nothing is sent anywhere.

## Where this came from
Started as a rougher prototype that also tried to handle PDFs manually; restyled to match
`qr-code-generator-extension` / `quick-link-copier-extension` / `web-privacy-extension` in
this repo (same popup/menu structure, i18n, and cross-promo panel), with the PDF path
removed per the reasoning above and the TXT/MD flow audited for real bugs along the way.
