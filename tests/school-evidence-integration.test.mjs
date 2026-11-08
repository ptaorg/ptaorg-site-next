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
 assert.equal(data.cohorts.ichinomiya.reduce((n,s)=>n+(s.disclosureFindings||[]).length,0),218);
 assert.equal(data.cohorts.ichinomiya.filter(s=>Array.isArray(s.analysis)&&s.analysis.length>0).length,59);
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

test("7 public-school documents support explicitly provisional six-stage analyses",()=>{
 const supported=["大和東小学校","中島小学校","葉栗北小学校","三条小学校","小信中島小学校","朝日西小学校","尾西第一中学校"];
 const records=data.cohorts.ichinomiya.filter(s=>supported.includes(s.name));
 assert.equal(records.length,7);
 for(const record of records){
  assert.equal(record.analysis.length,6,record.name);
  assert.ok(record.documents.some(doc=>doc.verified===true&&doc.url?.startsWith("https://ichinomiya.schoolweb.ne.jp/")),record.name);
  assert.match(record.analysisBasis,/独立再照合.*意味しない/,record.name);
  assert.ok(record.evaluation.facts&&record.evaluation.unknowns&&record.evaluation.followUp,record.name);
  assert.match(record.analysis[2],/権限|所掌|根拠/,record.name);
  assert.match(record.analysis[3],/61条/,record.name);
  assert.match(record.analysis[4],/69条/,record.name);
 }
 assert.equal(data.cohorts.ichinomiya.filter(s=>!(s.analysis||[]).length).length,2);
 const yamato=records.find(s=>s.name==="大和東小学校");
 assert.equal(yamato.documents[0].year,2025);
 const js=read("assets/school-evidence.js");
 assert.ok(js.includes("学校公表資料（開示原本とは別）"));
 assert.ok(js.includes("本文の具体的な記載は未確認"));
 assert.ok(js.includes("schoolPublicUrl"));
 assert.ok(js.includes("旧PRの本文表示確認記録"));
});

test("three original-PDF page reviews are explicitly limited and provenance-checked",()=>{
 const names=["尾西第三中学校","千秋東小学校","北方小学校"];
 for(const name of names){
  const record=data.cohorts.ichinomiya.find(s=>s.name===name);
  assert.equal(record.analysis.length,6,name);
  assert.match(record.analysisBasis,/指定ページを画像で直接読解/,name);
  assert.match(record.evaluation.unknowns,/実施|実行|名簿|所掌|公務/,name);
  for(const finding of record.disclosureFindings){
   assert.equal(finding.originalChecked,true,name);
   assert.match(finding.sourceSha256,/^[0-9a-f]{64}$/,name);
   assert.match(finding.sourceStatus,/該当頁を今回画像で直接確認/,name);
   assert.equal(finding.sourceUrl,undefined,"no unverified Drive disclosure URLs");
  }
 }
 assert.match(data.cohorts.ichinomiya.find(s=>s.name==="尾西第三中学校").disclosureFindings[0].summary,/将来形.*提供.*完了記録ではない/);
});

test("three further school originals keep agreements and rules distinct from performed acts",()=>{
 const names=["丹陽中学校","西成東小学校","浅井北小学校"];
 for(const name of names){
  const s=data.cohorts.ichinomiya.find(x=>x.name===name);
  assert.equal(s.analysis.length,6,name);
  assert.match(s.analysisBasis,/画像で直接読解/,name);
  assert.match(s.evaluation.unknowns,/利用|授権|実施|採択|免除/,name);
  assert.equal(s.disclosureFindings.length,1);
  assert.equal(s.disclosureFindings[0].originalChecked,true);
  assert.match(s.disclosureFindings[0].sourceSha256,/^[0-9a-f]{64}$/);
  assert.equal(s.disclosureFindings[0].sourceUrl,undefined,"private Drive URL must not be advertised");
 }
 assert.match(data.cohorts.ichinomiya.find(s=>s.name==="西成東小学校").disclosureFindings[0].summary,/規約案.*採択/);
 assert.match(data.cohorts.ichinomiya.find(s=>s.name==="丹陽中学校").disclosureFindings[0].summary,/要保護家庭は免除/);
});

