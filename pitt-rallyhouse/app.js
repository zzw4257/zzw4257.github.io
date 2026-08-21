const P=window.PRODUCTS;
let F='all',cur=1,C=new Set(JSON.parse(localStorage.getItem('pittcart')||'[]'));
const $=id=>document.getElementById(id);
const id=i=>'#'+String(i).padStart(2,'0');
const usd=x=>x==null?'价格待确认':'$'+Number(x).toFixed(2);
const cn=x=>x==null?'到店确认':'¥'+x;
const image=i=>`assets/web/${String(i).padStart(2,'0')}.webp`;
const photoUrl=i=>`assets/photo/${String(i).padStart(2,'0')}.webp`;

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
  $('mpic').innerHTML=`<img src="${photoUrl(i)}" alt="${id(i)} ${p.name}" onclick="lightbox('${image(i)}')" title="点击查看海报大图">`;
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
async function cp(t){try{await navigator.clipboard.writeText(t);toast('已复制')}catch(e){prompt('复制：',t)}}
function copyCur(){const p=P.find(x=>x.id===cur);cp(line(p)+'\n需要：尺码____ / 数量____')}
function copyCart(){cp('Pitt 选衣册心愿单\n'+[...C].sort((a,b)=>a-b).map(i=>line(P.find(x=>x.id===i))).join('\n')+'\n请补充每件尺码和数量。')}
function guide(){cp('想要哪件直接发一句话就行。\n格式：编号 + 尺码 + 数量\n例如：#14 / S / 1件\n\n也可以点「分享卡片」，把生成的卡片图片直接发我，更直观。\n多件先点"＋"加入清单，最后「分享清单」一张图全搞定。')}
function lightbox(src){const im=$('limg');im.dataset.z='';im.style.transform='none';im.src=src;$('lbox').classList.add('on');document.body.style.overflow='hidden'}
function closeLb(){$('lbox').classList.remove('on');document.body.style.overflow=''}
function lbZoom(e){const im=$('limg');
  if(im.dataset.z==='1'){im.dataset.z='';im.style.transform='none';e.currentTarget.style.cursor='zoom-in'}
  else{const r=im.getBoundingClientRect();
    im.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';
    im.style.transform='scale(2.2)';im.dataset.z='1';e.currentTarget.style.cursor='zoom-out'}}
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
  if($('share').classList.contains('on'))closeShare();
  else if($('lbox').classList.contains('on')){closeLb()}
  else closeM()});
render();
const m=location.hash.match(/item-(\d+)/); if(m&&P.some(x=>x.id===+m[1])) openM(+m[1]);
