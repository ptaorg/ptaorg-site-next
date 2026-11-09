import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('all original site-next templates share the new footer',()=>{
 for(const name of ['index.html','explore.html','municipality.html','school.html']){
  const html=read(name);
  assert.equal((html.match(/class="site-footer footer-heritage"/g)||[]).length,1,name);
  assert.match(html,/assets\/footer\.css/);
  assert.match(html,/footer-heritage-support/);
  for(const brand of ['x','youtube','note']) assert.match(html,new RegExp('assets/brand-'+brand+'\\.svg'),name);
 }
});
test('support band is orange with navy text, not white on orange',()=>{
 const css=read('assets/footer.css');
 assert.match(css,/#f28a3d/i);
 assert.match(css,/footer-heritage-support strong\{[^}]*color:#122b43/i);
});
test('social logos are real vector path assets, not Unicode stand-ins',()=>{
 for(const brand of ['x','youtube','note']){
  const svg=read('assets/brand-'+brand+'.svg');
  assert.match(svg,/<svg/);
  assert.match(svg,/<path/);
  assert.match(svg,/viewBox="0 0 24 24"/);
 }
});
test('brand buttons lead to canonical known accounts',()=>{
 const html=read('index.html');
 assert.match(html,/x\.com\/jjjqqqxxx0852/);
 assert.match(html,/youtube\.com\/@PTA/);
 assert.match(html,/note\.com\/hiroshisatoh/);
});
