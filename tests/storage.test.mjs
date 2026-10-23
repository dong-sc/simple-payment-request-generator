import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { after, test } from 'node:test';

const output = mkdtempSync(join(tmpdir(), 'tool-storage-test-'));
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc',
  'src/utils/storage.ts', 'src/utils/calculation.ts', '--outDir', output, '--module', 'commonjs',
  '--target', 'es2022', '--skipLibCheck']);
const require = createRequire(import.meta.url);
const storage = require(join(output, 'utils/storage.js'));
after(() => { delete globalThis.localStorage; rmSync(output, { recursive: true, force: true }); });
const load = storage.loadPaymentRequestData;
const save = storage.savePaymentRequestData;
const clear = storage.clearPaymentRequestData;

test('round-trips a synthetic draft and clears it', () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  const data = { ...load(), title: 'Synthetic recovery check' };
  save(data);
  assert.equal(load().title, data.title);
  assert.notEqual(clear().title, data.title);
  assert.equal(values.size, 0);
});

test('blocked storage never prevents editing or resetting', () => {
  globalThis.localStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  const data = load();
  assert.ok(data);
  assert.equal(save(data), false);
  assert.ok(clear());
});

test('a failed write preserves prior draft and a later write recovers', () => {
  let persisted = null;
  let full = false;
  globalThis.localStorage = {
    getItem: () => persisted,
    setItem: (_key, value) => { if (full) throw new Error('QuotaExceededError'); persisted = value; },
    removeItem: () => { persisted = null; },
  };
  const data = { ...load(), title: 'Earlier draft' };
  save(data);
  full = true;
  assert.equal(save({ ...data, title: 'Pending changes' }), false);
  assert.equal(load().title, 'Earlier draft');
  full = false;
  assert.equal(save({ ...data, title: 'Recovered draft' }), true);
  assert.equal(load().title, 'Recovered draft');
});

test('malformed JSON falls back to a usable document', () => {
  globalThis.localStorage = { getItem: () => '{broken' };
  assert.ok(load());
});

const { calculateTotals } = require(join(output, 'utils/calculation.js'));
test('synthetic calculation boundaries: empty, NaN, decimals, discount and tax', () => {
  globalThis.localStorage = { getItem: () => null };
  const base = load();
  const item = { ...base.items[0], quantity: 2.5, unitPrice: 100 };
  let result = calculateTotals({ ...base, items: [item], discountEnabled: true,
    discountAmount: 50, taxRate: 5, receivedAmount: 100 });
  assert.equal(result.requestTotal, 210);
  result = calculateTotals({ ...base, items: [], discountAmount: 999,
    taxRate: Number.NaN, receivedAmount: 999 });
  assert.equal(result.requestTotal, 0);
  result = calculateTotals({ ...base, items: [{ ...item, quantity: '', unitPrice: Number.NaN }],
    discountAmount: '', taxRate: '' });
  assert.equal(result.requestTotal, 0);
});

test('payment overpayment never produces a negative remaining balance', () => {
  const base = load();
  const result = calculateTotals({ ...base,
    items: [{ ...base.items[0], quantity: 1, unitPrice: 100 }],
    discountAmount: 0, taxRate: 5, receivedAmount: 200 });
  assert.equal(result.requestTotal, 105);
  assert.equal(result.remainingAmount, 0);
});

test('unread drafts survive autosave until an explicit reset', () => {
  for (const original of ['{broken', 'null', '[]', '{"title":42}']) {
    let persisted = original;
    globalThis.localStorage = {
      getItem: () => persisted,
      setItem: (_key, value) => { persisted = value; },
      removeItem: () => { persisted = null; },
    };
    const fallback = load();
    assert.equal(save({ ...fallback, title: 'Pending replacement' }), false);
    assert.equal(persisted, original);
    const fresh = clear();
    assert.equal(save({ ...fresh, title: 'Explicit fresh start' }), true);
    assert.equal(load().title, 'Explicit fresh start');
  }
});

test('a temporarily blocked read cannot silently replace the previous draft', () => {
  let persisted = '{"title":"Original draft"}';
  let blocked = true;
  globalThis.localStorage = {
    getItem: () => { if (blocked) throw new Error('SecurityError'); return persisted; },
    setItem: (_key, value) => { persisted = value; },
    removeItem: () => { persisted = null; },
  };
  const fallback = load();
  blocked = false;
  assert.equal(save(fallback), false);
  assert.equal(persisted, '{"title":"Original draft"}');
  assert.equal(save(clear()), true);
});

test('another tab update or deletion prevents stale autosave', () => {
  for (const externalValue of ['{"title":"Other tab update"}', null]) {
    delete require.cache[require.resolve(join(output, 'utils/storage.js'))];
    const tab = require(join(output, 'utils/storage.js'));
    let persisted = '{"title":"Initially shared draft"}';
    globalThis.localStorage = {
      getItem: () => persisted,
      setItem: (_key, value) => { persisted = value; },
      removeItem: () => { persisted = null; },
    };
    const pending = { ...tab.loadPaymentRequestData(), title: 'Unsaved local edits' };
    persisted = externalValue;
    assert.equal(tab.savePaymentRequestData(pending), false);
    assert.equal(persisted, externalValue);
    assert.equal(pending.title, 'Unsaved local edits');
    const fresh = tab.clearPaymentRequestData();
    assert.equal(tab.savePaymentRequestData(fresh), true);
  }
});

test('own saves advance the expected value, but failed writes do not', () => {
  delete require.cache[require.resolve(join(output, 'utils/storage.js'))];
  const tab = require(join(output, 'utils/storage.js'));
  let persisted = null;
  let full = false;
  globalThis.localStorage = {
    getItem: () => persisted,
    setItem: (_key, value) => { if (full) throw new Error('QuotaExceededError'); persisted = value; },
    removeItem: () => { persisted = null; },
  };
  const data = tab.loadPaymentRequestData();
  assert.equal(tab.savePaymentRequestData({ ...data, title: 'First save' }), true);
  full = true;
  assert.equal(tab.savePaymentRequestData({ ...data, title: 'Failed save' }), false);
  full = false;
  assert.equal(tab.savePaymentRequestData({ ...data, title: 'Recovered save' }), true);
  assert.equal(tab.loadPaymentRequestData().title, 'Recovered save');
});
