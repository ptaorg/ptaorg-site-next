/* PTA制度・運用研究 | site-next prototype
   Public data only. No privileged credentials, unpublished attachments, or live production mutation. */
(() => {
  'use strict';
  const normalize = value => String(value || '').normalize('NFKC').replace(/\s+/g, '').toLocaleLowerCase('ja');
  const cleanText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localLink = path => typeof path === 'string' && /^\/(?:archive|research)\/[a-z0-9_/-]+(?:\.html|\/)$/.test(path) ? `https://ptaorg.com${path}` : 'https://ptaorg.com/';
  const localSchoolLink = path => `school.html?url=${encodeURIComponent(path)}`;
  const localRegionLink = id => `municipality.html?id=${encodeURIComponent(id)}`;
  const esc = cleanText;
  let data = { map: {municipalities:[]}, responses:{responses:[]}, demo:true };

  function menu() {
    const button = document.querySelector('[data-menu-button]'); const nav = document.getElementById('global-nav');
    if (!button || !nav) return;
    button.addEventListener('click', () => {const open = nav.classList.toggle('open'); button.setAttribute('aria-expanded',String(open));});
    nav.addEventListener('click', event => {if (event.target.closest('a')) {nav.classList.remove('open');button.setAttribute('aria-expanded','false');}});
  }
  async function loadJSON(path) {const resp=await fetch(path,{cache:'no-cache'});if(!resp.ok)throw Error(`Data unavailable: ${path}`);return resp.json();}
  async function loadData() {
    const [fullMap,fullResponses] = await Promise.allSettled([loadJSON('data/research-map-index.json'),loadJSON('data/board-responses.json')]);
    const demo = await loadJSON('data/demo.json');
    const map = fullMap.status==='fulfilled' && Array.isArray(fullMap.value.municipalities) ? fullMap.value : demo.map;
    const responses = fullResponses.status==='fulfilled' && Array.isArray(fullResponses.value.responses) ? fullResponses.value : demo.responses;
    return {map,responses,demo:map===demo.map || responses===demo.responses};
  }
  function allSchools() { return data.map.municipalities.flatMap(m => (m.schools||[]).map(s=>({...s, regionId:m.id,regionName:m.name,regionPrefecture:m.prefecture}))); }
  function uniquePrefectures() {return [...new Set(data.map.municipalities.map(m=>m.prefecture))].sort((a,b)=>a.localeCompare(b,'ja'));}
  function getStatus(doc){return String(doc?.status||'確認状況未記載');}
  function sourceStatus(s){const states=(s.documents||[]).map(getStatus); return states.includes('公開前確認中')?'公開前確認中':states[0]||'未確認';}
  function writeCounts(){const regionCount=data.map.municipalities.length,schoolCount=allSchools().length, responseCount=data.responses.responses.length;
    [['stat-regions',regionCount],['stat-schools',schoolCount],['stat-responses',responseCount]].forEach(([id,n])=>{const e=document.getElementById(id);if(e)e.textContent=n.toLocaleString('ja-JP');});
    const state=document.getElementById('data-state');if(state)state.textContent=data.demo?'画面見本用の一部データ':'公開済みデータを同期済み';
    const note=document.getElementById('data-note');if(note)note.textContent=data.demo?'現在は画面確認用の抜粋データです。全件閲覧には公開データの同期が必要です。':`公開済みデータを読み込みました：${regionCount}地域・${schoolCount}校・${responseCount}回答。`;}
  function matchingStrings(parts,q){return parts.some(x=>normalize(x).includes(q));}
  function municipalityForSchool(s){return data.map.municipalities.find(m=>m.id===s.regionId);}
  function matchedRecords({query='',prefecture='',schoolType=''}) {
    const q=normalize(query);
    const municipalities=data.map.municipalities.filter(m=> (!prefecture||m.prefecture===prefecture) && !schoolType && (!q || matchingStrings([m.name,m.prefecture,`${m.prefecture}${m.name}`,...(m.themes||[])],q)));
    const schools=allSchools().filter(s=>{
      if(prefecture && s.regionPrefecture!==prefecture)return false;
      if(schoolType && s.type!==schoolType)return false;
      if(!q)return true;
      return matchingStrings([s.name,s.regionName,s.regionPrefecture,`${s.regionPrefecture}${s.regionName}`,...(s.documents||[]).map(d=>d.title)],q);
    });
    const responses=(data.responses.responses||[]).filter(r=>{
      if(schoolType)return false;
      if(prefecture && r.prefecture!==prefecture)return false;
      if(!q)return true;
      // Match source metadata only. Full long answer text is read at the canonical source page.
      return matchingStrings([r.municipality,r.prefecture,...(r.topics||[]),r.date],q);
    });
    return {municipalities,schools,responses};
  }
  function tags(labels){return (labels||[]).slice(0,3).map(x=>`<span class="tag">${esc(x)}</span>`).join('');}
  function cardM(m){return `<article class="result-card"><div><span class="kind">自治体・制度研究</span><h3><a href="${localRegionLink(m.id)}">${esc(m.prefecture)} ${esc(m.name)}</a></h3><p>${esc((m.summary||[])[0]||`${m.name}の資料・学校別索引を確認できます。`)}</p><div class="tag-row"><span class="tag">学校索引 ${(m.schools||[]).length}校</span>${tags(m.themes)}</div></div><a class="result-side" aria-label="${esc(m.name)}の詳細" href="${localRegionLink(m.id)}">↗</a></article>`;}
  function cardS(s){return `<article class="result-card"><div><span class="kind school">学校別一次資料</span><h3><a href="${localSchoolLink(s.url)}">${esc(s.name)}</a></h3><p>${esc(s.regionPrefecture)} ${esc(s.regionName)} ／ ${esc(s.type||'学校種別未記載')}</p><div class="tag-row"><span class="tag">文書 ${(s.documents||[]).length}件</span><span class="tag">${esc(sourceStatus(s))}</span></div></div><a class="result-side" aria-label="${esc(s.name)}の詳細" href="${localSchoolLink(s.url)}">↗</a></article>`;}
  function cardR(r){return `<article class="result-card"><div><span class="kind response">教育委員会回答</span><h3><a href="${esc(safeSourceLink(r.url))}" target="_blank" rel="noopener noreferrer">${esc(r.municipality)}</a></h3><p>${esc(r.date||'回答日付未確認')} ／ 公開済み回答の原文は現行サイトで確認できます。</p><div class="tag-row">${tags(r.topics)}</div></div><a class="result-side" aria-label="${esc(r.municipality)}の回答原文" href="${esc(safeSourceLink(r.url))}" target="_blank" rel="noopener noreferrer">↗</a></article>`;}
  function safeSourceLink(url){try{const x=new URL(url,'https://ptaorg.com');return x.origin==='https://ptaorg.com' ? x.href : 'https://ptaorg.com/board-responses.html';}catch{return 'https://ptaorg.com/board-responses.html';}}
  function renderExplorer(){
    const form=document.getElementById('explore-form');const query=document.getElementById('query');const pref=document.getElementById('prefecture');const schoolType=document.getElementById('school-type');const tabs=[...document.querySelectorAll('[data-tab]')];const output=document.getElementById('results');const empty=document.getElementById('empty-results');
    uniquePrefectures().forEach(x=>pref.add(new Option(x,x)));
    const url=new URL(location.href);query.value=url.searchParams.get('q')||'';pref.value=url.searchParams.get('pref')||'';schoolType.value=url.searchParams.get('type')||'';
    let active=url.searchParams.get('tab')||'all';if(!['all','municipality','school','response'].includes(active))active='all';let max=30;
    const sync=()=>{const params=new URLSearchParams();if(query.value.trim())params.set('q',query.value.trim());if(pref.value)params.set('pref',pref.value);if(schoolType.value)params.set('type',schoolType.value);if(active!=='all')params.set('tab',active);history.replaceState(null,'',`explore.html${params.toString()?'?'+params:''}`);};
    function draw(){sync();const result=matchedRecords({query:query.value,prefecture:pref.value,schoolType:schoolType.value});const counts={municipality:result.municipalities.length,school:result.schools.length,response:result.responses.length};counts.all=counts.municipality+counts.school+counts.response;
      Object.entries(counts).forEach(([k,n])=>{document.getElementById('count-'+k).textContent=n;});tabs.forEach(t=>{const on=t.dataset.tab===active;t.setAttribute('aria-pressed',String(on));t.classList.toggle('is-active',on);});
      const items=[...(active==='all'||active==='municipality'?result.municipalities.map(m=>({kind:'municipality',value:m})):[]),...(active==='all'||active==='school'?result.schools.map(s=>({kind:'school',value:s})):[]),...(active==='all'||active==='response'?result.responses.map(r=>({kind:'response',value:r})):[])];
      document.getElementById('result-count').textContent=`${items.length}件見つかりました`;
      const batch=items.slice(0,max);output.innerHTML=batch.map(i=>i.kind==='municipality'?cardM(i.value):i.kind==='school'?cardS(i.value):cardR(i.value)).join('');
      if(items.length>max){const bar=document.createElement('div');bar.className='more-results';bar.innerHTML=`<button class="button button-outline" type="button">さらに表示（${items.length-max}件）</button>`;bar.querySelector('button').addEventListener('click',()=>{max+=60;draw();});output.append(bar);}
      empty.hidden=items.length!==0;
    }
    form.addEventListener('submit',ev=>ev.preventDefault());[query,pref,schoolType].forEach(el=>el.addEventListener(el===query?'input':'change',()=>{max=30;draw();}));
    tabs.forEach(t=>t.addEventListener('click',()=>{active=t.dataset.tab;max=30;draw();}));
    document.getElementById('clear-filters').addEventListener('click',()=>{query.value='';pref.value='';schoolType.value='';active='all';max=30;draw();query.focus();});draw();
  }
  function section(title,body,id){return `<section class="detail-section" id="${id}"><h2>${esc(title)}</h2>${body}</section>`;}
  function renderMunicipality(){const id=new URL(location.href).searchParams.get('id')||'';const root=document.getElementById('municipality-root');const m=data.map.municipalities.find(x=>x.id===id);if(!m){root.innerHTML='<div class="empty-state"><h1>自治体が見つかりません</h1><p>全国検索から選び直してください。</p><a class="button button-dark" href="explore.html">全国検索に戻る</a></div>';return;}
    document.title=`${m.name}のPTA制度・学校別資料 | PTA制度・運用研究`;document.getElementById('crumb-municipality').textContent=m.name;
    const related=(data.responses.responses||[]).filter(r=>normalize(r.municipality).includes(normalize(m.name)) && (!r.prefecture||r.prefecture===m.prefecture)).slice(0,12);
    const summaries=(m.summary||[]).map(t=>`<p class="summary-paragraph">${esc(t)}</p>`).join('');
    const schools=(m.schools||[]).map(s=>`<article class="detail-card"><div class="detail-card-top"><div><h3><a href="${localSchoolLink(s.url)}">${esc(s.name)} ↗</a></h3><p>${esc(s.type||'学校')} ／ 文書${(s.documents||[]).length}件</p></div><span class="small-status ${sourceStatus(s)==='公開前確認中'?'pending':''}">${esc(sourceStatus(s))}</span></div></article>`).join('');
    const responseItems=related.map(r=>`<article class="detail-card"><h3><a href="${esc(safeSourceLink(r.url))}" target="_blank" rel="noopener noreferrer">${esc(r.municipality)}の公開回答 ↗</a></h3><p>${esc(r.date||'日付未確認')} ／ ${esc((r.topics||[]).slice(0,4).join('・'))}</p></article>`).join('');
    const sourceLink=m.url?`<a class="button button-outline" href="${localLink(m.url)}" target="_blank" rel="noopener noreferrer">既存研究ノートを読む ↗</a>`:'';
    root.innerHTML=`<header class="detail-heading"><div class="detail-eyebrow"><span>自治体研究</span><span>${esc(m.prefecture)}</span></div><h1>${esc(m.name)}のPTA資料</h1><p class="detail-lead">学校別文書・公開済み教育委員会回答・制度研究を、自治体単位で確認できます。資料の掲載状況と制度の評価は別々に示します。</p><div class="detail-actions"><a class="button button-dark" href="explore.html?q=${encodeURIComponent(m.name)}">${esc(m.name)}の検索結果へ →</a>${sourceLink}</div></header><div class="detail-grid"><div>${section('調査・研究の概要',summaries||'<p>既存研究データでの説明は準備中です。学校別資料と原本所在を確認してください。</p>','summary')}${section(`登録された学校（${(m.schools||[]).length}校）`,schools||'<p>この索引には学校別資料が登録されていません。自治体の制度資料・行政回答をご確認ください。</p>','schools')}${section('公開されている教育委員会回答',responseItems||'<p>この自治体に対応する公開済み回答は、現在の検索データでは確認できません。回答が存在しないことを意味するものではありません。</p>','responses')}</div><aside class="detail-aside"><div class="aside-box"><strong>この自治体の情報</strong><p>都道府県：${esc(m.prefecture)}</p><p>学校索引：${(m.schools||[]).length}校</p><p>関連する公開回答：${related.length}件</p></div><div class="aside-box"><strong>関連ページ</strong><a href="explore.html">全国資料を探す →</a><a href="https://ptaorg.com/national-archive.html" target="_blank" rel="noopener noreferrer">既存の全国資料館 ↗</a><a href="https://ptaorg.com/board-responses.html" target="_blank" rel="noopener noreferrer">教育委員会回答DB ↗</a></div><div class="notice-box">掲載状況は、原本の公開許可や資料内容の適法性判断を意味しません。公開前確認中の原本へのリンクは作成しません。</div></aside></div>`;
  }
  function renderSchool(){const url=new URL(location.href).searchParams.get('url')||'';const root=document.getElementById('school-root');const s=allSchools().find(x=>x.url===url);if(!s){root.innerHTML='<div class="empty-state"><h1>学校が見つかりません</h1><p>全国検索から学校名を探してください。</p><a class="button button-dark" href="explore.html">学校を探す</a></div>';return;}
    document.title=`${s.name}のPTA一次資料 | PTA制度・運用研究`;document.getElementById('crumb-region').textContent=s.regionName;document.getElementById('crumb-region').href=localRegionLink(s.regionId);document.getElementById('crumb-school').textContent=s.name;
    const documents=(s.documents||[]).map(d=>`<li><div><strong>${esc(d.title||'資料名未確認')}</strong></div><span class="small-status ${getStatus(d)==='公開前確認中'?'pending':''}">${esc(getStatus(d))}</span></li>`).join('');
    root.innerHTML=`<header class="detail-heading"><div class="detail-eyebrow"><span>学校別一次資料</span><span>${esc(s.regionPrefecture)} ${esc(s.regionName)}</span></div><h1>${esc(s.name)}</h1><p class="detail-lead">学校に関係する文書の所在と確認状況です。公開前確認中の資料を、公開済み原本として取り扱わないようにしています。</p><div class="detail-actions"><a class="button button-dark" href="${localRegionLink(s.regionId)}">${esc(s.regionName)}の資料一覧へ →</a><a class="button button-outline" href="${localLink(s.url)}" target="_blank" rel="noopener noreferrer">現行の学校ページを確認 ↗</a></div></header><div class="detail-grid"><div>${section('資料の登録状況',`<ul class="doc-list">${documents||'<li>登録文書なし</li>'}</ul>`,'documents')}${section('資料の読み方','<div class="notice-box">文書の登録、原本の公開、文書の内容確認、法的評価は別の段階です。この試作画面は登録情報を示しており、適法・違法の判断を自動的には行いません。</div>','method')}</div><aside class="detail-aside"><div class="aside-box"><strong>学校の基本情報</strong><p>自治体：${esc(s.regionName)}</p><p>学校種別：${esc(s.type||'未記載')}</p><p>登録文書：${(s.documents||[]).length}件</p></div><div class="aside-box"><strong>あわせて見る</strong><a href="${localRegionLink(s.regionId)}">自治体の研究・回答 →</a><a href="explore.html?q=${encodeURIComponent(s.regionName)}">${esc(s.regionName)}の他校を探す →</a><a href="https://ptaorg.com/board-responses.html" target="_blank" rel="noopener noreferrer">全国の行政回答 ↗</a></div></aside></div>`;
  }
  async function init(){menu();try{data=await loadData();writeCounts();const page=document.body.dataset.page;if(page==='explore')renderExplorer();if(page==='municipality')renderMunicipality();if(page==='school')renderSchool();}catch(error){console.error('Failed to load public site data:',error);const target=document.getElementById('data-note')||document.getElementById('municipality-root')||document.getElementById('school-root')||document.getElementById('data-state');if(target)target.textContent='データを読み込めませんでした。ローカルサーバー経由で開いてください。';}}
  if(typeof module!=='undefined'&&module.exports)module.exports={normalize,matchedRecordsFactory:(map,responses,query)=>{data={map,responses};return matchedRecords(query)},safeSourceLink};
  if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',init);
})();
