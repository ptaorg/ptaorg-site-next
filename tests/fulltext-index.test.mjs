import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const base=path.resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=p=>fs.readFileSync(path.join(base,p),"utf8");
const manifest=JSON.parse(read("data/migrated-articles.json"));
const parts=[1,2,3,4,5,6].map(i=>JSON.parse(read("data/fulltext-"+i+".json")));
test("six full-text parts contain exactly the 31 verified public papers",()=>{
 const list=parts.flatMap(p=>p.articles);
 assert.equal(list.length,31);
 assert.equal(new Set(list.map(a=>a.destination)).size,31);
 assert.deepEqual(new Set(list.map(a=>a.destination)),new Set(manifest.articles.map(a=>a.destination)));
 for(const p of parts)assert.equal(p.sourceCommit,manifest.sourceCommitSha);
 for(const a of list){
  assert.match(a.destination,/^articles\/[a-z0-9-]+\.html$/);
  assert.ok(a.text.length>200);
  assert.ok(!/<(?:script|article|h2|p)\b/i.test(a.text));
 }
});
test("all primary navigation to research leads to actual article search, not a placeholder",()=>{
 for(const file of ["index.html","explore.html","municipality.html","school.html","article.html",...manifest.articles.map(a=>a.destination)]){
  const html=read(file);
  const prefix=file.startsWith("articles/")?"../":"";
  assert.ok(html.includes('href="'+prefix+'explore.html?category=論考"'),file);
  assert.ok(!html.includes('href="'+prefix+'article.html"'),file);
 }
});
test("search index excludes private school PDF links",()=>{
 for(const p of parts)for(const a of p.articles){
  assert.ok(!a.text.includes("file:///"));
  assert.ok(!a.text.includes("sandbox:/"));
 }
});
