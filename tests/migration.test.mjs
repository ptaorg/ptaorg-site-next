import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('published sitemap paths resolve to matching production canonicals', () => {
  const primary = read('sitemap.xml');
  const production = 'https://ptaorg.com';
  const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const primaryUrls = locations(primary);
  assert.ok(primaryUrls.length >= 750);
  assert.equal(new Set(primaryUrls).size, primaryUrls.length);

  for (const file of ['sitemap.xml', 'sitemap-research.xml']) {
    assert.ok(read('robots.txt').includes(`Sitemap: ${production}/${file}`));
    for (const location of locations(read(file))) {
      const url = new URL(location);
      assert.equal(url.origin, production);
      const pathname = decodeURIComponent(url.pathname).slice(1);
      const page = pathname === '' || pathname.endsWith('/') ? pathname + 'index.html' : pathname;
      assert.ok(read(page).includes(`<link rel="canonical" href="${location}">`), page);
    }
  }
});
