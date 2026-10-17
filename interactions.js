/* 自包含工艺交互；状态仍由主程序保存。坐标为400×300工艺画布。 */
window.CraftInteractions = (() => {
 const kinds=['bend','cloth','paint','order','repair','teach'];
 const defaults=()=>({arc:0,laid:false,smooth:0,ink:0,paintStrokes:[],order:[null,null,null,null],ordered:false,inspected:false,wirePlaced:false,wrap:0,repairedSmooth:0,verified:false,supported:false,lesson:0,taught:false});
 function restore(raw={}){const s={...defaults(),...raw};for(const [k,max] of Object.entries({arc:8,smooth:8,ink:5,wrap:16,repairedSmooth:8,lesson:8}))s[k]=Math.max(0,Math.min(max,Number(s[k])||0));for(const k of ['laid','ordered','inspected','wirePlaced','verified','supported','taught'])s[k]=s[k]===true;s.paintStrokes=Array.isArray(raw.paintStrokes)?raw.paintStrokes.slice(0,600).filter(Array.isArray).map(line=>line.slice(0,2000).filter(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=140&&p[0]<=260&&p[1]>=55&&p[1]<=255)).filter(p=>p.length):[];const seen=new Set();s.order=Array.from({length:4},(_,i)=>{const v=raw.order?.[i];if(Number.isInteger(v)&&v>=0&&v<4&&!seen.has(v)){seen.add(v);return v;}return null;});return s;}
 const done=(k,s)=>k==='bend'?s.bones>=3:k==='cloth'?s.cloth:k==='paint'?!!s.pattern&&s.craft.ink>=5:k==='order'?s.craft.ordered:k==='repair'?s.craft.verified:k==='teach'?s.craft.taught:false;
 const ribPaths=MinigameArt.ribs;
 const clothPaths=MinigameArt.creases;
 const tools=['竹篾','细铁丝','棉布','画笔'];
 function icon(i){return `<image href="assets/optimized/minigames/${['bamboo-bundle','wire-coil','cotton-cloth','brush'][i]}.webp" x="5" y="4" width="90" height="72"/>`;}
 const svg=(body)=>`<svg viewBox="0 0 400 300" class="work-svg" aria-hidden="true">${body}</svg>`;
 const path=(pts)=>{if(!pts.length)return '';let d='M'+pts[0].join(' ');for(let i=1;i<pts.length;i++){const a=pts[i-2]||pts[i-1],b=pts[i-1],c=pts[i],e=pts[i+1]||c;d+='C'+[b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6,c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6,...c].join(' ');}return d;};
 const hand=(x,y,flip=1)=>`<g transform="translate(${x} ${y}) scale(${flip} 1)" fill="none" stroke="#dcc69f" stroke-width="4" stroke-linecap="round"><path d="M-42 22L-20 1q7-9 18-2l18 12q6 6-2 8l-21-9M-25 30q20-10 43-7"/></g>`;
 function surface(body,overlay=''){return `<div class="work-surface">${svg(body)}${overlay}</div>`;}
 function traceMarker(label){return `<button class="craft-point trace-point" data-point="0" aria-label="${label}：沿线滑动，也可轻点亮处">·</button>`;}
 function traceArt(strokes,progress,max,color='#f0ce8c',width=6){return strokes.map((d,i)=>{const p=Math.max(0,Math.min(1,progress/max*strokes.length-i));return `<path class="trace-guide" data-trace="${i}" d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4 6" opacity=".4"/><path data-trace-fill="${i}" d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1-p}" opacity="${p?1:0}"/>`;}).join('');}
 const frame=MinigameArt.frame;
 const creases=MinigameArt.wrinkles;
 const drawing=LanternPainting.drawing;
 function fabricTarget(){const f=MinigameArt.clothFace;return `<button class="fabric-target" data-drop="cloth" aria-label="将棉布覆到灯架" style="left:${f.x/4}%;top:${f.y/3}%;width:${f.width/4}%;height:${f.height/3}%"><svg viewBox="${f.x} ${f.y} ${f.width} ${f.height}" aria-hidden="true"><path class="fabric-outline" d="${f.path}"/></svg><span>覆上<br>灯面</span></button>`;}
 function title(k,s){if(['repair','teach'].includes(k))return EndingGestures.title(k,s);const c=s.craft;if(done(k,s))return {bend:'灯骨已立',cloth:'布面平展了',paint:PATTERNS[s.pattern||'兰草'].wish,order:'记得工序，也记得其中的用心',repair:'灯架稳了，可以放心交到别人手里',teach:'最后这一小段，让孩子自己来'}[k];return k==='bend'?`沿亮点慢慢弯篾 · 第${s.bones+1}根`:k==='cloth'?(c.laid?'顺着亮点，从中间向两边抚平':'将薄棉布覆到灯架上'):k==='paint'?(s.pattern?'按住灯面涂抹，画出自己的心愿':'选一枝花草，再亲手描上灯面'):k==='order'?'把四样工具，按制灯的先后排好':k==='repair'?(c.inspected?'看看歪斜的灯骨与布面，找出要修整的地方':'先提起灯，试一试是否稳当'):c.supported?(c.lesson>=7?'松开手，把最后一步留给孩子':'顺着弧线慢慢来，让孩子跟上你的手'):'先扶住一端，再陪孩子慢慢弯';}
 function html(k,s,art){if(['repair','teach'].includes(k))return EndingGestures.html(k,s,{frame,path,hand,creases,...art});const c=s.craft;let body='';
 if(k==='bend')body=surface(`<g opacity="${s.bones<3?.22:1}">${frame({...s,bones:3})}</g>${ribPaths.slice(0,s.bones<3?s.bones:0).map(d=>`<path d="${d}" fill="none" stroke="#dfbd7d" stroke-width="5"/>`).join('')}${s.bones<3?traceArt([ribPaths[s.bones]],c.arc,8):''}`,s.bones<3?traceMarker('弯篾'):'');
 if(k==='cloth')body=surface(frame(s,c.laid)+(c.laid?creases(s.cloth?8:c.smooth):'')+(c.laid&&!s.cloth?traceArt(clothPaths,c.smooth,8,'#8d663d',2):''),!c.laid?`<button class="work-item fabric" aria-label="选择棉布" data-drag="cloth"><svg viewBox="0 0 100 80">${icon(2)}</svg><span>棉布</span></button>${fabricTarget()}`:!s.cloth?traceMarker('抚布'):'');
 if(k==='paint')body=surface(frame(s,true)+ (s.pattern?drawing(s,art.motif):''),s.pattern&&!done(k,s)?LanternPainting.overlay():'')+(!s.pattern?`<div class="work-palette">${Object.keys(PATTERNS).map(p=>`<button data-pick="${p}">${p}</button>`).join('')}</div>`:'');
 if(k==='order')body=`<div class="order-work"><div class="order-tools">${[2,0,3,1].map(i=>`<button class="order-tool" data-tool="${i}" aria-label="选择${tools[i]}" ${c.order.includes(i)||c.ordered?'disabled':''}><svg viewBox="0 0 100 80">${icon(i)}</svg>${tools[i]}</button>`).join('')}</div><div class="order-slots">${c.order.map((v,i)=>`<button data-slot="${i}" aria-label="工序位置${i+1}" ${c.ordered?'disabled':''}><span>${['一','二','三','四'][i]}</span>${v===null?'放入工具':`<svg viewBox="0 0 100 80">${icon(v)}</svg>${tools[v]}`}</button>`).join('')}</div><div class="order-preview" aria-live="polite">${c.order.map(v=>v===null?'○':['骨','结','布','纹'][v]).join('　→　')}</div>${!c.ordered?'<span class="input-note">把工具拖到下方，放错可交换</span>':''}</div>`;
 return `<section class="enhanced-work" data-work="${k}">${body}<p class="work-feedback" aria-live="polite"></p>${['bend','cloth','paint','teach'].includes(k)&&!done(k,s)?`<span class="input-note">${k==='paint'?'按住涂抹，松手可接着画':k==='cloth'&&!c.laid?'将棉布拖入虚线，也可先选布再点灯面':'可拖动，也可依次轻点亮点'}</span>`:''}</section>`;
 }
 function mount(k,ctx){if(['repair','teach'].includes(k))return EndingGestures.mount(k,ctx);const {state:s,save,render,chime,art}=ctx,c=s.craft;let selected=null,cleanup=[];const q=sel=>document.querySelector(sel),say=text=>{const f=q('.work-feedback');if(f)f.textContent=text;},commit=()=>{save();chime(587);render();};
 function trace(field,max,onDone){
  const surface=q('.work-surface'),marker=surface?.querySelector('[data-point]');if(!marker)return;
  // The visible SVG paths are also the input paths, including their local transforms.
  const strokes=[...surface.querySelectorAll('[data-trace]')].map(el=>({el,length:el.getTotalLength()})),unit=max/strokes.length;
  let dragging=null;
  const locate=()=>{const i=Math.min(strokes.length-1,Math.floor((c[field]+1e-8)/unit));return {i,t:Math.max(0,Math.min(1,(c[field]-i*unit)/unit)),...strokes[i]};};
  function paint(){
   const current=locate(),p=current.el.getPointAtLength(current.length*current.t),matrix=current.el.getScreenCTM();if(!matrix)return;
   const screen=new DOMPoint(p.x,p.y).matrixTransform(matrix),r=surface.getBoundingClientRect();
   marker.style.left=`${screen.x-r.left}px`;marker.style.top=`${screen.y-r.top}px`;marker.dataset.point=Math.floor(c[field]);marker.classList.toggle('paint-mark',field==='ink');
   strokes.forEach(({el},i)=>{const t=Math.max(0,Math.min(1,c[field]/unit-i));el.setAttribute('opacity',i===current.i?'.8':'.18');el.dataset.active=String(i===current.i);const fill=surface.querySelector(`[data-trace-fill="${i}"]`);fill.setAttribute('stroke-dashoffset',String(1-t));fill.setAttribute('opacity',String(field==='smooth'?0:t>0?1:0));});
   surface.querySelectorAll('.crease').forEach((el,j)=>el.setAttribute('opacity',String(.75*(1-Math.max(0,Math.min(1,(c[field]-j*4)/4))))));
   surface.querySelector('.ink-progress')?.setAttribute('opacity',String(.18+.82*c[field]/5));
   if(field==='smooth'){MinigameArt.updateWrinkles(surface,c[field]);strokes.forEach(({el},i)=>{el.setAttribute('pathLength','1');el.setAttribute('stroke-dasharray','1');el.setAttribute('stroke-dashoffset',String(-Math.max(0,Math.min(1,c[field]/unit-i))));});q('.interaction-note').textContent=c[field]<4?'从亮处向左抚平这一道皱褶':'从亮处向右抚平另一道皱褶';}
  }
  function release(){const g=dragging;dragging=null;if(g&&surface.hasPointerCapture(g.id))surface.releasePointerCapture(g.id);}
  function advance(value){c[field]=Math.min(max,value);save();if(c[field]>=max){release();onDone();}else paint();}
  const step=()=>advance(Math.min(max,Math.floor(c[field]+1e-6)+1));
  marker.onclick=e=>{if(e.detail===0)step();};
  surface.onpointerdown=e=>{
   if(!e.isPrimary||e.button!==0||dragging)return;
   const {el,length,t}=locate(),p=el.getPointAtLength(length*t),screen=new DOMPoint(p.x,p.y).matrixTransform(el.getScreenCTM());
   if(Math.hypot(e.clientX-screen.x,e.clientY-screen.y)>26)return;
   e.preventDefault();dragging={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false,slop:e.pointerType==='touch'?10:5,tap:!!e.target.closest('[data-point]')};surface.setPointerCapture(e.pointerId);
  };
  surface.onpointermove=e=>{
   const g=dragging;if(!g||g.id!==e.pointerId)return;
   g.moved ||= Math.hypot(e.clientX-g.startX,e.clientY-g.startY)>g.slop;
   const current=locate(),matrix=current.el.getScreenCTM(),inverse=matrix.inverse(),p=new DOMPoint(e.clientX,e.clientY).matrixTransform(inverse),last=new DOMPoint(g.x,g.y).matrixTransform(inverse);
   const start=current.t*current.length,travel=Math.hypot(p.x-last.x,p.y-last.y),end=Math.min(current.length,start+Math.min(current.length*.18,Math.max(12,travel*1.8)));
   g.x=e.clientX;g.y=e.clientY;
   let best=start,distance=Infinity;
   // Project onto nearby segments; a local window prevents jumping across thin or closed ribs.
   const count=Math.max(1,Math.ceil((end-start)/2));let a=current.el.getPointAtLength(start);
   for(let j=1;j<=count;j++){
    const lo=start+(end-start)*(j-1)/count,hi=start+(end-start)*j/count,b=current.el.getPointAtLength(hi),dx=b.x-a.x,dy=b.y-a.y;
    const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
    if(d<distance){distance=d;best=lo+(hi-lo)*t;}a=b;
   }
   const tolerance=18/Math.hypot(matrix.a,matrix.b);
   if(distance>tolerance){say('回到亮处，接着慢慢来。');return;}
   if(best<=start+1e-5)return;
   say('');const endpoint=current.el.getPointAtLength(current.length);
   // Finish in screen pixels so a finger need not hit a subpixel SVG endpoint.
   const scale=Math.hypot(matrix.a,matrix.b),endRadius=12/scale;
   const finished=best>=current.length*.85&&Math.hypot(p.x-endpoint.x,p.y-endpoint.y)<=endRadius;
   if(finished){release();advance(Math.min(max,(current.i+1)*unit));}
   else advance(current.i*unit+best/current.length*unit);
  };
  const stop=e=>{const g=dragging;if(!g||g.id!==e.pointerId)return;release();if(e.type==='pointerup'&&!g.moved&&g.tap)step();else save();};
  surface.onpointerup=stop;surface.onpointercancel=stop;surface.onlostpointercapture=stop;
  const resize=new ResizeObserver(paint);resize.observe(surface);paint();
  cleanup.push(()=>{release();resize.disconnect();});
 }
 function dragDrop(el,onDrop,onClick){let gesture=null,suppress=false;el.onclick=()=>{if(suppress){suppress=false;return;}onClick?.();};el.onpointerdown=e=>{if(!e.isPrimary||e.button!==0||gesture)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};el.setPointerCapture(e.pointerId);};el.onpointermove=e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture.moved ||= Math.hypot(dx,dy)>8;if(gesture.moved){el.style.transform=`translate(${dx}px,${dy}px)`;el.style.zIndex=8;}};el.onpointerup=e=>{if(!gesture||gesture.id!==e.pointerId)return;const moved=gesture.moved;gesture=null;el.style.transform='';el.style.zIndex='';if(moved){suppress=true;onDrop(e.clientX,e.clientY);}};const stop=()=>{gesture=null;el.style.transform='';el.style.zIndex='';};el.onpointercancel=stop;el.onlostpointercapture=stop;cleanup.push(stop);}
 const inside=(el,x,y)=>{const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;};
 if(k==='bend'&&s.bones<3)trace('arc',8,()=>{s.bones++;c.arc=0;commit();});
 if(k==='cloth'&&!s.cloth){if(!c.laid){const material=q('[data-drag]'),target=q('[data-drop]'),outline=target.querySelector('.fabric-outline');const onFace=(x,y)=>outline.isPointInFill(new DOMPoint(x,y).matrixTransform(outline.getScreenCTM().inverse()));function place(){c.laid=true;commit();}dragDrop(material,(x,y)=>{if(onFace(x,y))place();else say('把棉布放到灯架上，再慢慢抚平。');},()=>{selected='cloth';material.classList.add('selected');say('再轻点灯架，覆上棉布。');});target.onclick=e=>{if(e.detail!==0&&!onFace(e.clientX,e.clientY))return;if(selected)place();else say('先拿起左侧的棉布。');};}else trace('smooth',8,()=>{s.cloth=true;commit();});}
 if(k==='paint'){document.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{s.pattern=b.dataset.pick;c.ink=0;c.paintStrokes=[];commit();});if(s.pattern&&c.ink<5)cleanup.push(LanternPainting.mount(ctx));}
 if(k==='order'&&!c.ordered){function select(v,from=null){selected={v,from};document.querySelectorAll('[data-tool],[data-slot]').forEach(b=>b.classList.remove('selected'));q(from===null?`[data-tool="${v}"]`:`[data-slot="${from}"]`)?.classList.add('selected');say(`拿起${tools[v]}，放到你认为合适的位置。`);}function place(i){if(!selected){if(c.order[i]!==null)select(c.order[i],i);return;}const {v,from}=selected,old=c.order[i];if(from!==null)c.order[from]=old;c.order[i]=v;c.ordered=c.order.every((v,j)=>v===j);save();render();}const slots=[...document.querySelectorAll('[data-slot]')];document.querySelectorAll('[data-tool]').forEach(b=>dragDrop(b,(x,y)=>{const i=slots.findIndex(el=>inside(el,x,y));if(i>=0){selected={v:+b.dataset.tool,from:null};place(i);}},()=>select(+b.dataset.tool)));slots.forEach(b=>{dragDrop(b,(x,y)=>{const from=+b.dataset.slot;if(c.order[from]===null)return;const i=slots.findIndex(el=>inside(el,x,y));if(i>=0){selected={v:c.order[from],from};place(i);}},()=>place(+b.dataset.slot));});if(c.order.every(v=>v!==null)&&!c.ordered){const bad=c.order.findIndex((v,i)=>v!==i);say(['先立灯骨，才有地方覆布。','先把接口扎稳，再往下做。','先有灯面，画笔才能落下去。','最后再给灯面添一枝花草。'][bad]);}
 }
 const onBlur=()=>cleanup.forEach(fn=>fn());window.addEventListener('blur',onBlur,{once:true});return()=>{cleanup.forEach(fn=>fn());window.removeEventListener('blur',onBlur);};
 }
 return {kinds,defaults,restore,done,title,html,mount};
})();


