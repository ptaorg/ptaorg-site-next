(function(){
"use strict";
const e=x=>String(x??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const norm=x=>String(x??"").normalize("NFKC").toLowerCase().replace(/\s+/g,"");
const safe=x=>/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/view$/.test(x||"")?x:"";
function sourceRow(s){
 const src=safe(s.sourceUrl);
 return '<div class="ich-review-source"><a href="'+e(src)+'" target="_blank" rel="noopener noreferrer">'+e(s.disclosureFolder)+'開示（'+e(s.fiscalYear)+'）原本PDF</a><span>'+e(s.pdfPages)+'ページ／会計該当：'+e(s.accountingPages)+'／'+e(s.accountingDescription)+'</span></div>';
}
function observationRow(o,s){
 const p=s.periods.find(x=>o.years.includes(x.disclosureFolder));
 const url=p?safe(p.sourceUrl):"";
 return '<div class="ich-observation"><strong>'+e(o.type)+'｜'+e(o.years.join("・"))+' PDF p'+e(o.pages.join("・"))+'</strong><p>'+e(o.finding)+'</p><p>検証事項：'+e(o.legalNote)+'</p>'+(url?'<p><a href="'+e(url)+'" target="_blank" rel="noopener noreferrer">該当原本PDFを開く ›</a></p>':"")+'</div>';
}
function schoolDetails(s,additional){
 const searchId="school-"+s.school;
 const item=additional.schools.find(v=>v.name===s.school);
 const inner= '<div class="ich-school-item-body"><h3>公開済みの一次資料</h3>'+s.periods.map(sourceRow).join("")+
 (s.confirmedSourceObservations.length?'<h3>原文から確認した事項</h3>'+s.confirmedSourceObservations.map(o=>observationRow(o,s)).join(""):'<p>今回の42件の範囲では、上記に示した決算・総会資料の所在と内容を確認しました。個別の学校徴収・名簿提供の実施は、この資料だけでは未確認です。</p>')+
 '<h3>学校側の権限と個人情報</h3><p>'+e(s.schoolAuthorityAssessment)+'</p><p>'+e(s.dataUseAssessment)+'</p>'+
 '<p class="ich-review-limits">確認上の制約：'+e(s.evidenceLimitations)+'。全原本を概観しましたが、個人情報の不存在や追加再配布の可否は未確定です。</p>'+
 (item?'<p><a href="school.html?url='+encodeURIComponent(item.url)+'">この学校の原本・文書目録 ›</a></p>':"")+
 '</div>';
 return '<details class="ich-school-item" id="'+e(searchId)+'"><summary><strong>'+e(s.school)+'</strong><span>原本 '+e(s.documentCount)+'件／'+(s.confirmedSourceObservations.length?e(s.confirmedSourceObservations.length)+'件の重点記録':"会計資料と検証事項")+'</span></summary>'+inner+'</details>';
}
async function start(){
 const target=document.querySelector("#ich-school-list");if(!target)return;
 try{
  const [r,a]=await Promise.all([fetch("data/ichinomiya-primary-review-20261109.json"),fetch("data/public-research-additions.json")]);
  if(!r.ok||!a.ok)throw Error("資料目録を読み込めませんでした");
  const [data,addition]=await Promise.all([r.json(),a.json()]);
  if(data.totalSchools!==21||data.totalFiles!==42||data.totalPages!==370||data.schools.length!==21)throw Error("検証対象の整合性が確認できません");
  const m=addition.municipalities.find(x=>x.id==="ichinomiya");if(!m)throw Error("学校索引が見つかりません");
  const list=data.schools;
  const filter=document.querySelector("#ich-school-q");
  const draw=()=>{
   const q=norm(filter.value);
   const shown=list.filter(s=>!q||norm(s.school).includes(q)||norm(s.confirmedSourceObservations.map(x=>x.finding).join(" ")).includes(q));
   target.innerHTML=shown.length?shown.map(s=>schoolDetails(s,m)).join(""):'<p>該当する学校がありません。</p>';
   let wanted="";try{wanted=decodeURIComponent(location.hash.slice(1))}catch{}
   if(wanted){const item=document.getElementById(wanted);if(item){item.open=true;}}
  };
  filter.addEventListener("input",draw);
  draw();
 }catch(err){
  target.textContent="学校別資料を読み込めませんでした。原本一覧は現行サイトの一宮市記事から確認できます。";
  console.error(err);
 }
}
document.addEventListener("DOMContentLoaded",start);
})();