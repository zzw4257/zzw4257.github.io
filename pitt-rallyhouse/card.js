const FONT='"PingFang SC",-apple-system,"Segoe UI",sans-serif';
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function loadImg(s){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=s})}
function place(im,fw,fh,cover){const s=(cover?Math.max:Math.min)(fw/im.naturalWidth,fh/im.naturalHeight);const w=im.naturalWidth*s,h=im.naturalHeight*s;return{x:(fw-w)/2,y:(fh-h)/2,w,h}}
function wrapMax(c,t,x,y,mw,lh,max){const out=[];let line='',full=false;for(const ch of t){if(line&&c.measureText(line+ch).width>mw){out.push(line);line=ch;if(out.length===max){full=true;break}}else line+=ch}
 if(!full&&line)out.push(line);
 if(full){let l=out[max-1];while(l&&c.measureText(l+'…').width>mw)l=l.slice(0,-1);out[max-1]=l+'…'}
 out.forEach((l,i)=>c.fillText(l,x,y+i*lh));return y+(out.length-1)*lh}
function ellip(c,t,mw){if(c.measureText(t).width<=mw)return t;while(t&&c.measureText(t+'…').width>mw)t=t.slice(0,-1);return t+'…'}
function footerBar(c,H,left,right){rr(c,48,H-152,984,104,26);c.fillStyle='#071d49';c.fill();c.textBaseline='middle';
 c.fillStyle='#fff';c.font='800 34px '+FONT;c.fillText(left,86,H-99);
 c.fillStyle='#ffb81c';c.font='600 29px '+FONT;c.fillText(right,1008-c.measureText(right).width,H-99)}

async function itemCanvas(p){
  const H=1660,FH=1000,cv=document.createElement('canvas');cv.width=1080;cv.height=H;
  const c=cv.getContext('2d');
  c.fillStyle='#f6f7fa';c.fillRect(0,0,1080,H);
  const fx=48,fy=48,fw=984,im=await loadImg(image(p.id));
  c.save();rr(c,fx,fy,fw,FH,36);c.clip();
  const cov=place(im,fw,FH,true);
  let blurOK=false;
  try{c.filter='blur(64px)';blurOK=c.filter!=='none'}catch(e){}
  if(blurOK){c.drawImage(im,fx+cov.x,fy+cov.y,cov.w,cov.h);c.filter='none'}
  else{c.globalAlpha=.5;c.drawImage(im,fx+cov.x,fy+cov.y,cov.w,cov.h);c.globalAlpha=1;c.fillStyle='#ffffffaa';c.fillRect(fx,fy,fw,FH)}
  const con=place(im,fw,FH,false);
  c.shadowColor='rgba(7,29,73,.30)';c.shadowBlur=48;c.shadowOffsetY=20;
  c.drawImage(im,fx+con.x,fy+con.y,con.w,con.h);
  c.restore();
  c.textBaseline='middle';c.font='900 34px '+FONT;
  const numt=id(p.id),nw=c.measureText(numt).width+44;
  rr(c,fx+24,fy+24,nw,62,31);c.fillStyle='#071d49';c.fill();
  c.fillStyle='#fff';c.fillText(numt,fx+46,fy+56);
  if(p.original&&p.usd!=null){const st='直降 $'+Number(p.original-p.usd).toFixed(0),sw=c.measureText(st).width+40;
    rr(c,fx+fw-24-sw,fy+24,sw,62,31);c.fillStyle='#fffffff2';c.fill();
    c.fillStyle='#d92d20';c.font='800 30px '+FONT;c.fillText(st,fx+fw-24-sw+20,fy+56)}
  let y=fy+FH+72;
  c.textBaseline='alphabetic';
  c.fillStyle='#101828';c.font='800 50px '+FONT;
  y=wrapMax(c,p.name,fx,y,fw,58,2);
  y+=54;c.fillStyle='#667085';c.font='400 30px '+FONT;
  c.fillText(ellip(c,p.brand+' · '+p.category+(p.detail?' · '+p.detail:''),fw),fx,y);
  y+=104;
  if(p.cny!=null){c.fillStyle='#071d49';c.font='900 88px '+FONT;const cy='¥'+p.cny;c.fillText(cy,fx,y);
    let px=fx+c.measureText(cy).width+22;
    if(p.usd!=null){c.fillStyle='#98a2b3';c.font='600 34px '+FONT;c.fillText('$'+Number(p.usd).toFixed(2),px,y-6);px+=c.measureText('$'+Number(p.usd).toFixed(2)).width+18}
    if(p.original){c.fillStyle='#c3c9d4';c.font='400 30px '+FONT;const ot='原价 $'+Number(p.original).toFixed(2);c.fillText(ot,px,y-4);
      c.strokeStyle='#c3c9d4';c.lineWidth=3;c.beginPath();c.moveTo(px,y-16);c.lineTo(px+c.measureText(ot).width,y-16);c.stroke()}}
  else{c.fillStyle='#071d49';c.font='700 46px '+FONT;c.fillText('价格到店确认',fx,y)}
  y+=86;c.fillStyle='#475467';c.font='400 33px '+FONT;
  const sz=(p.size&&!/待/.test(p.size))?'实拍尺码 '+p.size+'　':'';
  wrapMax(c,sz+p.note,fx,y,fw,50,2);
  footerBar(c,H,'🏈 Pitt 选衣册','回我：编号 / 尺码 / 数量');
  return cv}

