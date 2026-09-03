# QR Code Generator (Chrome & Safari)

Generates QR codes for text/URL, WiFi, and contact (vCard) data, entirely on-device.

Features:
- Three input modes: Text/URL, WiFi (SSID, password, encryption type, hidden network), and Contact (vCard: name, phone, email, company, position)
- Customization: size (120-1024px), error-correction level (L/M/Q/H), module color, background color — adjustable from the in-popup Settings panel or the standalone Options page (`chrome://extensions` → Details → Extension options), both backed by the same saved defaults in `localStorage`
- If the chosen error-correction level can't fit the data, the generator automatically retries at progressively higher levels before showing an error message
- Live preview and PNG download
- UI in English, Spanish, Russian, and Chinese
- "Other Products" cross-promo panel linking to this developer's other published extensions: QuickLink Copier and Web Privacy - 1-Click Cleanup

## Install in Chrome
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select the `qr-code-generator-extension` folder

## Safari (macOS)
1. Install the latest Xcode
2. In Xcode: File > New > Project > Safari Web Extension (or run `xcrun safari-web-extension-converter qr-code-generator-extension`)
3. Follow Xcode's signing/build steps. The extension will show up under Safari > Extensions.

## Permissions (why none)
`permissions` is `[]` in the manifest. The extension never reads a tab, injects a content script, or talks to a server — it only renders QR codes client-side with the bundled `lib/qrcode.min.js` (qrcodejs, MIT) and reads/writes its own settings in `localStorage`.

## Data
Your last-used size, colors, error-correction level, and chosen UI language stay in the extension's own `localStorage`. Nothing is sent anywhere.
