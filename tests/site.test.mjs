import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const appModule={exports:{}};
new Function('module',fs.readFileSync(path.join(root,'assets/app.js'),'utf8'))(appModule);
const {normalize, matchedRecordsFactory, safeSourceLink}=appModule.exports;
const demo=JSON.parse(fs.readFileSync(path.join(root,'data/demo.json'),'utf8'));
const search=(query,extra={})=>matchedRecordsFactory(demo.map,demo.responses,{query,...extra});
test('four independent page files exist, with accessible search and single main landmark',()=>{
  for(const name of ['index.html','explore.html','municipality.html','school.html']){
    const html=fs.readFileSync(path.join(root,name),'utf8');
    assert.match(html,/<main\b[^>]*id="main"/);
    assert.equal((html.match(/<main\b/g)||[]).length,1,name);
    assert.match(html,/<nav\b[^>]*aria-label="メインナビゲーション"/);
    assert.match(html,/assets\/style\.css/);
    assert.match(html,/assets\/app\.js/);
  }
});
test('NFKC normalizes fullwidth and whitespace',()=>assert.equal(normalize(' 安行　小学校 '),normalize('安行小学校')));
test('school name shows exactly that school (not all municipality schools)',()=>{
  const {schools}=search('安行小学校');
  assert.deepEqual(schools.map(s=>s.name),['安行小学校']);
});
test('municipality term retrieves related schools and regional index',()=>{
  const results=search('射水市');assert.equal(results.municipalities.length,1);
  assert.equal(results.schools.length,5);
});
test('school-type filters exclude other types',()=>{
  assert.equal(search('相川小学校',{schoolType:'中学校'}).schools.length,0);
  assert.deepEqual(search('相川中学校',{schoolType:'中学校'}).schools.map(x=>x.name),['相川中学校']);
});
test('response topic term finds public answer metadata',()=>{
  assert.equal(search('みなし加入').responses.length,1);
  assert.equal(search('みなし加入').responses[0].municipality,'京都府亀岡市');
});
test('external answer URL is restricted to canonical public domain',()=>{
  assert.equal(safeSourceLink('https://example.org/evil'),'https://ptaorg.com/board-responses.html');
});
test('demo metadata documents are not given downloadable file URLs',()=>{
  const schools=demo.map.municipalities.flatMap(m=>m.schools||[]);
  assert.ok(schools.length>=20);
  for(const school of schools)for(const doc of school.documents||[]){assert.equal(Object.hasOwn(doc,'url'),false);}
});
test('demo municipalities match previously published 29-region list',()=>{
  assert.equal(demo.map.municipalities.length,29);
  assert.equal(demo.map.municipalities.reduce((sum,m)=>sum+(m.publishedIndexSchoolCount||0),0),569);
});