async function listCanvas(){
  const items=[...C].sort((a,b)=>a-b).map(i=>P.find(x=>x.id===i));
  const rows=Math.min(items.length,7),extra=items.length-rows,rowH=172,top=216;
  const H=top+rows*rowH+(extra?74:0)+188;
  const cv=document.createElement('canvas');cv.width=1080;cv.height=H;
  const c=cv.getContext('2d');
  c.fillStyle='#fbfcfe';c.fillRect(0,0,1080,H);
  c.textBaseline='alphabetic';
  c.fillStyle='#071d49';c.font='900 60px '+FONT;c.fillText('🧡 我的心愿单',48,118);
  c.fillStyle='#667085';c.font='500 30px '+FONT;c.fillText('共 '+items.length+' 件',48,172);
  let y=top;
  for(let k=0;k<rows;k++){const p=items[k];
    try{const im=await loadImg(image(p.id));c.save();rr(c,48,y+12,126,126,24);c.clip();
      const pl=place(im,126,126,true);c.drawImage(im,48+pl.x,y+12+pl.y,pl.w,pl.h);c.restore()}catch(e){}
    c.fillStyle='#101828';c.font='700 37px '+FONT;c.fillText(ellip(c,id(p.id)+' '+p.name,560),204,y+58);
    c.fillStyle='#667085';c.font='400 28px '+FONT;c.fillText('实拍 '+p.size+' · '+(p.usd==null?'到店确认':'$'+Number(p.usd).toFixed(2)),204,y+108);
    if(p.cny!=null){c.fillStyle='#071d49';c.font='900 46px '+FONT;c.textAlign='right';c.fillText('¥'+p.cny,1032,y+94);c.textAlign='left'}
    if(k<rows-1||extra){c.strokeStyle='#edf0f4';c.beginPath();c.moveTo(204,y+rowH-22);c.lineTo(1032,y+rowH-22);c.stroke()}
    y+=rowH}
  if(extra>0){c.fillStyle='#98a2b3';c.font='500 30px '+FONT;c.fillText('…还有 '+extra+' 件',204,y+36);y+=74}
  footerBar(c,H,'🏈 Pitt 选衣册','编号 / 尺码 / 数量 发我就行');
  return cv}

function cardText(p){
  const L=[];
  L.push('🏈 Pitt 校园周边实拍｜'+id(p.id));
  L.push('');
  L.push(p.name);
  L.push(p.brand+' · '+p.detail);
  L.push('');
  const pr=p.usd==null?'价格到店确认':'$'+Number(p.usd).toFixed(2)+(p.cny!=null?'（约 ¥'+p.cny:'')+(p.cny!=null?(p.original?'，原价 $'+Number(p.original).toFixed(2):'')+'）':'');
  L.push('💰 '+pr);
  if(p.size)L.push('📏 店内实拍：'+p.size+' 码');
  L.push('');
  if(p.note)L.push('💬 '+p.note);
  L.push('');
  L.push('看中回我一句：'+id(p.id)+' / 尺码 / 数量');
  L.push('到店帮大家带～');
  return L.join('\n')}
function listText(){
  const items=[...C].sort((a,b)=>a-b).map(i=>P.find(x=>x.id===i));
  return '🧡 我的 Pitt 心愿单（'+items.length+' 件）\n\n'
    +items.map(p=>id(p.id)+' '+p.name+'｜'+(p.size||'')+'｜'+(p.usd==null?'到店确认':'$'+Number(p.usd).toFixed(2)+' / ¥'+p.cny)).join('\n')
    +'\n\n尺码数量都标好了，麻烦帮我带一下～\n（库存以到店当天为准）'}

let SB=null,SNAME='pitt-card.png',SHARE_TEXT='';
async function showShare(cv,text,name){
  SB=await new Promise(r=>cv.toBlob(r,'image/png'));SNAME=name;
  SHARE_TEXT=text;$('scard').src=URL.createObjectURL(SB);
  $('share').classList.add('on');document.body.style.overflow='hidden'}
function closeShare(){$('share').classList.remove('on');document.body.style.overflow=''}
async function openItemShare(){const p=P.find(x=>x.id===cur);await showShare(await itemCanvas(p),cardText(p),'pitt-'+id(p.id)+'.png')}
async function openCartShare(){if(!C.size)return;await showShare(await listCanvas(),listText(),'pitt-list.png')}
function toast(m){const e=$('toast');e.textContent=m;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),1700)}
async function doShare(){if(!SB)return;
  try{const f=new File([SB],SNAME,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}
    saveCard()}catch(e){}}
function saveCard(){if(!SB)return;const a=document.createElement('a');a.href=URL.createObjectURL(SB);a.download=SNAME;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000);toast('已开始下载，也可长按预览图保存')}
async function copyCard(){if(!SB)return;
  try{await navigator.clipboard.write([new ClipboardItem({'image/png':SB})]);toast('图片已复制')}
  catch(e){saveCard()}}
function copyCardText(){cp(SHARE_TEXT||'')}
