import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const additions=JSON.parse(fs.readFileSync("data/public-research-additions.json","utf8"));
const ichinomiya=additions.municipalities.find(m=>m.id==="ichinomiya");
const originals=ichinomiya.sources.filter(s=>s.kind==="primary");

test("42 direct PDF links for 21 Ichinomiya schools, two source years each",()=>{
 assert.equal(originals.length,42);
 assert.equal(new Set(originals.map(s=>s.url)).size,42);
 assert.equal(new Set(originals.map(s=>s.sourceFileId)).size,42);
 assert.equal(new Set(originals.map(s=>s.school)).size,21);
 const bySchool=new Map();
 for(const s of originals){
  assert.match(s.url,/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/view$/);
  assert.equal(s.url.split("/")[5],s.sourceFileId);
  assert.ok(["R6","R7"].includes(s.disclosureYear));
  assert.ok(s.pdfPage);
  assert.ok(s.originalFileName.endsWith(".pdf"));
  assert.ok(s.verification.includes("anyone:reader"));
  assert.match(s.sha256,/^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(s.sizeBytes) && s.sizeBytes>0);
  assert.ok(Number.isSafeInteger(s.pdfPages) && s.pdfPages>0);
  assert.equal(s.hashManifestUrl,"https://ptaorg.com/data/ichinomiya-original-pdf-sha256-20261109.json");
  const years=bySchool.get(s.school)||new Set();
  years.add(s.disclosureYear);bySchool.set(s.school,years);
 }
 for(const [school,years] of bySchool)assert.deepEqual([...years].sort(),["R6","R7"],school);
});

test("new-site research data and article link to the published original catalog",()=>{
 const html=fs.readFileSync("articles/ichinomiya-pta-settlements-20261108.html","utf8");
 assert.match(html,/data-public-originals="2026-11-09"/);
 assert.match(html,/municipality\.html\?id=ichinomiya/);
 assert.match(html,/ptaorg\.com\/journal\/ichinomiya-pta-settlements-20261108\.html#original-pdfs/);
});


test("Ichinomiya PDF hashes and page/byte totals match original retrieval registry",()=>{
 assert.equal(originals.reduce((total,x)=>total+x.sizeBytes,0),109632392);
 assert.equal(originals.reduce((total,x)=>total+x.pdfPages,0),370);
 assert.equal(new Set(originals.map(x=>x.sha256)).size,42);
 assert.equal(originals.find(x=>x.school==="宮西小"&&x.disclosureYear==="R6").sha256,
  "acc70f9d9957f4bdb0f030199758fb7938e5ba51bf140d77e32dee291ec9dc16");
});

test("21 Ichinomiya school views expose exactly two public original PDF records each",()=>{
 assert.equal(ichinomiya.schools.length,21);
 assert.equal(new Set(ichinomiya.schools.map(s=>s.url)).size,21);
 for(const school of ichinomiya.schools){
  assert.match(school.url,/^ichinomiya-original-\d+$/);
  assert.equal(school.documents.length,2);
  const sources=originals.filter(o=>o.school===school.name);
  assert.equal(sources.length,2);
  assert.deepEqual(new Set(school.documents.map(d=>d.sourceId)),new Set(sources.map(s=>s.id)));
 }
 const script=fs.readFileSync("assets/redesign.js","utf8");
 assert.ok(script.includes('muni.id==="ichinomiya"'));
 assert.ok(script.includes('verifiedOriginals.length===2'));
 assert.ok(script.includes('if(muni.id!=="ichinomiya")'));
});
