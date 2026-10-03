const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(chrome) {
  const sandbox = { chrome, self: {}, console };
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../web-privacy-extension/cleanup.js'), 'utf8'), sandbox);
  return sandbox.WebPrivacyCleanup;
}

test('whitelistToOrigins normalises hosts and drops invalid entries', () => {
  const { whitelistToOrigins } = load({});
  assert.deepEqual(
    Array.from(whitelistToOrigins(['Example.com', 'https://a.b/path?x', '*.sub.test', 'bad host', '', 42])),
    [
      'https://example.com', 'http://example.com',
      'https://a.b', 'http://a.b',
      'https://sub.test', 'http://sub.test',
      'https://42', 'http://42'
    ]
  );
  assert.deepEqual(Array.from(whitelistToOrigins(undefined)), []);
});

test('run() passes selected data types and excludeOrigins to browsingData', async () => {
  let call;
  const chrome = {
    runtime: {},
    browsingData: { remove: (removal, types, cb) => { call = { removal, types }; cb(); } }
  };
  const { run } = load(chrome);
  await run({ cookies: true, cache: false, history: true }, ['keep.me']);
  assert.deepEqual(JSON.parse(JSON.stringify(call.types)), { cookies: true, history: true });
  assert.equal(call.removal.since, 0);
  assert.deepEqual(Array.from(call.removal.excludeOrigins), ['https://keep.me', 'http://keep.me']);
});

test('run() rejects when the browser reports an error', async () => {
  const chrome = {
    runtime: {},
    browsingData: { remove: (r, t, cb) => { chrome.runtime.lastError = { message: 'boom' }; cb(); } }
  };
  await assert.rejects(load(chrome).run({ cookies: true }, []), /boom/);
});

test('recordCleanup increments the stored counter', async () => {
  const store = { cleanupCount: 4 };
  const chrome = {
    storage: { local: {
      get: async () => ({ ...store }),
      set: async (v) => Object.assign(store, v)
    } }
  };
  const res = await load(chrome).recordCleanup();
  assert.equal(res.cleanupCount, 5);
  assert.equal(store.cleanupCount, 5);
  assert.ok(store.lastCleanup);
});
