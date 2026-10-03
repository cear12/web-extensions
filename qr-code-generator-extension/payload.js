// Pure helpers that build the text encoded in WiFi / vCard QR codes.
// Kept separate from popup.js so they can be unit-tested in Node.
(function (root) {
  // WiFi QR format: backslash, ; , " and : must be escaped in SSID/password.
  function escapeWiFi(text) {
    return String(text).replace(/([\\;,":])/g, '\\$1');
  }

  // vCard 3.0 text values: escape backslash, ; , and newlines so user input
  // cannot change the structure of the card.
  function escapeVCard(text) {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  const api = { escapeWiFi, escapeVCard };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.QRPayload = api;
})(typeof self !== 'undefined' ? self : this);
