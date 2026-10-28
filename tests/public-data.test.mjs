import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));
const map = read('research-map-index.json');
const answers = read('board-responses.json');

test('full indexed source data is present rather than demo-only', () => {
  assert.ok(Array.isArray(map.municipalities));
  assert.equal(map.municipalities.length, 29);
  assert.equal(map.municipalities.flatMap(m => m.schools || []).length, 569);
  assert.ok(Array.isArray(answers.responses));
  assert.equal(answers.responses.length, 72);
});

test('school detail routes remain unique and point to canonical archive paths', () => {
  const schools = map.municipalities.flatMap(m => m.schools || []);
  const urls = schools.map(s => s.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const region of map.municipalities) {
    assert.ok(region.id && region.name && region.prefecture);
    for (const school of region.schools || []) {
      assert.match(school.url, /^\/archive\/[\w/-]+\/$/);
      assert.ok(school.name && school.type);
      assert.ok(Array.isArray(school.documents));
    }
  }
});

test('published source answers retain canonical links, without external targets', () => {
  for (const answer of answers.responses) {
    assert.ok(answer.municipality);
    assert.match(answer.url, /^https:\/\/ptaorg\.com\/board-responses\/[\w-]+\.html$/);
  }
});

test('index does not disclose document download URLs from pending source records', () => {
  for (const region of map.municipalities) {
    for (const school of region.schools || []) {
      for (const document of school.documents || []) {
        assert.ok(typeof document.title === 'string');
        assert.ok(typeof document.status === 'string');
        if (document.status === '公開前確認中') {
          for (const key of ['downloadUrl', 'download_url', 'url', 'fileUrl', 'file_url']) {
            assert.equal(document[key], undefined, 'pending document has an unexpected download URL');
          }
        }
      }
    }
  }
});

test('searches against entire index isolate 安行小学校 and keep municipality matches', () => {
  const box = { exports: {} };
  new Function('module', fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8'))(box);
  const search = (query, extra = {}) => box.exports.matchedRecordsFactory(map, answers, { query, ...extra });
  const schools = search('安行小学校').schools;
  assert.deepEqual(schools.map(x => x.name), ['安行小学校']);
  assert.equal(search('川口市').schools.length, 38);
  assert.equal(search('安行小学校', { schoolType: '中学校' }).schools.length, 0);
});
