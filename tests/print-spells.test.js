import assert from 'node:assert/strict';
import test from 'node:test';
import { packPrintCards } from '../app/utils/print-spells.js';

function assertFitsWithoutOverlap(pages, count) {
  const items = pages.flatMap(page => page.items);
  assert.equal(items.length, count);
  assert.equal(new Set(items.map(item => item.index)).size, count);

  for (const page of pages) {
    for (const item of page.items) {
      assert.ok(item.x >= 0 && item.y >= 0);
      assert.ok(item.x + item.width <= 194 + 0.00001);
      assert.ok(item.y + item.height <= 280 + 0.00001);
      for (const other of page.items) {
        if (item === other) {
          continue;
        }
        const separate = item.x + item.width <= other.x
          || other.x + other.width <= item.x
          || item.y + item.height <= other.y
          || other.y + other.height <= item.y;
        assert.ok(separate, `Cards ${item.index} and ${other.index} overlap`);
      }
    }
  }
}

test('fills both columns without splitting cards or producing an empty page', () => {
  const cards = Array.from({ length: 6 }, () => ({ height: 100, wide: false }));
  const pages = packPrintCards(cards);
  assert.equal(pages.length, 2);
  assert.equal(pages[0].items.length, 4);
  assertFitsWithoutOverlap(pages, cards.length);
  assert.deepEqual(packPrintCards([]), []);
});

test('fills both columns below a full-width card', () => {
  const cards = [{ height: 140, wide: true }, { height: 130 }, { height: 130 }];
  const pages = packPrintCards(cards);
  assert.equal(pages.length, 1);
  assert.equal(pages[0].items[1].y, 144);
  assert.equal(pages[0].items[2].y, 144);
  assertFitsWithoutOverlap(pages, cards.length);
});

test('scales an over-height card uniformly to preserve its entire content', () => {
  const pages = packPrintCards([{ height: 560, wide: true }, { height: 80 }]);
  assert.equal(pages.length, 2);
  assert.equal(pages[0].items[0].scale, 0.5);
  assert.equal(pages[0].items[0].width, 97);
  assert.equal(pages[0].items[0].height, 280);
  assert.equal(pages[0].items[0].x, 48.5);
  assertFitsWithoutOverlap(pages, 2);
});

test('packs varying real-world card heights without loss or overflow', () => {
  const cards = Array.from({ length: 400 }, (_, index) => ({
    height: 35 + ((index * 79) % 420),
    wide: index % 7 === 0
  }));
  assertFitsWithoutOverlap(packPrintCards(cards), cards.length);
});

test('rejects invalid dimensions instead of silently omitting a card', () => {
  assert.throws(() => packPrintCards([{ height: 0 }]));
  assert.throws(() => packPrintCards([{ height: NaN }]));
});
