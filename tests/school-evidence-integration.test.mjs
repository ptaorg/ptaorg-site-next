import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const additions=JSON.parse(read("data/public-research-additions.json")).municipalities;
const map=JSON.parse(read("data/research-map-index.json")).municipalities;
const data=JSON.parse(read("data/pr118-school-evidence.json"));
const normalize=name=>name.replace(/学校$/,"");
const ich=additions.find(m=>m.id==="ichinomiya"),kak=additions.find(m=>m.id==="kakamigahara");

test("61 Ichinomiya and 26 Kakamigahara school records are integrated exactly once",()=>{
 assert.equal(additions.length,2);
 assert.equal(ich.schools.length,61);
 assert.equal(kak.schools.length,26);
 assert.equal(data.cohorts.ichinomiya.length,61);
 assert.equal(data.cohorts.kakamigahara.length,26);
 assert.equal(map.length+additions.length,31);
 assert.equal(map.flatMap(m=>m.schools||[]).length+ich.schools.length+kak.schools.length,656);
 for(const [municipality,cohort] of [[ich,data.cohorts.ichinomiya],[kak,data.cohorts.kakamigahara]]){
  assert.equal(new Set(municipality.schools.map(s=>s.url)).size,municipality.schools.length);
  assert.equal(new Set(municipality.schools.map(s=>normalize(s.name))).size,municipality.schools.length);
  for(const row of cohort) assert.equal(municipality.schools.filter(s=>normalize(s.name)===normalize(row.name)).length,1,row.name);
 }
 assert.equal(data.cohorts.ichinomiya.reduce((n,s)=>n+(s.disclosureFindings||[]).length,0),191);
 assert.equal(data.cohorts.ichinomiya.filter(s=>Array.isArray(s.analysis)&&s.analysis.length>0).length,26);
 assert.equal(data.cohorts.kakamigahara.filter(s=>Array.isArray(s.analysis)&&s.analysis.length>0).length,26);
});

test("the 42 reviewed PDFs remain linked only to the original 21 schools",()=>{
 const originals=ich.sources.filter(s=>s.kind==="primary"&&s.school);
 assert.equal(originals.length,42);
 const names=new Set(originals.map(s=>s.school));
 assert.equal(names.size,21);
 const known=ich.schools.filter(s=>/^ichinomiya-original-\d+$/.test(s.url));
 assert.equal(known.length,21);
 for(const item of known){
  assert.equal(originals.filter(s=>s.school===item.name).length,2);
  assert.equal(item.documents.length,2);
  assert.ok(item.documents.every(d=>d.status==="公開済み原本"));
 }
 for(const item of ich.schools.filter(s=>!known.includes(s))){
  assert.equal(item.documents.some(d=>d.status==="公開済み原本"),false);
  assert.equal(item.documents.some(d=>d.sourceId),false);
 }
 for(const item of kak.schools){
  assert.equal(item.documents.some(d=>d.status==="公開済み原本"),false);
  assert.equal(item.documents.some(d=>Boolean(d.url)),false);
 }
});

test("school pages visibly separate copied source statements, analysis and unknowns",()=>{
 const page=read("school.html");
 const js=read("assets/school-evidence.js");
 assert.ok(page.includes('id="school-evidence-content"'));
 assert.ok(page.includes('assets/school-evidence.js'));
 assert.ok(js.includes('fetch("data/pr118-school-evidence.json")'));
 assert.ok(js.includes("PR #118の原文確認記録"));
 assert.ok(js.includes("原文の引継ぎ確認記録"));
 assert.ok(js.includes("学校側の法的検討"));
 assert.ok(js.includes("法令上の権限"));
 assert.ok(!js.includes("window.open("));
});
