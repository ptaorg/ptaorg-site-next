(function(){
"use strict";
const el=id=>document.getElementById(id);
const esc=value=>String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const norm=value=>String(value??"").normalize("NFKC").replace(/学校$/,"").replace(/\s/g,"");
const labels=["主体の分離","事務の帰属","学校側の公法上の根拠","個人情報保護法61条","個人情報保護法69条","教職員の服務・会計"];
function entryItem(item,region){
 const source=(region==="kakamigahara"?(item.documents||[]):(item.disclosureFindings||[]));
 const loc=item.locator||"該当箇所の詳細未登録";
 const status=item.originalChecked?"PR #118の原文確認記録":"原文確認状態未登録";
 return '<article class="school-evidence-finding"><h4>'+esc(item.title||"調査記録")+'</h4><p class="school-evidence-locator">'+esc(loc)+'　／　'+esc(status)+'</p><p>'+esc(item.summary||"概要未登録")+'</p>'+(item.unknown?'<p class="school-evidence-unknown"><strong>未確認：</strong>'+esc(item.unknown)+'</p>':"")+'</article>';
}
function render(item,region){
 const panel=el("school-evidence-content"),status=el("school-evidence-status");
 const findings=region==="kakamigahara"?(item.documents||[]):(item.disclosureFindings||[]);
 const analyses=item.analysis||[],evaluation=item.evaluation||null;
 status.textContent="PR #118で作成された学校別開示資料の確認記録です。原資料の所在・掲載頁と実際の運用を区別し、未確認の学校側権限を適法と断定しません。";
 let html='<div class="school-evidence-provenance">原資料の個別URLが公開確認されていない記録は、開示PDFへのリンクを作っていません。原文の引継ぎ確認記録と、新サイト側で直接照合した原本は別管理です。</div>';
 if(findings.length){
  html+='<h3>開示原文の該当箇所（'+findings.length+'件）</h3>'+findings.map(x=>entryItem(x,region)).join("");
 }else{
  html+='<p class="school-evidence-unknown">この学校は資料目録に登録済みですが、原文の個別確認記録はまだ収録されていません。学校固有の適法・違法の判断は保留します。</p>';
 }
 if(analyses.length){
  html+='<h3>学校側の法的検討</h3><ol class="school-evidence-analysis">'+analyses.map((x,i)=>'<li><strong>'+esc(labels[i]||"追加論点")+'</strong><p>'+esc(x)+'</p></li>').join("")+'</ol>';
 }else{
  html+='<p class="school-evidence-unknown">この学校の法的評価は未完成です。入退会・会費・役員選出等がどの主体の事務か確認し、学校の法令上の権限を検証した後に個人情報の適法性を検討します。</p>';
 }
 if(evaluation&&Object.values(evaluation).some(x=>typeof x==="string"&&x)){
  html+='<div class="school-evidence-evaluation"><h3>確認済み事項と追加照会</h3>';
  if(evaluation.facts)html+='<p><strong>資料の記載：</strong>'+esc(evaluation.facts)+'</p>';
  if(evaluation.unknowns)html+='<p><strong>未確認：</strong>'+esc(evaluation.unknowns)+'</p>';
  if(evaluation.followUp)html+='<p><strong>追加確認：</strong>'+esc(evaluation.followUp)+'</p>';
  html+='</div>';
 }
 html+='<p class="school-evidence-provenance">資料の記載があること、学校が実際に処理したこと、学校の公務としての権限があることは別の判断です。団体から校長への委任や保護者の同意だけで公法上の権限は生じません。</p>';
 panel.innerHTML=html;
}
async function init(){
 const root=el("school-evidence");if(!root)return;
 const route=new URLSearchParams(location.search).get("url")||"";
 const status=el("school-evidence-status");
 try{
  const [c,r]=await Promise.all([fetch("data/pr118-school-evidence.json"),fetch("data/public-research-additions.json")]);
  if(!c.ok||!r.ok)throw Error("School evidence data unavailable");
  const [data,addition]=await Promise.all([c.json(),r.json()]);
  for(const region of ["ichinomiya","kakamigahara"]){
   const municipality=addition.municipalities.find(m=>m.id===region);
   const school=municipality?.schools?.find(x=>x.url===route);
   if(!school)continue;
   const record=data.cohorts[region]?.find(s=>norm(s.name)===norm(school.name));
   if(!record){status.textContent="学校別記録を照合できませんでした";return;}
   render(record,region);return;
  }
  root.hidden=true;
 }catch(e){status.textContent="学校別の追加調査記録を読み込めませんでした。原本の直接リンクは資料一覧から確認してください。";console.error(e);}
}
document.addEventListener("DOMContentLoaded",init);
})();