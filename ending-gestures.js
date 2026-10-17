/* 卷四以连续手势表现照看与陪伴；进度沿用原工艺存档。 */
window.EndingGestures = (() => {
 const arc=[[107,230],[88,184],[95,131],[128,86],[180,67],[233,86],[266,131],[273,184],[254,230]];
 const tau=Math.PI*2, clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 function phase(k,c){return k==='teach'?(c.taught?'done':'teach'):c.verified?'done':!c.inspected?'lift':c.wrap<16?'wire':c.repairedSmooth<8?'smooth':'check';}
 function title(k,s){const p=phase(k,s.craft);return {lift:'向上轻提，试试这盏灯',wire:'沿圆弧滑动，把松动的接口扎稳',smooth:'顺着布面轻轻滑过，抚平皱褶',check:'再向上提一次，确认灯已稳当',teach:'扶着这一端，陪阿禾慢慢弯',done:k==='teach'?'你松开手，阿禾接好了最后一段':'灯架稳了，可以放心交到别人手里'}[p];}
 const ringPoint=t=>[200+65*Math.cos(-Math.PI/2+t*tau),150+65*Math.sin(-Math.PI/2+t*tau)];
 function marker(p){return `<span class="swipe-cursor" style="left:${p[0]/4}%;top:${p[1]/3}%" aria-hidden="true"><i></i></span>`;}
 function html(k,s,art){const c=s.craft,p=phase(k,c);let body='',target=[200,65],hint='从亮处按住滑动，松手可接着做';
  if(p==='wire'){
   body=`<path d="M95 150H305M200 45V255" stroke="#caa36a" stroke-width="13"/><circle cx="200" cy="150" r="65" fill="none" stroke="#e6d7ad55" stroke-width="3" stroke-dasharray="4 7"/><circle class="swipe-ring" cx="200" cy="150" r="65" fill="none" stroke="#f0d39a" stroke-width="6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-c.wrap/16}" transform="rotate(-90 200 150)"/><path d="M270 100l5 15l-14-4" fill="none" stroke="#ddc18b" stroke-width="2"/>`;
   target=ringPoint(c.wrap/16);
  }else if(p==='smooth'){
   body=art.frame(s,true)+art.creases(c.repairedSmooth,true)+`<g transform="translate(85 -3)">${art.motif(s.pattern||'兰草')}</g>`+`<path d="M150 158H250m-12-9l12 9l-12 9" fill="none" stroke="#f5dfaf88" stroke-width="2"/>`;
   target=[150+100*c.repairedSmooth/8,158];
  }else if(k==='teach'){
   body=`<path d="${art.path(arc)}" fill="none" stroke="#d5c18e66" stroke-width="3" stroke-dasharray="4 7"/><path class="swipe-bamboo${c.taught?' bamboo-completed':''}" d="${art.path(arc)}" fill="none" stroke="#ebc784" stroke-width="7" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-(c.taught?1:c.lesson/8)}"/><image class="child-hand" href="assets/minigames/ahe-hands-soft.png" x="${c.taught?243:265}" y="${c.taught?212:206}" width="95" height="88"/>`;
   target=arc[0];hint='沿弧线滑动，最后松手让阿禾接住';
  }else{
   body=`<g class="swipe-lamp ${p==='lift'?'':'is-steady'}">${art.frame(s,true,'',p==='done')+(p==='lift'?art.creases(0,true):'')+`<g transform="translate(85 -3)">${art.motif(s.pattern||'兰草')}</g>`}</g>${p!=='done'?'<path d="M200 66V12m-9 12l9-12l9 12" fill="none" stroke="#f0d39a" stroke-width="2"/>':''}`;
  }
  return `<section class="enhanced-work ending-swipe" data-work="${k}"><div class="work-surface swipe-surface" data-swipe="${p}" tabindex="0" role="group" aria-label="${title(k,s)}；方向键也可操作"><svg class="work-svg" viewBox="0 0 400 300" aria-hidden="true">${body}</svg>${p!=='done'?marker(target):''}</div><p class="work-feedback" aria-live="polite"></p>${p!=='done'?`<span class="input-note">${hint}</span>`:''}</section>`;
 }
 function mount(k,{state:s,save,render,chime}){
  const c=s.craft,p=phase(k,c),el=document.querySelector('.swipe-surface');if(p==='done')return ()=>{};
  let g=null,alive=true,lift=0;const cursor=el.querySelector('.swipe-cursor'),feedback=document.querySelector('.work-feedback');
  const say=t=>{if(feedback)feedback.textContent=t;};
  const svg=el.querySelector('.work-svg'),bamboo=el.querySelector('.swipe-bamboo'),length=bamboo?.getTotalLength();
  // Read the rendered curve for hit testing, fill and marker, using one arc-length scale.
  const along=t=>{const q=bamboo.getPointAtLength(length*clamp(t));return [q.x,q.y];};
  const samples=p==='teach'?Array.from({length:281},(_,i)=>along(i/320)):[];
  const point=e=>{const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());return [q.x,q.y];};
  const current=()=>p==='wire'?ringPoint(c.wrap/16):p==='smooth'?[150+100*c.repairedSmooth/8,158]:p==='teach'?along(Math.min(c.lesson,7)/8):[200,65];
  function paint(){
   const pos=current();if(cursor){cursor.style.left=pos[0]/4+'%';cursor.style.top=pos[1]/3+'%';}
   el.querySelector('.swipe-ring')?.setAttribute('stroke-dashoffset',String(1-c.wrap/16));
   el.querySelector('.swipe-bamboo')?.setAttribute('stroke-dashoffset',String(1-c.lesson/8));
   el.querySelectorAll('.crease').forEach((e,j)=>e.setAttribute('opacity',String(.75*(1-clamp((c.repairedSmooth-j*4)/4)))));
   if(p==='smooth')MinigameArt.updateWrinkles(el,c.repairedSmooth);
   if(p==='lift'||p==='check'){el.querySelector('.swipe-lamp').style.transform=`translateY(${-lift*18}px) rotate(${p==='lift'?lift*4:0}deg)`;if(cursor)cursor.style.top=(65-lift*55)/3+'%';}
  }
  function finish(cancelled=false){
   if(!alive)return;g=null;let complete=false;
   if(!cancelled){if((p==='lift'||p==='check')&&lift>=1){if(p==='lift'){c.inspected=true;c.wirePlaced=true;}else c.verified=true;complete=true;}
    if(p==='wire'&&c.wrap>=16||p==='smooth'&&c.repairedSmooth>=8)complete=true;
    if(p==='teach'&&c.lesson>=7){c.taught=true;c.lesson=8;complete=true;}}
   save();if(complete){chime(587);render();}else{lift=0;paint();}
  }
  function nearest(q){let best={distance:Infinity,t:0};for(let i=0;i<samples.length-1;i++){const a=samples[i],b=samples[i+1],dx=b[0]-a[0],dy=b[1]-a[1],u=clamp(((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy)),x=a[0]+u*dx,y=a[1]+u*dy,d=Math.hypot(q[0]-x,q[1]-y);if(d<best.distance)best={distance:d,t:(i+u)/(samples.length-1)};}return best;}
  el.onpointerdown=e=>{
   if(!e.isPrimary||e.button!==0||g)return;const q=point(e),start=current();
   if(Math.hypot(q[0]-start[0],q[1]-start[1])>48){say('从发亮的地方开始，轻轻滑动。');return;}
   e.preventDefault();g={id:e.pointerId,start:q,angle:Math.atan2(q[1]-150,q[0]-200),travel:0,base:c.wrap/16};
   if(p==='teach')c.supported=true;el.setPointerCapture(e.pointerId);
  };
  el.onpointermove=e=>{
   if(!g||e.pointerId!==g.id)return;e.preventDefault();const q=point(e);
   if(!g.moved&&Math.hypot(q[0]-g.start[0],q[1]-g.start[1])<2)return;g.moved=true;
   if(p==='wire'){
    const radius=Math.hypot(q[0]-200,q[1]-150),a=Math.atan2(q[1]-150,q[0]-200);let delta=a-g.angle;if(delta>Math.PI)delta-=tau;if(delta< -Math.PI)delta+=tau;g.angle=a;
    if(radius<30||radius>110||Math.abs(delta)>.65){say('贴着圆弧绕过去，不用着急。');return;}
    g.travel+=delta;c.wrap=Math.max(c.wrap,clamp(g.base+g.travel/tau)*16);if(c.wrap>15.75)c.wrap=16;if(c.wrap===16)say('接口扎稳了，松手继续抚平灯面。');
   }else if(p==='smooth'){
    if(Math.abs(q[1]-158)>60){say('贴着灯面，慢慢滑向另一侧。');return;}
    const t=clamp((q[0]-150)/100);if(t-c.repairedSmooth/8<=.24)c.repairedSmooth=Math.max(c.repairedSmooth,t*8);if(c.repairedSmooth>7.85)c.repairedSmooth=8;if(c.repairedSmooth===8)say('布面平了，松手再提灯看看。');
   }else if(p==='teach'){
    const near=nearest(q);if(near.distance>48||near.t-c.lesson/7>.24){say('顺着它的弧度，陪他慢慢来。');return;}
    c.lesson=Math.max(c.lesson,near.t*7);if(c.lesson>6.85)c.lesson=7;if(c.lesson===7)say('现在松开手，让阿禾收好最后一段。');
   }else{lift=clamp((g.start[1]-q[1])/55);if(Math.abs(q[0]-g.start[0])>65)lift=0;}
   paint();save();
  };
  el.onpointerup=e=>{if(g?.id===e.pointerId)finish();};
  el.onpointercancel=e=>{if(g?.id===e.pointerId)finish(true);};
  el.onlostpointercapture=e=>{if(g?.id===e.pointerId)finish(true);};
  el.onkeydown=e=>{
   if(!['ArrowUp','ArrowRight','ArrowLeft','ArrowDown','Enter',' '].includes(e.key))return;e.preventDefault();
   if((p==='lift'||p==='check')&&e.key==='ArrowUp')lift=clamp(lift+.25);
   if(p==='wire'&&e.key==='ArrowRight')c.wrap=Math.min(16,c.wrap+1);
   if(p==='smooth'&&e.key==='ArrowRight')c.repairedSmooth=Math.min(8,c.repairedSmooth+1);
   if(p==='teach'&&e.key==='ArrowRight')c.lesson=Math.min(7,c.lesson+1);
   paint();save();if((p==='lift'||p==='check')?lift>=1:p==='teach'?['Enter',' '].includes(e.key):true)finish();else if(c.lesson>=7)say('按回车松手，让阿禾收好最后一段。');
  };
  paint();
  const blur=()=>{if(g)finish(true);};window.addEventListener('blur',blur);
  return ()=>{alive=false;g=null;window.removeEventListener('blur',blur);el.onpointerdown=el.onpointermove=el.onpointerup=el.onpointercancel=el.onlostpointercapture=el.onkeydown=null;};
 }
 return {title,html,mount};
})();
