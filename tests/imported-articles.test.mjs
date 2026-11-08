import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const base=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const file=p=>fs.readFileSync(path.join(base,p),'utf8');
const manifest=JSON.parse(file('data/migrated-articles.json'));
test('source provenance recorded for every linked public research article',()=>{
 const journal=JSON.parse(file('data/public-journal-index.json'));
 assert.equal(manifest.articles.length,journal.articles.length);
 assert.equal(manifest.articles.length,27);
 assert.deepEqual(new Set(manifest.articles.map(a=>a.source)),new Set(journal.articles.map(a=>a.url)));

 assert.equal(new Set(manifest.articles.map(a=>a.slug)).size,manifest.articles.length);
 for(const item of manifest.articles){
  assert.match(item.sourceGitBlobSha,/^[0-9a-f]{40}$/);
  assert.match(item.source,/^https:\/\/ptaorg\.com\/journal\//);
  assert.ok(item.articleBodyOriginalChars>3000);
  assert.ok(item.sectionCount>=5);
  assert.ok(item.destination.startsWith('articles/'));
 }
});
test('every imported page retains original article structure, tables and images',()=>{
 for(const item of manifest.articles){
  const html=file(item.destination);
  assert.match(html,/noindex,nofollow/);
  assert.match(html,/assets\/redesign\.css/);
  assert.match(html,/source-article/);
  assert.ok(html.includes('data-source-slug="'+item.slug+'"'));
  assert.equal((html.match(/<main\b/g)||[]).length,1);
  assert.equal((html.match(/<footer\b/g)||[]).length,1);
  const start=html.indexOf('<article class="article-text source-article"');
  const end=html.indexOf('</article>',start);
  assert.ok(start>0&&end>start);
  const body=html.slice(start,end);
  assert.equal((body.match(/<h2\b/g)||[]).length,item.sectionCount);
  assert.equal((body.match(/<img\b/g)||[]).length,item.images);
  assert.ok(!/\b(?:href|src)=["']\/assets\//.test(body),'public source asset URLs must be absolute for isolated preview');
  assert.ok(!/<script\b|<iframe\b|onerror\s*=|javascript:/i.test(body));
 }
});
test('key source statements and evidentiary qualifications remain visible in the rendered text',()=>{
 const content={
 'pta-unified-legal-theory':['PTAへの加入勧誘','付録D','滋賀県監査結果'],
 'why-pta-membership-freedom-fails':['なぜPTAの入退会の自由は守られないのか','「子どものため」','巧妙化'],
 'yokohama-notice-1965':['学教第1965号','通知一式PDF','第61条・第69条'],
 'third-party-consent':['個人情報','同意','PTA'],
 'pta-fee-collection-legal-analysis':['学校徴収金','会費','法的'],
 'ichinomiya-pta-settlements-20261108':['21校','42件','原本PDF']
 };
 for(const [slug,phrases] of Object.entries(content)){
  const html=file('articles/'+slug+'.html');
  for(const phrase of phrases)assert.ok(html.includes(phrase),slug+' missing: '+phrase);
 }
});
