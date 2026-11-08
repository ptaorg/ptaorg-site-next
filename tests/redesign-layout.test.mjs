import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('approved pages are served from a single stylesheet and executable index UI',()=>{
 for(const file of ['index.html','explore.html','municipality.html','article.html','school.html']){
  const html=read(file);
  assert.match(html,/assets\/redesign\.css/);
  assert.match(html,/assets\/redesign\.js/);
  assert.match(html,/footer-heritage/);
  assert.equal((html.match(/<main /g)||[]).length>=1,true);
 }
});
test('the home hero and navy search are separate sibling blocks',()=>{
 const h=read('index.html');
 assert.ok(h.indexOf('class="hero"')<h.indexOf('class="archive-search"'));
 assert.ok(h.includes('id="japan-map"'));
 const heroAndSearch=h.slice(h.indexOf('<section class="hero">'),h.indexOf('<section class="archive-search"'));
 assert.ok(!heroAndSearch.includes('読み方'),'keep reading instructions out of the hero');
});
test('the source SVG has all prefectures with data-name and codes',()=>{
 const m=read('assets/japan-prefectures.svg');
 assert.equal((m.match(/data-code="/g)||[]).length,47);
 assert.match(m,/Geolonia/);
});
test('no unpublished PDF href is constructed in the renderer',()=>{
 const js=read('assets/redesign.js');
 assert.match(js,/公開前確認中/);
 assert.ok(!/d\.url.*href/i.test(js));
});
