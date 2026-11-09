import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const audit=JSON.parse(read('data/ichinomiya-primary-review-20261109.json'));
const additions=JSON.parse(read('data/public-research-additions.json'));
const municipality=additions.municipalities.find(m=>m.id==='ichinomiya');

test('all Ichinomiya 42 originals are inventoried and linked to precisely 21 schools',()=>{
 assert.equal(audit.totalSchools,21);
 assert.equal(audit.totalFiles,42);
 assert.equal(audit.totalPages,370);
 assert.equal(audit.totalBytes,109632392);
 assert.equal(audit.schools.length,21);
 assert.equal(audit.fileReviews.length,42);
 assert.equal(new Set(audit.fileReviews.map(f=>f.sourceDriveFileId)).size,42);
 assert.equal(new Set(audit.schools.map(s=>s.school)).size,21);
 assert.equal(audit.fileReviews.reduce((n,f)=>n+f.pdfPages,0),370);
 assert.equal(audit.fileReviews.reduce((n,f)=>n+f.bytes,0),109632392);
 const sources=municipality.sources.filter(s=>s.kind==='primary');
 assert.equal(sources.length,42);
 for(const f of audit.fileReviews){
  assert.equal(f.visualReviewPages,f.pdfPages);
  assert.match(f.sha256,/^[0-9a-f]{64}$/);
  const source=sources.find(s=>s.url===f.sourceUrl);
  assert.ok(source,'original document must exist in searchable municipality records');
  assert.equal(f.sha256,source.sha256);
  assert.equal(f.bytes,source.sizeBytes);
  assert.notEqual(f.personalDataClearance,'問題なし');
  assert.equal(f.republishPDF,'行わない。既存のDrive原本へリンクする方式のみ。');
  for(const page of f.visiblePrivacyCautionPages)assert.ok(page>=1&&page<=f.pdfPages);
 }
 for(const s of audit.schools){
  assert.equal(s.periods.length,2);
  assert.ok(municipality.schools.some(x=>x.name===s.school));
  for(const observation of s.confirmedSourceObservations){
   assert.ok(observation.finding.length>15);
   assert.ok(observation.legalNote.length>15);
   for(const period of observation.years){
    const src=s.periods.find(d=>d.disclosureFolder===period);
    assert.ok(src);
    for(const page of observation.pages)assert.ok(page>=1&&page<=src.pdfPages);
   }
  }
 }
});

test('audit clearly labels privacy clearance and school authority as unresolved',()=>{
 assert.match(audit.privacyConclusion,/個人情報/);
 assert.match(audit.scopeLimit,/61校/);
 for(const f of audit.fileReviews)assert.equal(f.schoolPublicLawAuthorityVerified,false);
 for(const s of audit.schools){
  assert.match(s.schoolAuthorityAssessment,/権限/);
  assert.match(s.dataUseAssessment,/61条/);
  assert.match(s.dataUseAssessment,/69条/);
 }
});

test('specific flagged claims cite the corresponding original page',()=>{
 const k=audit.schools.find(s=>s.school==='木曽川西小');
 const f=audit.schools.find(s=>s.school==='富士小');
 const a=audit.schools.find(s=>s.school==='小信中島小');
 const n=audit.schools.find(s=>s.school==='中島小');
 assert.ok(k.confirmedSourceObservations.some(x=>x.years.includes('R7')&&x.pages.includes(19)&&x.finding.includes('妊婦')));
 assert.ok(f.confirmedSourceObservations.some(x=>x.pages.includes(6)&&x.finding.includes('P360＋T26')));
 assert.ok(a.confirmedSourceObservations.some(x=>x.pages.includes(3)&&x.finding.includes('2,400円')));
 assert.ok(n.confirmedSourceObservations.some(x=>x.pages.includes(10)&&x.finding.includes('事務所')));
});

test('the municipality and 21-school pages provide paths into the review',()=>{
 const page=read('ichinomiya-review.html');
 const js=read('assets/ichinomiya-review.js');
 const main=read('assets/redesign.js');
 assert.ok(page.includes('id="ich-school-list"'));
 assert.ok(page.includes('assets/ichinomiya-review.css'));
 assert.ok(js.includes('fetch("data/ichinomiya-primary-review-20261109.json")'));
 assert.ok(js.includes('encodeURIComponent(item.url)'));
 assert.ok(main.includes('ichinomiya-review.html#school-'));
 assert.ok(main.includes('学校別検証と原本の所在を見る'));
});
