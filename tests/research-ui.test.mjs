import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const box={exports:{}};new Function('module',fs.readFileSync('assets/app.js','utf8'))(box);
const {matchedRecordsFactory:search,regionsFactory,readState,stateQuery,safeReturn,keyFor,dateValue,order}=box.exports;
const read=n=>JSON.parse(fs.readFileSync('data/'+n+'.json','utf8'));
const map=read('research-map-index'),answers=read('board-responses'),updates=read('board-response-updates');
const run=(q='',extra={})=>search(map,answers,{query:q,...extra},updates);
test('published supplement contains exactly 58 substantive and 9 pending records',()=>{
 assert.equal(updates.records.length,67);assert.equal(updates.records.filter(x=>x.countAsResponse).length,58);assert.equal(updates.records.filter(x=>!x.countAsResponse).length,9);assert.equal(new Set(updates.records.map(x=>x.id)).size,67);
});
test('five screen types plus answer detail have one main, labels and noindex protection',()=>{
 for(const f of ['index','explore','municipality','school','responses','response']){const t=fs.readFileSync(f+'.html','utf8');assert.equal((t.match(/<main\b/g)||[]).length,1,f);assert.match(t,/noindex,nofollow/);assert.match(t,/aria-label="パンくず"|data-page="home"/);assert.match(t,/catalog.html/);}
});
test('municipality matching joins legacy prefecture prefixes and department/title suffixes',()=>{
 assert.equal(keyFor({municipality:'宮城県仙台市（職務専念義務・PTA会費徴収事務）',prefecture:'宮城県'}),keyFor({name:'仙台市',prefecture:'宮城県'}));
 assert.equal(keyFor({name:'大阪府教育庁',prefecture:'大阪府'}),keyFor({name:'大阪府',prefecture:'大阪府'}));
 assert.notEqual(keyFor({name:'中央区',prefecture:'東京都'}),keyFor({name:'中央区',prefecture:'千葉県'}));
});
test('new response-only municipalities are discoverable without fabricated school records',()=>{
 const r=run('福岡市');assert.ok(r.responses.length);assert.ok(r.municipalities.length);assert.equal(r.schools.length,0);const m=r.municipalities[0];assert.equal(m.responseOnly,true);assert.equal(m.schools.length,0);
});
test('specific school search does not broaden to all schools in municipality',()=>{
 assert.deepEqual(run('安行小学校').schools.map(x=>x.name),['安行小学校']);assert.equal(run('川口市').schools.length,38);assert.equal(run('安行小学校',{schoolType:'中学校'}).schools.length,0);
});
test('pending records remain filterable and excluded by substantive filter',()=>{
 assert.equal(run('',{record:'pending'}).responses.length,9);assert.equal(run('',{record:'substantive'}).responses.length,58);assert.equal(run('',{record:'legacy'}).responses.length,72);
});
test('important responses preserve separate public summary, research issues and limitations',()=>{
 for(const city of ['厚木市','川崎市','西宮市','松山市','鴨川市']){const rows=run(city).responses.filter(x=>x.recordKind!=='legacy');assert.ok(rows.length,city);for(const r of rows){assert.equal(typeof r.adminSummary,'string');assert.ok(Array.isArray(r.researchIssues));assert.ok(Array.isArray(r.limitations));assert.equal(r.body,undefined);assert.equal(r.url,undefined);}}
});
test('complete filter state survives URL roundtrip and legacy type parameter is supported',()=>{
 const s={q:'学校 会費',pref:'埼玉県',municipality:'kawaguchi',topic:'会費徴収・委任',schoolType:'小学校',record:'',type:'school',sort:'name',page:3};assert.deepEqual(readState('https://test/explore.html?'+stateQuery(s)),s);assert.equal(readState('https://test/explore.html?type=中学校&tab=school').schoolType,'中学校');assert.equal(readState('https://test/explore.html?page=-5').page,1);
});
test('return links reject external origins, protocols and unsupported local routes',()=>{
 for(const v of ['https://evil.example/','//evil.example/','javascript:alert(1)','index.html','response.html?id=1'])assert.equal(safeReturn(v),'');assert.equal(safeReturn('explore.html?q=川口市&page=2'),'explore.html?q=%E5%B7%9D%E5%8F%A3%E5%B8%82&page=2');
});
test('exact name ranking wins before substring matches and sorting is stable',()=>{
 const rows=[{value:{name:'安行小学校の資料',id:'b'}},{value:{name:'安行小学校',id:'a'}}];assert.equal(order(rows,'relevance','安行小学校')[0].value.id,'a');assert.ok(dateValue('2026年10月26日')>dateValue('2025/09/04'));
});
test('prefecture and municipality and topic filters combine rather than broaden',()=>{
 const m=regionsFactory(map,answers,updates).find(x=>x.name==='厚木市');assert.ok(m);assert.ok(run('',{municipality:m.id}).responses.length);assert.equal(run('',{municipality:m.id,prefecture:'大阪府'}).responses.length,0);const r=run('',{prefecture:'神奈川県',topic:'会費徴収・委任'}).responses;assert.ok(r.length);assert.ok(r.every(x=>x.prefecture==='神奈川県'&&x.topics.includes('会費徴収・委任')));
});
test('static catalog exposes existing canonical school and answer URLs without javascript',()=>{
 const text=fs.readFileSync('catalog.html','utf8');for(const m of map.municipalities)for(const s of m.schools||[])assert.ok(text.includes('https://ptaorg.com'+s.url),s.name);for(const r of answers.responses)assert.ok(text.includes(r.url),r.municipality);assert.ok(text.includes('厚木市'));assert.ok(text.includes('行政回答の公開要約'));
});
test('public supplement contains no unpublished payload fields or personal contact patterns',()=>{
 const allowed=new Set(['id','municipality','prefecture','date','department','questionSummary','adminSummary','status','verification','receivedDate','citedLaws','topics','researchIssues','limitations','source','countAsResponse']);for(const r of updates.records)for(const k of Object.keys(r))assert.ok(allowed.has(k),k);const t=JSON.stringify(updates.records);assert.doesNotMatch(t,/[\w.+-]+@[\w.-]+\.[A-Za-z]+/);assert.doesNotMatch(t,/0\d{1,3}-\d{2,4}-\d{3,4}/);
});
test('preview and CI do not add production publication configuration',()=>{
 assert.equal(fs.existsSync('CNAME'),false);assert.equal(fs.existsSync('.github/workflows/deploy.yml'),false);assert.doesNotMatch(fs.readFileSync('.github/workflows/verify.yml','utf8'),/deploy-pages|configure-pages|pages: write/);
});
test('synchronized datasets are byte-identical to published source blobs',async()=>{
 const {createHash}=await import('node:crypto');for(const [file,sha]of [['research-map-index','e3c9f0b3c1ac9f5f8dc0bf6c347377abd70a90a1'],['board-responses','d0052af0815b91839d8a6048157f7525d034c964'],['board-response-updates','46fb4049980cc7c5726c74bccaaaea0d9b519e44']]){const b=fs.readFileSync('data/'+file+'.json');assert.equal(createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex'),sha);}
});
test('core design token foreground/background pairs meet AA text contrast',()=>{
 const lum=hex=>{const rgb=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};for(const [fg,bg]of [['203244','ffffff'],['526675','ffffff'],['0a5751','ffffff'],['0a5751','e6f1ee'],['7c3c1c','f8eee5'],['54358b','eeebf6'],['67533a','fff2dd'],['d1dee3','142437']]){const a=lum(fg),b=lum(bg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,fg+' on '+bg);}
});
