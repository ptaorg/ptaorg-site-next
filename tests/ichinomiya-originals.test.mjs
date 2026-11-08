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
