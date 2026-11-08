import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('single main landmark, preserved heritage footer and production markup',()=>{
 for(const f of ['index.html','explore.html','municipality.html','article.html','school.html']){
  const html=read(f);
  assert.equal((html.match(/<main(?:\s|>)/g)||[]).length,1,f);
  assert.equal((html.match(/<footer/g)||[]).length,1,f);
  assert.match(html,/assets\/redesign\.css/);
  assert.match(html,/assets\/redesign\.js/);
  assert.match(html,/footer-heritage-support/);
 }
});
test('approved hero stays above separate navy search section',()=>{
 const html=read('index.html');
 assert.ok(html.indexOf('class="hero"')<html.indexOf('class="archive-search"'));
 assert.match(html,/id="japan-map"/);
});
test('map is bundled and has 47 clickable prefecture paths',()=>{
 const svg=read('assets/japan-prefectures.svg');
 assert.equal((svg.match(/data-code="/g)||[]).length,47);
 assert.match(svg,/Geolonia/);
 const js=read('assets/redesign.js');
 assert.match(js,/new DOMParser\(\)/);
 assert.match(js,/data-code/);
});
test('unpublished document entries have no generated original-PDF href',()=>{
 const js=read('assets/redesign.js');
 assert.match(js,/公開前確認中/);
 assert.match(js,/school\.html\?url=/);
 assert.ok(!/d\.url\s*\)/.test(js));
});
test('data JSONs are full public indexes',()=>{
 const map=JSON.parse(read('data/research-map-index.json'));
 const replies=JSON.parse(read('data/board-responses.json'));
 assert.equal(map.municipalities.length,29);
 assert.equal(map.municipalities.reduce((n,m)=>n+(m.schools||[]).length,0),569);
 assert.equal(replies.responses.length,72);
});
