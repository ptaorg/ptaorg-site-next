import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
const updates=JSON.parse(read("data/pr118-board-updates.json"));
const baseline=JSON.parse(read("data/board-responses.json"));
test("administrative update overlay distinguishes substantive responses from follow-ups",()=>{
 assert.equal(baseline.responses.length,72);
 assert.equal(updates.records.length,69);
 assert.equal(updates.confirmedAdditional,59);
 assert.equal(updates.otherUpdates,10);
 assert.equal(updates.records.filter(r=>r.countAsResponse).length,59);
 assert.equal(updates.records.filter(r=>!r.countAsResponse).length,10);
 assert.equal(new Set(updates.records.map(r=>r.id)).size,69);
 assert.match(updates.sourceBlobSha,/^[a-f0-9]{40}$/);
 for(const x of updates.records){
  assert.ok(x.municipality&&x.prefecture&&x.id&&x.status);
  assert.ok(x.adminSummary?.length>15);
  assert.ok(Array.isArray(x.limitations));
  assert.ok(!("email" in x||"attachment" in x||"messageId" in x));
 }
});
test("the new page discloses provenance, status and comparison limitations",()=>{
 const html=read("board-updates.html");
 const js=read("assets/board-updates.js");
 const core=read("assets/redesign.js");
 const home=read("index.html");
 const explore=read("explore.html");
 assert.ok(html.includes("59件"));
 assert.ok(html.includes("10件"));
 assert.ok(html.includes("72件"));
 assert.ok(html.includes("既存72件との重複可能性"));
 assert.ok(js.includes('fetch("data/pr118-board-updates.json")'));
 assert.ok(core.includes('fetch("data/pr118-board-updates.json")'));
 assert.ok(core.includes('type:"行政回答追補"'));
 assert.ok(core.includes("board-updates.html?municipality="));
 assert.ok(home.includes('href="board-updates.html"'));
 assert.ok(explore.includes('value="行政回答追補"'));
});
test("administration update status is never silently counted as already public baseline",()=>{
 const js=read("assets/redesign.js");
 assert.ok(js.includes('research.boards.responses.length.toLocaleString("ja-JP")'));
 assert.ok(updates.records.find(x=>x.id==="update-20261106"&&x.countAsResponse===false));
 assert.ok(updates.records.find(x=>x.id==="update-20261102"&&x.countAsResponse===true));
});
