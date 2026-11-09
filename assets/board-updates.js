(function(){
"use strict";
const e=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const norm=s=>String(s??"").normalize("NFKC").toLowerCase().replace(/\s+/g,"");
function result(r){
 const badge=r.countAsResponse?"追加実質回答":"回答辞退・確認中等";
 return '<article class="board-update-item" id="'+e(r.id)+'"><div class="board-update-heading"><span class="board-update-kind">'+e(badge)+'</span><span class="board-update-date">'+e(r.date||"日付確認中")+'</span><h2>'+e(r.municipality)+' <small>'+e(r.prefecture||"")+'</small></h2></div><p class="board-update-meta">'+e(r.department||"担当部署未登録")+' ／ '+e(r.status)+'</p>'+
 '<p><strong>照会内容：</strong>'+e(r.questionSummary)+'</p>'+
 '<p><strong>行政側の説明：</strong>'+e(r.adminSummary)+'</p>'+
 ((r.researchIssues||[]).length?'<p><strong>法的確認事項：</strong>'+e(r.researchIssues.join(" "))+'</p>':"")+
 ((r.limitations||[]).length?'<p class="board-update-limit"><strong>確認できない事項：</strong>'+e(r.limitations.join(" "))+'</p>':"")+
 '<p class="board-update-source">出典区分：教育委員会からの受領回答について当委員会が作成した要約。原メール・非公開添付は掲載しません。原文の掲載URLが確認できないものについては、原本リンクを作っていません。</p></article>';
}
async function start(){
 const target=document.getElementById("board-update-list");if(!target)return;
 const input=document.getElementById("board-update-q"),status=document.getElementById("board-update-status");
 const count=document.getElementById("board-update-count");
 try{
  const response=await fetch("data/pr118-board-updates.json");if(!response.ok)throw Error("追補一覧を取得できません");
  const data=await response.json();if(data.records.length!==69||data.confirmedAdditional!==59||data.otherUpdates!==10)throw Error("追補件数の整合性がありません");
  const muni=new URLSearchParams(location.search).get("municipality");
  if(muni)input.value=muni;
  const draw=()=>{
   const q=norm(input.value),sel=status.value;
   const rows=data.records.filter(r=>(sel==="all"||(sel==="response"&&r.countAsResponse)||(sel==="other"&&!r.countAsResponse))&&(!q||norm([r.municipality,r.prefecture,r.department,r.questionSummary,r.adminSummary,(r.topics||[]).join(" "),r.status].join(" ")).includes(q)));
   count.textContent="該当："+rows.length+"件（追加実質回答 "+rows.filter(r=>r.countAsResponse).length+"件／その他 "+rows.filter(r=>!r.countAsResponse).length+"件）";
   target.innerHTML=rows.length?rows.map(result).join(""):'<p>該当する追加記録はありません。</p>';
   const id=location.hash.slice(1);if(id){const elm=document.getElementById(id);if(elm)elm.scrollIntoView({block:"start"});}
  };
  input.addEventListener("input",draw);status.addEventListener("change",draw);draw();
 }catch(err){count.textContent="追補記録を読み込めませんでした。";console.error(err);}
}
document.addEventListener("DOMContentLoaded",start);
})();