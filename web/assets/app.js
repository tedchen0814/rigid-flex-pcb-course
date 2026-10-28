// ===== 雙語支援：模式 zh / en / both =====
function B(zh,en){return `<span class="zh">${zh}</span><span class="en">${en}</span>`}
function ul(items){return '<ul>'+items.map(p=>`<li>${B(p[0],p[1])}</li>`).join('')+'</ul>'}
function tip(zh,en){return `<div class="tip">${B(zh,en)}</div>`}
function getMode(){return localStorage.getItem('lang')||'zh'}
function T(p){const m=getMode();return m==='en'?p[1]:m==='zh'?p[0]:p[0]+' / '+p[1]}
function setMode(m){
  localStorage.setItem('lang',m);
  document.body.classList.remove('m-zh','m-en','m-both');
  document.body.classList.add('m-'+m);
  document.querySelectorAll('.langsw button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
}
// 全站導覽列：插在頁首上方，標出目前頁面
const PAGES=[['index.html','首頁','Home'],['flex.html','軟板','Flex'],['rigid-flex.html','軟硬結合板','Rigid-Flex'],['animation.html','製程動畫','Animation'],['plating.html','蓋孔 vs 圖形電鍍','Tenting vs Pattern']];
function initNav(){
  const cur=location.pathname.split('/').pop()||'index.html';
  const n=document.createElement('nav');n.className='sitenav';
  n.innerHTML='<div class="in">'+PAGES.map(p=>`<a href="${p[0]}"${p[0]===cur?' class="on" aria-current="page"':''}>${B(p[1],p[2])}</a>`).join('')+'</div>';
  document.body.prepend(n);
  const on=n.querySelector('.on');if(on)on.scrollIntoView({inline:'nearest',block:'nearest'});
}
function initLang(){
  initNav();
  const hd=document.querySelector('header');
  const d=document.createElement('div');d.className='langsw';
  d.innerHTML='<button data-m="zh">中文</button><button data-m="both">中／EN</button><button data-m="en">English</button>';
  hd.appendChild(d);
  d.querySelectorAll('button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
  setMode(getMode());
}
function initTabs(){
  initLang();
  const btns=document.querySelectorAll('nav.tabs button');
  const panels=document.querySelectorAll('section.panel');
  function show(id){
    btns.forEach(b=>{const on=b.dataset.t===id;b.classList.toggle('on',on);if(on)b.scrollIntoView({inline:'nearest',block:'nearest'})});
    panels.forEach(p=>p.classList.toggle('on',p.id===id));
    history.replaceState(null,'','#'+id);
  }
  btns.forEach(b=>b.onclick=()=>show(b.dataset.t));
  show((location.hash||'').slice(1)&&document.getElementById(location.hash.slice(1))?location.hash.slice(1):btns[0].dataset.t);
}
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// ts「1:39–2:17」取開頭秒數，連到 YouTube 對應時間
function tsLink(ts,vid){
  if(!ts||!vid)return ts||'';
  const [m,s]=ts.split(/[–-]/)[0].split(':').map(Number);
  return `<a href="https://youtu.be/${vid}?t=${m*60+s}" target="_blank" rel="noopener" title="YouTube">${ts} ↗</a>`;
}
function renderSteps(el,steps,vid){
  el.innerHTML=steps.map((s,i)=>`<div class="step"><div class="hd" role="button" tabindex="0" aria-expanded="false"><span class="n">${i+1}</span><span class="t">${s.t}</span><span class="ts">${tsLink(s.ts,vid)}</span></div><div class="bd">${s.b}</div></div>`).join('')
   +`<button class="btn sec expAll">${B('全部展開／收合','Expand / collapse all')}</button>`;
  const set=(st,o)=>{st.classList.toggle('open',o);st.querySelector('.hd').setAttribute('aria-expanded',o)};
  el.querySelectorAll('.step .hd').forEach(h=>{
    h.onclick=e=>{if(e.target.closest('a'))return;set(h.parentElement,!h.parentElement.classList.contains('open'))};
    h.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();h.click()}};
  });
  el.querySelector('.expAll').onclick=()=>{const all=[...el.querySelectorAll('.step')];const o=all.every(x=>x.classList.contains('open'));all.forEach(x=>set(x,!o))};
}
// 選項每次作答都重新洗牌；data-j 仍是原始索引
function renderQuiz(el,qs){
  let done=0,right=0;
  el.innerHTML=qs.map((q,i)=>`<div class="card q" data-i="${i}"><b>${i+1}. ${q.q}</b><div class="opts">${shuffle(q.o.map((o,j)=>[o,j])).map(([o,j])=>`<button data-j="${j}">${o}</button>`).join('')}</div><div class="ex">💡 ${q.e}</div></div>`).join('')+`<div class="score"></div><button class="btn">${B('重新作答','Retry')}</button>`;
  const sc=el.querySelector('.score');
  el.querySelectorAll('.q').forEach(c=>{
    const q=qs[c.dataset.i];
    c.querySelectorAll('button').forEach(b=>b.onclick=()=>{
      if(c.dataset.d)return;c.dataset.d=1;done++;
      const j=+b.dataset.j;
      if(j===q.a){right++;b.classList.add('ok')}else{b.classList.add('bad');c.querySelector(`button[data-j="${q.a}"]`).classList.add('ok')}
      c.querySelector('.ex').style.display='block';
      const all=done===qs.length;
      sc.innerHTML=B(`已答 ${done}/${qs.length}，答對 ${right} 題`+(all?(right===qs.length?' 🎉 全對！':'，再接再厲！'):''),
                     `Answered ${done}/${qs.length}, correct ${right}`+(all?(right===qs.length?' 🎉 Perfect!':' — keep going!'):''));
    });
  });
  el.querySelector(':scope>.btn').onclick=()=>renderQuiz(el,qs);
}
function renderGlossary(el,rows){
  el.innerHTML=`<input class="search" placeholder="搜尋中文或英文名詞… / Search terms…"><table><thead><tr><th>中文</th><th>English</th></tr></thead><tbody></tbody></table>`;
  const tb=el.querySelector('tbody'),inp=el.querySelector('input');
  const draw=()=>{const k=inp.value.trim().toLowerCase();tb.innerHTML=rows.filter(r=>(r[0]+r[1]).toLowerCase().includes(k)).map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')};
  inp.oninput=draw;draw();
}
// items：[[中文,English],...] 為正確順序
function renderOrder(el,items){
  const shuf=shuffle(items.map((t,i)=>({t,i})));
  let picked=[];
  el.innerHTML=`<p>${B('依製程順序，依序點選下列步驟：','Click the steps in the correct process order:')}</p><div class="chips pool"></div><div class="card slot"></div><button class="btn chk">${B('檢查答案','Check')}</button><button class="btn sec undo">↩ ${B('退回一步','Undo')}</button><button class="btn sec rs">${B('重來','Reset')}</button><div class="score res"></div>`;
  const pool=el.querySelector('.pool'),slot=el.querySelector('.slot'),res=el.querySelector('.res');
  shuf.forEach(o=>{const c=document.createElement('button');c.className='chip';c.innerHTML=B(o.t[0],o.t[1]);o.el=c;c.onclick=()=>{picked.push(o);c.classList.add('picked');c.disabled=true;draw()};pool.appendChild(c)});
  function draw(){res.innerHTML='';slot.innerHTML=picked.map((o,k)=>`<span class="chip">${k+1}. ${B(o.t[0],o.t[1])}</span>`).join('')||B('（尚未選取）','(nothing selected)')}
  draw();
  el.querySelector('.undo').onclick=()=>{const o=picked.pop();if(o){o.el.classList.remove('picked');o.el.disabled=false;draw()}};
  el.querySelector('.chk').onclick=()=>{
    if(picked.length<items.length){res.innerHTML=B('還沒排完喔','Not finished yet');return}
    const n=picked.filter((o,k)=>o.i===k).length;
    res.innerHTML=n===items.length?B('🎉 完全正確！','🎉 All correct!'):B(`${n}/${items.length} 位置正確。正確順序：${items.map(x=>x[0]).join(' → ')}`,`${n}/${items.length} in place. Correct order: ${items.map(x=>x[1]).join(' → ')}`);
  };
  el.querySelector('.rs').onclick=()=>renderOrder(el,items);
}