test("originally unanalysed three schools have source-limited direct PDF reviews",()=>{
 const names=["葉栗小学校","西成東部中学校","大和西小学校"];
 for(const name of names){
  const s=data.cohorts.ichinomiya.find(x=>x.name===name);
  assert.ok(s,name);
  assert.equal(s.analysis.length,6,name);
  assert.equal(s.disclosureFindings.length,1,name);
  assert.match(s.analysisBasis,/指定ページを画像で直接読解/,name);
  assert.match(s.disclosureFindings[0].sourceSha256,/^[a-f0-9]{64}$/);
  assert.equal(s.disclosureFindings[0].originalChecked,true);
  assert.equal(s.disclosureFindings[0].sourceUrl,undefined);
  assert.ok(s.evaluation.facts && s.evaluation.unknowns && s.evaluation.followUp);
 }
 assert.match(data.cohorts.ichinomiya.find(s=>s.name==="葉栗小学校").disclosureFindings[0].summary,/投票不可/);
 assert.match(data.cohorts.ichinomiya.find(s=>s.name==="大和西小学校").disclosureFindings[0].summary,/教頭へ報告/);
});

test("nine additional school original rules retain fact/authority/privacy separation",()=>{
 const names=["神山小学校","向山小学校","浅野小学校","丹陽小学校","浅井南小学校","今伊勢西小学校","朝日東小学校","黒田小学校","大和南中学校"];
 assert.equal(names.length,9);
 for(const name of names){
  const s=data.cohorts.ichinomiya.find(z=>z.name===name);
  assert.ok(s,name);
  assert.equal(s.analysis.length,6,name);
  assert.equal(s.disclosureFindings.length,1,name);
  assert.equal(s.disclosureFindings[0].originalChecked,true,name);
  assert.match(s.disclosureFindings[0].sourceSha256,/^[0-9a-f]{64}$/,name);
  assert.match(s.analysisBasis,/指定ページを画像で直接照合/,name);
  assert.match(s.analysis[2],/権限|所掌事務/,name);
  assert.match(s.analysis[3],/61条/,name);
  assert.match(s.analysis[4],/69条/,name);
  assert.equal(s.disclosureFindings[0].sourceUrl,undefined,"unapproved original links must not be published");
 }
 assert.match(data.cohorts.ichinomiya.find(z=>z.name==="丹陽小学校").disclosureFindings[0].title,/（案）/);
 assert.match(data.cohorts.ichinomiya.find(z=>z.name==="今伊勢西小学校").disclosureFindings[0].summary,/学校からの情報取得元.*明記されていない/);
});

test("the remaining two schools show public reports without claiming disclosure originals or legal completion",()=>{
 const names=["瀬部小学校","赤見小学校"];
 for(const name of names){
  const s=data.cohorts.ichinomiya.find(z=>z.name===name);
  assert.ok(s,name);
  assert.ok(!s.analysis?.length,name);
  assert.ok(!s.disclosureFindings?.length,name);
  assert.equal(s.documents.length,1,name);
  assert.equal(s.documents[0].verified,true);
  assert.match(s.documents[0].url,/^https:\/\/ichinomiya\.schoolweb\.ne\.jp\//);
  assert.match(s.documents[0].sourceStatus,/開示PDFの確認ではない/);
  assert.match(s.evidenceStatus,/法的評価保留/);
  assert.match(s.analysisBasis,/開示原本は未発見/);
 }
 const js=read("assets/school-evidence.js");
 assert.ok(js.includes("item.sourceStatus"));
 assert.ok(js.includes("weblog(?:\\/\\d+)?"));
});
