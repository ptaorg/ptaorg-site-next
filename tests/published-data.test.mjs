import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);
const map=JSON.parse(fs.readFileSync(path.join(root,'data/research-map-index.json'),'utf8'));
const responses=JSON.parse(fs.readFileSync(path.join(root,'data/board-responses.json'),'utf8'));
test('published archive index is loaded with its original inventory',()=>{
 assert.equal(map.municipalities.length,29);
 assert.equal(map.municipalities.reduce((n,m)=>n+(m.schools||[]).length,0),569);
 assert.equal(responses.responses.length,72);
});
test('there are no duplicate school page locations',()=>{
 const urls=map.municipalities.flatMap(m=>m.schools||[]).map(s=>s.url);
 assert.equal(new Set(urls).size,urls.length);
});
test('never provide unreviewed documents as downloadable files',()=>{
 const docs=map.municipalities.flatMap(m=>m.schools||[]).flatMap(s=>s.documents||[]);
 assert.ok(docs.length>1000);
 assert.ok(docs.some(d=>d.status==='公開前確認中'));
 for(const d of docs) {
  assert.equal(d.url,undefined);
  assert.equal(d.downloadUrl,undefined);
 }
});
test('education board answer destinations are the already public source',()=>{
 for(const r of responses.responses){
  assert.match(r.url,/^https:\/\/ptaorg\.com\/board-responses\//);
 }
});
test('source index dates are distinct from redesign date',()=>{
 assert.equal(map.updated,'2026-10-26');
 assert.ok(responses.generatedAt);
});
