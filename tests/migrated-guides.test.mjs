import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const catalogue=JSON.parse(read("data/public-guides-index.json")).pages;
const fulltext=JSON.parse(read("data/fulltext-guides.json")).guides;

test("17 legal/PPC source guides have full migration and provenance",()=>{
 assert.equal(catalogue.length,17);
 assert.equal(fulltext.length,17);
 const paths=new Set();
 for(const guide of catalogue){
   assert.match(guide.destination,/^guides\/[\w-]+\.html$/);
   assert.match(guide.sourceBlobSha,/^[0-9a-f]{40}$/);
   assert.ok(!paths.has(guide.destination));
   paths.add(guide.destination);
   assert.ok(existsSync(guide.destination));
   const html=read(guide.destination);
   assert.ok(html.includes('<div class="migrated-guide-body">'));
   assert.ok(html.includes(guide.url));
   assert.ok(html.includes(guide.sourceBlobSha));
   assert.ok(html.includes("../assets/guide-migration.css"));
   assert.ok(!html.includes('src="assets/redesign.js"'));
   const extracted=fulltext.find(f=>f.destination===guide.destination);
   assert.ok(extracted,"full-text index entry present "+guide.destination);
   assert.equal(extracted.sourceBlobSha,guide.sourceBlobSha);
   assert.ok(extracted.text.length>1500,"real source text indexed");
   assert.ok(html.includes("原掲載資料"));
 }
});

test("major PPC and administrative materials retain official source links",()=>{
 const ppc=read("guides/ppc-points.html");
 const detail=read("guides/ppc-school-pta-personal-data.html");
 const materials=read("guides/administrative-materials.html");
 assert.match(ppc,/個人情報保護委員会/);
 assert.match(detail,/個人情報保護法/);
 assert.match(materials,/文部科学省/);
 assert.ok((materials.match(/href="https:/g)||[]).length>60);
 assert.ok((ppc.match(/<img\b/g)||[]).length>=10,"PPC figures referenced without modification");
 assert.ok((read("guides/guide-pta.html").match(/<img\b/g)||[]).length>=15);
});

test("index routes to migrated sources and supports indexed full-text",()=>{
 const js=read("assets/redesign.js");
 const home=read("index.html");
 const hub=read("guides.html");
 assert.ok(js.includes('fetch("data/fulltext-guides.json")'));
 assert.ok(js.includes("g.destination"));
 assert.ok(home.includes('href="guides/ppc-points.html"'));
 assert.ok(hub.includes('href="guides/ppc-school-pta-personal-data.html"'));
 assert.ok(hub.includes('href="guides/guide-research.html"'));
 assert.ok(hub.includes('href="https://www.ppc.go.jp/files/pdf/202603_school_pta_pd_point.pdf"'));
});
