import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(path,"utf8");
const guides=JSON.parse(read("data/public-guides-index.json")).pages;

test("source-first PPC and legal guides are linked, unique and searchable",()=>{
 assert.equal(guides.length,9);
 assert.equal(new Set(guides.map(g=>g.id)).size,guides.length);
 assert.equal(new Set(guides.map(g=>g.url)).size,guides.length);
 for(const g of guides){
  assert.match(g.url,/^https:\/\/ptaorg\.com\/[\w-]+\.html$/);
  assert.ok(g.title&&g.description);
  assert.ok(g.themes.length>=1);
 }
 assert.ok(guides.some(g=>g.url.endsWith("/ppc-points.html")));
 assert.ok(guides.some(g=>g.url.endsWith("/ppc-school-pta-personal-data.html")));
 assert.ok(guides.some(g=>g.url.endsWith("/guide-research.html")));
});

test("guidance appears beneath the homepage hero and in archive search",()=>{
 const home=read("index.html"),explore=read("explore.html"),js=read("assets/redesign.js");
 assert.ok(home.includes('href="guides.html"'));
 assert.ok(home.indexOf('href="guides.html"')>home.indexOf('</section><section class="archive-search"'));
 assert.ok(home.includes("個人情報保護委員会（PPC）資料"));
 assert.ok(explore.includes('<option value="解説">'));
 assert.ok(explore.includes('data-type="解説"'));
 assert.ok(js.includes('fetch("data/public-guides-index.json")'));
 assert.ok(js.includes('type:"解説"'));
});

test("PPC guide distinguishes government sources from committee analysis",()=>{
 const html=read("guides.html");
 assert.match(html,/個人情報保護委員会/);
 assert.match(html,/https:\/\/www\.ppc\.go\.jp\/files\/pdf\/202603_school_pta_pd_point\.pdf/);
 assert.match(html,/主体を分ける/);
 assert.match(html,/事務の帰属を確かめる/);
 assert.match(html,/公法上の根拠を検証/);
 assert.match(html,/個人情報保護法61条/);
 assert.match(html,/個人情報保護法69条/);
 assert.match(html,/当委員会の分析順序/);
 assert.ok(html.includes("公文書・行政回答の読み方"));
 assert.ok(!html.includes("<iframe"));
});
