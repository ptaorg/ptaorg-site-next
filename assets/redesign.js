(function app(){
"use strict";
const prefectures=["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"];
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const esc=s=>String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const norm=s=>String(s??"").normalize("NFKC").toLocaleLowerCase("ja").trim().replace(/\s+/g," ");
const safeUrl=(x,onlySite=false)=>{
 try{
   const u=new URL(x,"https://ptaorg.com");
   if(u.protocol!=="https:")return "";
   if(onlySite&&u.origin!=="https://ptaorg.com")return "";
   return u.href;
 }catch{return ""}
};
let research=null;
async function load(){
 const [mr,br]=await Promise.all([fetch("data/research-map-index.json"),fetch("data/board-responses.json")]);
 if(!mr.ok||!br.ok)throw Error("Published index HTTP error");
 const [map,boards]=await Promise.all([mr.json(),br.json()]);
 if(!Array.isArray(map.municipalities)||!Array.isArray(boards.responses))throw Error("Published index structure invalid");
 const records=[],articleSeen=new Set(),sourceSeen=new Set();
 for(const m of map.municipalities){
  const themes=Array.isArray(m.themes)?m.themes:[];
  records.push({title:m.name,type:"自治体調査",pref:m.prefecture||"",description:(m.summary||[])[0]||"",themes,href:"municipality.html?id="+encodeURIComponent(m.id)});
  for(const s of m.schools||[]){
   const docs=s.documents||[],uncleared=docs.some(d=>d.status==="公開前確認中");
   records.push({title:m.name+"・"+s.name,type:"学校資料",pref:m.prefecture||"",description:(s.type||"学校")+"／登録文書"+docs.length+"件"+(uncleared?"／公開前確認中の文書を含む":""),themes,href:"school.html?url="+encodeURIComponent(s.url),school:s.name});
  }
  for(const a of m.articles||[]){
   const url=safeUrl(a.url,true);
   if(!url||articleSeen.has(url))continue;
   articleSeen.add(url);
   records.push({title:a.title||"論考",type:"論考",pref:m.prefecture||"",description:m.name+"の関連論考",themes,href:url});
  }
  for(const source of m.sources||[]){
    if(source.kind!=="primary")continue;
    const url=safeUrl(source.url);
    if(!url||sourceSeen.has(url))continue;
    sourceSeen.add(url);
    records.push({title:source.title||"原資料",type:"原資料",pref:m.prefecture||"",description:[source.publisher,source.date].filter(Boolean).join("／"),themes,href:url});
  }
 }
 for(const r of boards.responses){
   const href=safeUrl(r.url,true);
   if(!href)continue;
   records.push({title:r.municipality+" 教育委員会回答",type:"行政回答",pref:r.prefecture||"",description:[r.date,(r.topics||[]).slice(0,3).join("・")].filter(Boolean).join("／"),themes:r.topics||[],href});
 }
 research={map,boards,records};
 return research;
}
function updateSelects(){
 const present=new Set([...research.map.municipalities.map(m=>m.prefecture),...research.boards.responses.map(x=>x.prefecture)].filter(Boolean));
 for(const select of $$('select[name="region"]')){
  const old=select.value,first=select.options[0].textContent;
  select.replaceChildren(new Option(first,""));
  for(const name of prefectures)select.add(new Option(name,name));
  if(old&&prefectures.includes(old))select.value=old;
  else if(new URLSearchParams(location.search).has("region")){
   const p=new URLSearchParams(location.search).get("region");
   if(prefectures.includes(p))select.value=p;
  }
 }
 const qs=new URLSearchParams(location.search);
 for(const [name,val] of qs){
  if(!["q","category","region","theme"].includes(name))continue;
  for(const field of $$('[name="'+name+'"]'))if([...field.options||[]].length===0||[...field.options].some(o=>o.value===val))field.value=val;
 }
}
function initNav(){
 const t=$(".menu-toggle"),n=$(".site-nav");
 if(t&&n)t.addEventListener("click",()=>{const state=n.classList.toggle("is-open");t.setAttribute("aria-expanded",String(state))});
}
function mapLink(pref){return "explore.html?region="+encodeURIComponent(pref)}
async function initMap(){
 const box=$("#map-frame"),target=$("#prefecture-links");
 if(!box||!target)return;
 const counts={};
 for(const m of research.map.municipalities){const p=m.prefecture||"";counts[p]??={regions:0,schools:0};counts[p].regions++;counts[p].schools+=(m.schools||[]).length}
 for(const name of prefectures){
  const a=document.createElement("a");a.href=mapLink(name);a.textContent=name;
  if((counts[name]?.regions||0)>0)a.classList.add("has-records");
  target.append(a);
 }
 try{
  const r=await fetch("assets/japan-prefectures.svg");
  if(!r.ok)throw Error("SVG unavailable");
  const raw=await r.text();
  const doc=new DOMParser().parseFromString(raw,"image/svg+xml");
  const svg=doc.querySelector("svg");
  if(!svg||doc.querySelector("parsererror"))throw Error("SVG malformed");
  // Controlled, pinned source is a static CC0 asset. Never accept document-provided scripts.
  for(const node of $$("script,foreignObject",svg))node.remove();
  for(const path of $$("[data-code]",svg)){
    const pref=prefectures[Number(path.getAttribute("data-code"))-1];
    if(!pref)continue;
    const count=counts[pref]?.regions||0;
    path.setAttribute("tabindex","0");
    path.setAttribute("role","link");
    path.setAttribute("aria-label",pref+(count?"、公開索引"+count+"地域":""));
    if(count)path.classList.add("has-records");
    const navigate=()=>{location.href=mapLink(pref)};
    path.addEventListener("click",navigate);
    path.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();navigate()}});
    path.querySelector("title")?.remove();
    const tt=doc.createElementNS("http://www.w3.org/2000/svg","title");tt.textContent=pref;
    path.prepend(tt);
  }
  svg.setAttribute("aria-label","全国47都道府県の地図");
  box.replaceChildren(document.importNode(svg,true));
  // Importing an SVG clone also copies event attributes but not listeners; bind again after insertion.
  for(const path of $$("[data-code]",box)){
    const pref=prefectures[Number(path.getAttribute("data-code"))-1];if(!pref)continue;
    path.addEventListener("click",()=>{location.href=mapLink(pref)});
    path.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();location.href=mapLink(pref)}});
  }
  const state=$("#map-status");if(state)state.textContent="／47都道府県を選択";
 }catch(err){
  box.innerHTML='<p class="small-muted">地図の表示に失敗しました。右側の都道府県一覧から選択できます。</p>';
  console.warn("Japan map load failed",err);
 }
}
function initHome(){
 if(!$("#count-regions"))return;
 $("#count-regions").textContent=research.map.municipalities.length.toLocaleString("ja-JP");
 $("#count-schools").textContent=research.map.municipalities.reduce((n,m)=>n+(m.schools||[]).length,0).toLocaleString("ja-JP");
 $("#count-responses").textContent=research.boards.responses.length.toLocaleString("ja-JP");
 const prioritized=["yokohama","atsugi","kawaguchi","matsuyama","osaka","archive-imizu"];
 const sorted=[...research.map.municipalities].sort((a,b)=>prioritized.indexOf(a.id)===-1?1:prioritized.indexOf(b.id)===-1?-1:prioritized.indexOf(a.id)-prioritized.indexOf(b.id));
 $("#home-regions").innerHTML=sorted.slice(0,8).map(m=>'<a class="row-link" href="municipality.html?id='+encodeURIComponent(m.id)+'"><strong>'+esc(m.name)+'</strong><span>'+esc((m.themes||[]).slice(0,2).join("・")||"自治体資料")+'</span><b>›</b></a>').join("");
 initMap();
}
function relatedResponses(m){
 return research.boards.responses.filter(r=>{
  if(r.prefecture!==m.prefecture)return false;
  const name=norm(r.municipality),target=norm(m.name);
  return name===target||name.endsWith(target)||target===norm(m.prefecture)&&name===target;
 });
}
function docRow(label,description,url,status){
 const href=safeUrl(url);
 return '<div class="document-row"><span class="doc-icon" aria-hidden="true">▤</span><div><strong>'+esc(label)+'</strong><p>'+esc(description||"")+'</p></div>'+(href?'<a class="doc-action" href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">資料を開く ›</a>':(status?'<span class="small-muted">'+esc(status)+'</span>':""))+'</div>';
}
function initMunicipality(){
 const name=$("#muni-name");if(!name)return;
 const id=new URLSearchParams(location.search).get("id")||"";
 const m=research.map.municipalities.find(x=>x.id===id);
 if(!m){name.textContent="該当する自治体がありません";return}
 document.title=m.name+"｜PTA適正化推進委員会";
 const related=relatedResponses(m);
 const sources=(m.sources||[]).filter(x=>x.url&&safeUrl(x.url));
 const schools=m.schools||[];
 const els={
  "#muni-crumb":m.name,"#muni-name":m.name,"#muni-intro":"",
  "#muni-summary":(m.summary||[]).join("\n")||m.name+"の調査記録",
  "#muni-pref":m.prefecture,"#muni-info-name":m.name,"#muni-info-schools":schools.length+"校"
 };
 for(const [sel,val] of Object.entries(els)){$(sel).textContent=val}
 const metrics=[
  ["公開回答登録",related.length+"件"],
  ["学校索引",schools.length?schools.length+"校":"—"],
  ["公開資料リンク",sources.length+"件"]
 ];
 $("#municipal-metrics").innerHTML=metrics.map(x=>'<div class="metric"><strong>'+esc(x[1])+'</strong><span>'+esc(x[0])+'</span></div>').join("");
 const sr=related.map(r=>docRow(r.municipality+" 教育委員会回答",[r.date,(r.topics||[]).slice(0,2).join("・")].filter(Boolean).join("／"),r.url));
 const sourceRows=sources.map(s=>docRow(s.title,[s.publisher,s.date].filter(Boolean).join("／"),s.url));
 $("#municipal-sources").innerHTML=(sr.join("")+sourceRows.join(""))||'<p class="small-muted">公開索引に行政回答・原資料のリンクは登録されていません。</p>';
 $("#municipal-schools").innerHTML=schools.length?'<div class="school-summary"><h3>登録校 '+schools.length+'校</h3>'+schools.map(s=>'<a href="school.html?url='+encodeURIComponent(s.url)+'">'+esc(s.name)+' <small>登録文書'+(s.documents||[]).length+'件</small> ›</a>').join("")+'</div>':'<p class="small-muted">学校別の登録資料はありません。</p>';
 const legal=(m.legal||[]).map(l=>'<div class="legal-card"><h3>'+esc(l.title)+'</h3><p>'+esc(l.text)+'</p></div>').join("");
 const articles=(m.articles||[]).filter(a=>safeUrl(a.url)).map(a=>docRow(a.title,"公開済み論考",a.url)).join("");
 $("#municipal-legal").innerHTML=legal+articles||'<p class="small-muted">関連する法的分析の索引は未登録です。</p>';
 $("#muni-themes").innerHTML=(m.themes||[]).slice(0,12).map(s=>'<a href="explore.html?theme='+encodeURIComponent(s)+'">'+esc(s)+' <span>›</span></a>').join("");
 $("#muni-source-link").href=safeUrl(m.url)||"explore.html?region="+encodeURIComponent(m.prefecture);
}
function initSchool(){
 const el=$("#school-name");if(!el)return;
 const url=new URLSearchParams(location.search).get("url")||"";
 let entry=null,muni=null;
 for(const m of research.map.municipalities){
  const found=(m.schools||[]).find(s=>s.url===url);
  if(found){entry=found;muni=m;break}
 }
 if(!entry){el.textContent="学校の索引が見つかりません";return}
 el.textContent=entry.name;
 $("#school-crumb").textContent=entry.name;
 $("#school-subtitle").textContent=muni.prefecture+" "+muni.name;
 $("#school-region").innerHTML='<a href="municipality.html?id='+encodeURIComponent(muni.id)+'">'+esc(muni.name)+' ›</a>';
 const docs=entry.documents||[];
 $("#school-documents").innerHTML=docs.map(d=>docRow(d.title,"文書目録／"+(d.status||"公開状態未確認"),"",d.status||"未確認")).join("")||'<p class="small-muted">登録文書はありません。</p>';
 const orig=safeUrl(entry.url,true);
 if(orig)$("#school-documents").insertAdjacentHTML("beforeend",'<p><a href="'+esc(orig)+'" target="_blank" rel="noopener noreferrer">現行サイトの学校別資料ページ ›</a></p>');
}
function filtered(params){
 const terms=norm(params.q||"").split(" ").filter(Boolean);
 return research.records.filter(r=>{
  if(params.category&&params.category!==r.type)return false;
  if(params.region&&params.region!==r.pref)return false;
  const text=norm([r.title,r.type,r.pref,r.description,...(r.themes||[])].join(" "));
  if(params.theme&&!text.includes(norm(params.theme)))return false;
  return terms.every(t=>text.includes(t));
 });
}
function initExplore(){
 const list=$("#result-list");if(!list)return;
 const side=$("#result-filters"),top=$(".search-form"),tabs=$$("#result-tabs button"),more=$("#load-more");
 const searchParams=new URLSearchParams(location.search);
 for(const name of ["q","category","region","theme"]){
  const v=searchParams.get(name)||"";
  for(const f of [side,top]){const input=f.elements.namedItem(name);if(input)input.value=v}
 }
 let tab=searchParams.get("category")||"",offset=0;
 function draw(restart=true){
   if(restart)offset=0;
   const params=Object.fromEntries(new FormData(side));
   if(tab)params.category=tab;
   const matches=filtered(params),current=matches.slice(0,offset+25);
   $("#result-count").textContent=matches.length.toLocaleString("ja-JP")+"件";
   list.innerHTML=current.length?current.map(r=>'<article class="result-entry"><div><span class="eyetag">'+esc(r.type)+'</span><h2><a href="'+esc(r.href)+'">'+esc(r.title)+'</a></h2><p>'+esc(r.pref)+(r.description?"／"+esc(r.description):"")+'</p></div><a class="doc-action" href="'+esc(r.href)+'">詳細 ›</a></article>').join(""):'<div class="empty-result">該当する資料はありません。</div>';
   more.hidden=current.length===matches.length;
   for(const t of tabs)t.setAttribute("aria-pressed",String(t.dataset.type===tab));
   const query=new URLSearchParams(Object.entries(params).filter(([k,v])=>v));
   try{history.replaceState(null,"","explore.html"+(query.size?"?"+query.toString():""))}catch{}
 }
 side.addEventListener("input",e=>{tab="";draw()});
 side.addEventListener("change",e=>{tab="";draw()});
 side.addEventListener("reset",e=>{e.preventDefault();side.reset();top.reset();tab="";draw()});
 for(const t of tabs)t.addEventListener("click",()=>{tab=t.dataset.type||"";side.elements.namedItem("category").value=tab;top.elements.namedItem("category").value=tab;draw()});
 top.addEventListener("submit",e=>{
  e.preventDefault();
  for(const name of ["q","category","region","theme"])side.elements.namedItem(name).value=top.elements.namedItem(name).value;
  tab="";draw();
 });
 more.addEventListener("click",()=>{offset+=25;draw(false)});
 draw();
}
function initTopSearch(){
 const top=$(".search-form");if(!top)return;
 const qs=new URLSearchParams(location.search);
 for(const name of ["q","category","region","theme"]){const field=top.elements.namedItem(name);if(field&&qs.has(name))field.value=qs.get(name)}
}
document.addEventListener("DOMContentLoaded",async()=>{
 initNav();
 try{
  await load();
  updateSelects();
  initTopSearch();
  initHome();initExplore();initMunicipality();initSchool();
 }catch(e){
  console.error("Published archive load error:",e);
  const notice=$("#result-count")||$("#home-regions")||$("#muni-intro")||$("#school-subtitle");
  if(notice)notice.textContent="公開索引を読み込めませんでした。";
  const frame=$("#map-frame");if(frame)frame.innerHTML='<p>地図データを読み込めませんでした。</p>';
 }
});
})();