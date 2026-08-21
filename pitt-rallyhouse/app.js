const P=window.PRODUCTS;
let F='all',cur=1,C=new Set(JSON.parse(localStorage.getItem('pittcart')||'[]'));
const $=id=>document.getElementById(id);
const id=i=>'#'+String(i).padStart(2,'0');
const usd=x=>x==null?'价格待确认':'$'+Number(x).toFixed(2);
const cn=x=>x==null?'到店确认':'¥'+x;
const image=i=>`assets/web/${String(i).padStart(2,'0')}.webp`;

function filter(f){
  F=f;
  document.querySelectorAll('.f').forEach(x=>x.classList.toggle('on',x.dataset.f===f));
  render();
}
function matchFilter(p){
  return F==='all'
    || (F==='women'&&(p.gender==='women'||p.gender==='all'))
    || (F==='men'&&(p.gender==='men'||p.gender==='all'))
    || (F==='sale'&&p.original)
    || (F==='cheap'&&p.usd!=null&&p.usd<30);
}
function render(){
  const s=$('q').value.toLowerCase().trim();
  const a=P.filter(p=>matchFilter(p)&&(!s||JSON.stringify(p).toLowerCase().includes(s)||id(p.id).includes(s)));
  $('count').textContent=a.length+' 件';
  $('grid').innerHTML=a.map(p=>`
    <article class="card">
      <div class="pic" onclick="openM(${p.id})">
        <img src="${image(p.id)}" alt="${id(p.id)} ${p.name}" loading="lazy">
        <span class="num">${id(p.id)}</span>
        ${p.original?'<span class="sale">折扣</span>':''}
      </div>
      <div class="cb">
        <div class="name">${p.name}</div>
        <div class="meta">${p.brand} · ${p.category} · 实拍 ${p.size}</div>
        <div class="price">${cn(p.cny)}</div>
        <div class="usd">${usd(p.usd)}${p.original?' · 原 $'+Number(p.original).toFixed(2):''}</div>
        <div class="acts">
          <button class="detail" onclick="openM(${p.id})">详情</button>
          <button class="add ${C.has(p.id)?'on':''}" onclick="tog(${p.id},this)">${C.has(p.id)?'✓':'＋'}</button>
        </div>
      </div>
    </article>`).join('');
  $('bar').classList.toggle('on',C.size>0);
  $('ncart').textContent=C.size;
}
function openM(i){
  cur=i;
  const p=P.find(x=>x.id===i);
  $('mpic').innerHTML=`<img src="${image(i)}" alt="${id(i)} ${p.name}">`;
  $('mid').textContent=id(i)+' · '+p.brand;
  $('mn').textContent=p.name;
  $('ms').textContent=p.category+' · '+p.detail;
  $('price').textContent=cn(p.cny)+' · '+usd(p.usd);
  $('facts').innerHTML=`<div class="fact"><small>实拍尺码</small><b>${p.size}</b></div><div class="fact"><small>编号</small><b>${id(i)}</b></div>`;
  $('aud').textContent=p.audience;
  $('note').textContent=p.note;
  $('buy').textContent=C.has(i)?'已加入清单':'加入清单';
  $('modal').classList.add('on');
  document.body.style.overflow='hidden';
  history.replaceState(null,'','#item-'+String(i).padStart(2,'0'));
}
function closeM(){
  $('modal').classList.remove('on');
  document.body.style.overflow='';
  history.replaceState(null,'',location.pathname);
}
function tog(i,b){
  C.has(i)?C.delete(i):C.add(i);
  localStorage.setItem('pittcart',JSON.stringify([...C]));
  if(b){b.classList.toggle('on',C.has(i));b.textContent=C.has(i)?'✓':'＋'}
  render();
}
function toggleCur(){tog(cur);openM(cur)}
function line(p){return `${id(p.id)} ${p.name}｜实拍${p.size}｜${usd(p.usd)} / ${cn(p.cny)}`}
async function cp(t){try{await navigator.clipboard.writeText(t);alert('已复制')}catch(e){prompt('复制：',t)}}
function copyCur(){const p=P.find(x=>x.id===cur);cp(line(p)+'\n需要：尺码____ / 数量____')}
function copyCart(){cp('Pitt 选衣册心愿单\n'+[...C].sort((a,b)=>a-b).map(i=>line(P.find(x=>x.id===i))).join('\n')+'\n请补充每件尺码和数量。')}
function guide(){cp('想要哪件直接发一句话就行。\n格式：编号 + 尺码 + 数量\n例如：#14 / S / 1件\n\n多件可以点"＋"加入清单，最后一键复制发我。\n价格按 1 USD ≈ ¥6.8，库存和折扣以到店当天为准。')}
const price=p=>p.usd==null?'$ 到店确认':'$'+Number(p.usd).toFixed(2)+(p.cny!=null?' / ¥'+p.cny:'');
function xhs(p){
  const L=[];
  L.push('🏈 Pitt 校园周边实拍 · '+id(p.id));
  L.push('');
  L.push(id(p.id)+' '+p.name);
  L.push('🏷 '+p.brand+' · '+p.detail);
  if(p.size)L.push('📏 店内实拍尺码：'+p.size);
  L.push('💰 '+price(p)+(p.original?'（原价 $'+Number(p.original).toFixed(2)+'）':''));
  L.push('');
  if(p.audience)L.push('👀 适合：'+p.audience);
  if(p.note)L.push('💬 '+p.note);
  L.push('');
  L.push('看中的话回我：'+id(p.id)+' / 尺码 / 数量');
  L.push('我在店里帮大家带～');
  L.push('（汇率按 1 USD ≈ ¥6.8，库存以到店当天为准）');
  return L.join('\n');
}
function xhsCur(){cp(xhs(P.find(x=>x.id===cur)))}
function xhsCart(){
  if(!C.size)return;
  const items=[...C].sort((a,b)=>a-b).map(i=>{const p=P.find(x=>x.id===i);return id(i)+' '+p.name+'｜'+(p.size||'')+'｜'+price(p)}).join('\n');
  cp('🧡 我的 Pitt 心愿单\n\n'+items+'\n\n就想要这几件，尺码数量标好了，麻烦帮我带一下～\n（汇率按 1 USD ≈ ¥6.8，库存以到店当天为准）');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
render();
const m=location.hash.match(/item-(\d+)/); if(m&&P.some(x=>x.id===+m[1])) openM(+m[1]);
