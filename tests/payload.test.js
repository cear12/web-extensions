const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeWiFi, escapeVCard } = require('../qr-code-generator-extension/payload.js');

test('escapeWiFi escapes backslash ; , " and :', () => {
  assert.equal(escapeWiFi('a;b,c"d:e\\f'), 'a\\;b\\,c\\"d\\:e\\\\f');
  assert.equal(escapeWiFi('plain'), 'plain');
});

test('escapeVCard escapes structural characters and newlines', () => {
  assert.equal(escapeVCard('Doe; Jr, MD'), 'Doe\\; Jr\\, MD');
  assert.equal(escapeVCard('a\\b'), 'a\\\\b');
  assert.equal(escapeVCard('line1\nline2\r\nline3'), 'line1\\nline2\\nline3');
  assert.ok(!/\n/.test(escapeVCard('x\ny')));
});
