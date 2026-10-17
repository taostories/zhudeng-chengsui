(() => {
 'use strict';
 const $=s=>document.querySelector(s), app=$('#app'), panorama=$('#panorama'), scenery=$('#scenery');
 const KEY='zhudeng-chengsui-v1', numerals=['一','二','三','四'];
 const fresh=()=>({craft:CraftInteractions.defaults(),version:6,index:0,maxChapter:0,completed:false,bones:0,knots:[],cloth:false,pattern:'',visited:[],pan:0,villageDragged:false,fireLit:false,passed:false});
 let state=fresh(),hasSave=false,entered=false,mode='cover',scene='',lampTalk=null,selected=false,sound=false,audio=null,gesture=null,drag=null,disposeWork=null;
 try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&Number.isInteger(s.index)&&s.index>=0&&[undefined,2,3].includes(s.version)){const bounds=s.version===3?[19,41,49]:s.version===2?[8,30,38]:[9,28,37];const chapter=s.index<bounds[0]?0:s.index<bounds[1]?1:s.index<bounds[2]?2:3;s.index=STORY.findIndex(n=>n.chapter===chapter);s.version=6;s.craft=CraftInteractions.defaults();s.passed=false;if(chapter<=1){s.bones=0;s.knots=[];s.cloth=false;s.pattern='';}}if(s&&s.version===4&&Number.isInteger(s.index)&&s.index>=0&&s.index<76){s.index=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,64,65,66,67,49,68,71,72,73,74,75,76,77,78,79][s.index];s.version=5;}if(s&&s.version===5&&Number.isInteger(s.index)&&s.index>=0&&s.index<80){s.index=STORY.findIndex(n=>n.id===`v5-${s.index}`);s.version=6;}if(s?.version===6&&typeof s.nodeId==='string'){const i=STORY.findIndex(n=>n.id===s.nodeId);if(i>=0)s.index=i;}if(s&&s.version===6&&Number.isInteger(s.index)&&s.index>=0&&s.index<STORY.length){state={...fresh(),...s};state.craft=CraftInteractions.restore(s.craft);state.bones=Math.max(0,Math.min(3,Number(state.bones)||0));state.knots=Array.isArray(s.knots)?[...new Set(s.knots.filter(x=>Number.isInteger(x)&&x>=0&&x<4))]:[];state.visited=Array.isArray(s.visited)?[...new Set(s.visited.filter(x=>Number.isInteger(x)&&x>=0&&x<4))]:[];state.pattern=Object.hasOwn(PATTERNS,s.pattern)?s.pattern:'';state.maxChapter=Math.max(STORY[state.index].chapter,Math.min(3,Number(s.maxChapter)||0));state.pan=Math.max(0,Math.min(1,Number(s.pan)||0));state.passed=s.passed===true;state.completed=s.completed===true||STORY[state.index].type==='ending';if(state.completed)state.maxChapter=3;hasSave=true;}}catch{}
 const save=()=>{if(STORY[state.index].type==='ending'){state.completed=true;state.maxChapter=3;}state.version=6;state.nodeId=STORY[state.index].id;hasSave=true;try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
 const node=()=>STORY[state.index];
 function chime(note=523){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=note;g.gain.setValueAtTime(.0001,audio.currentTime);g.gain.exponentialRampToValueAtTime(.08,audio.currentTime+.015);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.7);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.75);}catch{}}
 function setScene(value){if(scene!==value){scene=value;document.body.dataset.scene=value;panorama.style.backgroundImage=ART[value]?`url('${ART[value]}')`:'none';panorama.querySelectorAll('.festival-lamp').forEach(e=>e.remove());}applyPan();}
 function applyPan(){const max=Math.max(0,panorama.offsetWidth-innerWidth);panorama.style.transform=`translateX(${-max*state.pan}px)`;fireworks.setPan(-max*state.pan);document.documentElement.style.setProperty('--pan',state.pan);$('.pan-control.left')?.toggleAttribute('disabled',state.pan<=0);$('.pan-control.right')?.toggleAttribute('disabled',state.pan>=1);}
 function changePan(by){state.pan=Math.max(0,Math.min(1,state.pan+by));if(node().kind==='village')state.villageDragged=true;applyPan();updateExplore();save();}
 function browsePan(direction){const distance=Math.max(1,panorama.offsetWidth-innerWidth);changePan(direction*Math.min(.24,innerWidth*.65/distance));}
 function goNext(){if(mode!=='story')return;if(lampTalk){lampTalk.line++;if(lampTalk.line>1){if(!state.visited.includes(lampTalk.id))state.visited.push(lampTalk.id);lampTalk=null;save();render();}else{const l=LAMPS[lampTalk.id];$('.dialogue .speaker').textContent='祖父';$('.dialogue p').textContent=l.grandpa;$('.dialogue .next').innerHTML='继续赏灯 <span aria-hidden="true">→</span>';}return;}if(node().type==='action'&&!isDone(node().kind))return;state.index=Math.min(STORY.length-1,state.index+1);state.maxChapter=Math.max(state.maxChapter,node().chapter);selected=false;state.pan=0;save();chime(440);render();}
 function isDone(kind){if(CraftInteractions.kinds.includes(kind))return CraftInteractions.done(kind,state);return kind==='village'?state.villageDragged&&state.fireLit:kind==='bend'?state.bones>=3:kind==='bind'?state.knots.length===4:kind==='cloth'?state.cloth:kind==='paint'?!!state.pattern:kind==='festival'?state.visited.length===4:kind==='pass'?state.passed:false;}
 function storyText(text){const pattern=state.pattern||'兰草';return text.replaceAll('{所绘心愿}',PATTERNS[pattern].line).replaceAll('{纹样}',pattern);}
 function passLamp(){return `<div class="craft-stage active pass-stage${state.passed?' is-received':''}"><div class="craft-board"><img class="receiving-child" src="assets/characters/ahe.png" alt="阿禾在右侧等着接灯" draggable="false">${state.passed?`<div class="received-lamp">${lanternSVG('craft',4,state.pattern||'兰草')}</div>`:`<button class="material pass-material" aria-label="把竹灯向右滑，递给阿禾，也可点击选中">${lanternSVG('craft',4,state.pattern||'兰草')}</button><button class="drop-zone pass-target" aria-label="把灯交到阿禾手中"></button><span class="pass-direction" aria-hidden="true">→</span>`}</div></div>`;}
 function progress(){const list=['立骨','固形','蒙布','绘纹'];let k=state.pattern?4:state.cloth?3:state.knots.length===4?2:state.bones===3?1:0;return `<div class="progress-steps">${list.map((l,i)=>`<span class="${i<k?'done':i===k?'current':''}">${i<k?'· ':''}${l}</span>`).join('')}</div>`;}
 const motif=LanternPainting.motif;
 function lanternSVG(type='craft',stage=4,pattern=state.pattern){
 if(type!=='craft')return MinigameArt.festival(type);
 const art=stage>=4&&pattern?`<g transform="translate(85 -3)">${motif(pattern)}</g>`:'';
 const lit=node().chapter>=2;
 return `<svg viewBox="0 0 224 350" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(-128 0) scale(1.2)">${MinigameArt.frame(state,stage>=4,art,lit)}</g></svg>`;
 }
 function dialogue(who,text,next='继续'){
 const narrative=who==='旁白',canPrev=!lampTalk&&state.index>0&&STORY[state.index-1].type==='line'&&STORY[state.index-1].chapter===node().chapter;
 const heading=narrative?'':`<div class="dialogue-top"><span class="speaker">${who}</span></div>`;
 const person=who==='祖父'?'grandfather':who==='我'?(node().chapter<3?'childhood':'adult'):who==='阿禾'?'ahe':null;
 const side=node().portraitSide||(person==='adult'||(person==='grandfather'&&node().chapter<3)?'left':'right');
 const portrait=!narrative&&!lampTalk&&person?`<img class="speaker-portrait portrait-${side}${person==='grandfather'&&node().chapter===3?' portrait-mirrored':''}" data-person="${person}" src="assets/characters/${person}.png" alt="" aria-hidden="true" draggable="false">`:'';
 return `<section class="dialogue${narrative?' narration':''}" aria-label="${narrative?'剧情文字':'剧情对话'}">${portrait}<div class="dialogue-panel">${heading}<p aria-live="polite">${text}</p><div class="dialogue-actions"><button class="prev" ${canPrev?'':'disabled'}>上一句</button><button class="next">${next} <span aria-hidden="true">→</span></button></div></div></section>`;
 }

 function craft(active){const k=node().kind;const stage=state.cloth?4:state.bones;let controls='';
 if(active&&!isDone(k)){
 if(k==='bend'||k==='cloth'){controls=`<button class="material" data-label="${k==='bend'?'竹篾':'棉布'}" aria-label="${k==='bend'?'拖拽竹篾到灯架，或点击选中':'拖拽棉布到灯架，或点击选中'}">${k==='bend'?'<svg viewBox="0 0 110 90"><path id="bending-strip" d="M12 80Q50 45 98 10" fill="none" stroke="#d0af6c" stroke-width="7"/><path d="M12 80Q50 45 98 10" fill="none" stroke="#f0d49b" stroke-width="1"/></svg>':'<svg viewBox="0 0 110 90"><path d="M8 18Q50 2 101 15L99 76Q50 64 10 80Z" fill="#e6d6b7" stroke="#bba77f"/><path d="M23 20L24 65M35 20L37 66M48 19L50 66M61 18L63 66M75 19L76 67M87 20L88 68" stroke="#c3b89c" stroke-width=".8"/></svg>'}</button><button class="drop-zone" aria-label="灯架放置区">${k==='bend'?'弯入灯骨':'覆上棉布'}</button>`;}
 if(k==='bind')controls=MinigameArt.knots.map(([x,y])=>[(x*1.2-128)/224*100,y*1.2/350*100]).map(([x,y],i)=>`<button class="knot ${state.knots.includes(i)?'bound':''}" data-knot="${i}" style="--x:${x}%;--y:${y}%" aria-label="绑定第${i+1}处接口" ${state.knots.includes(i)?'disabled':''}>${state.knots.includes(i)?'✓':'＋'}</button>`).join('');
 if(k==='paint')controls=`<div class="pattern-palette">${['兰草','梅花','竹叶'].map(p=>`<button data-pattern="${p}">${p}</button>`).join('')}</div>`;
 }
 return `<div class="craft-stage ${active?'active':''}"><div class="craft-board"><div class="craft-lantern">${lanternSVG('craft',stage)}${k==='bind'?controls:''}</div>${k==='bind'?'':controls}<div class="craft-status">${active?(k==='bend'?`${state.bones} / 3`:k==='bind'?`${state.knots.length} / 4`:k==='cloth'?'棉布覆灯':'花草寄愿'):''}</div>${active&&k!=='paint'?progress():''}</div></div>`;
 }
 function setupLamps(){panorama.querySelectorAll('.festival-lamp').forEach(e=>e.remove());const types=['round','square','butterfly','rose'];LAMPS.forEach((l,i)=>{const b=document.createElement('button');b.className='festival-lamp'+(state.visited.includes(i)?' seen':'');b.style.left=[12,36,61,86][i]+'%';b.style.animationDelay=-i+'s';b.dataset.label=l.name+(state.visited.includes(i)?' · 已赏':'');b.setAttribute('aria-label',l.name);b.innerHTML=lanternSVG(types[i],4,'');b.disabled=!!lampTalk||mode!=='story'||node().kind!=='festival';b.onclick=()=>{lampTalk={id:i,line:0};chime(660);render();};panorama.append(b);});}
 function render(){disposeWork?.();disposeWork=null;
 if(mode!=='story'||node().kind!=='village')fireworks.reset();
 document.body.classList.toggle('lamp-detail',mode==='story'&&!!lampTalk);
 document.body.dataset.mode=mode;$('#chapters-button').disabled=false;$('#chapters-button').hidden=!entered||!state.completed;
 if(mode==='cover'){
  setScene('cover');$('#chapter-label').textContent='';
  const resume=entered&&hasSave&&(state.index>0||state.completed);
  app.innerHTML=`<section class="cover"><h1 class="calligraphy-title"><img src="assets/title-calligraphy.png" alt="竹灯承岁" draggable="false"></h1><p>一灯承岁，灯火相传。</p><div class="cover-actions"><button id="begin" class="primary">${resume?'续上灯火':'从头读起'} <span aria-hidden="true">→</span></button></div></section>`;
  $('#begin').onclick=()=>{if(!entered){state=fresh();entered=true;lampTalk=null;selected=false;}else if(state.completed){openChapters();return;}mode='story';save();render();chime();};return;
 }
 const n=node();$('#chapter-label').textContent=`卷${numerals[n.chapter]} · ${CHAPTERS[n.chapter]}`;setScene(n.type==='ending'?'cover':n.scene||['village','workshop','festival','legacy'][n.chapter]);
 if(n.type==='ending'){app.innerHTML=`<section class="end-screen"><div class="end-lamp">${lanternSVG('craft',4,state.pattern||'兰草')}</div><h1 class="calligraphy-title"><img src="assets/title-calligraphy.png" alt="竹灯承岁" draggable="false"></h1><p>${PATTERNS[state.pattern||'兰草'].wish}。<br>这一盏送出了门，下一盏等着一起做。</p><button class="primary" id="return-home">合卷 · 留灯</button></section>`;$('#return-home').onclick=()=>{mode='cover';render();};return;}
 const active=n.type==='action';let content=n.time?`<section class="time-caption" aria-label="故事时间"><h2>${n.time.title}</h2><p>${n.time.detail}</p></section>`:'';
 if(active&&CraftInteractions.kinds.includes(n.kind))content+=CraftInteractions.html(n.kind,state,{motif});else if(n.chapter===1&&!n.time&&n.showCraft!==false)content+=craft(active);
 if(n.kind==='pass')content+=passLamp();
 if(!active)content+=dialogue(n.who,storyText(n.text),state.index+1<STORY.length&&STORY[state.index+1].chapter!==n.chapter?'展开下一卷':'继续');
 else if(lampTalk){const l=LAMPS[lampTalk.id];content+=`<div class="lamp-focus" aria-hidden="true"><div class="lamp-focus-art">${MinigameArt.festival(['round','square','butterfly','rose'][lampTalk.id],true)}</div></div>`;content+=dialogue(lampTalk.line?'祖父':'我',lampTalk.line?l.grandpa:l.me,lampTalk.line?'继续赏灯':'继续');}
 else{
 const tips={village:'左右拖动画面，轻点夜空放烟花',bend:'顺着竹篾的韧劲，慢慢弯入灯骨',bind:'轻点四处接口，把灯架扎稳',cloth:'将棉布拖到灯架，轻轻覆平',paint:'选一枝花草，放进自己的心愿',festival:'左右逛灯会，听听灯里的心愿',pass:'把竹灯向右滑，轻轻递到阿禾手中'};
 const done=isDone(n.kind),titles={village:'左右拖动画面，轻点夜空放烟花',bend:'灯骨已立',bind:'灯架已稳',cloth:'棉布已覆',paint:PATTERNS[state.pattern||'兰草'].wish,festival:'四灯已赏，心有归处',pass:'灯柄握稳了，灯火有了接续'};
 content+=`<div class="interaction-note${n.kind==='village'?' village-hint':''}" aria-live="polite">${CraftInteractions.kinds.includes(n.kind)?CraftInteractions.title(n.kind,state):done?titles[n.kind]:tips[n.kind]}</div>`;
 if(n.kind==='village'||n.kind==='festival')content+='<button class="pan-control left" aria-label="向左浏览">‹</button><button class="pan-control right" aria-label="向右浏览">›</button><div class="scroll-track" aria-hidden="true"></div>';
 content+=`<div class="action-footer">${n.kind==='festival'?`<span id="visited-count">${state.visited.length} / 4</span>`:''}<button class="primary action-next" ${done?'':'hidden'}>${n.kind==='village'?'回家扎灯':n.kind==='festival'?'提灯归去':n.kind==='pass'?'灯火相传':'听祖父说'} →</button>${n.kind==='village'?'<button class="secondary" id="sky-fire">点亮烟花</button>':''}</div>`;
 }
 app.innerHTML=content;
 const portrait=$('.speaker-portrait');
 if(portrait){
  const fitPortrait=()=>{const d=$('.dialogue');if(!d||!portrait.isConnected)return;const panel=d.querySelector('.dialogue-panel'),upper=Math.max($('header').getBoundingClientRect().bottom,$('#chapter-label').getBoundingClientRect().bottom)+12,tuck=Math.min(24,Math.max(10,innerHeight*.03));const available=d.getBoundingClientRect().top-upper+tuck,desired=Math.min(innerHeight*(innerWidth<=700?.46:.54),innerWidth<=700?380:500)*(['grandfather','adult'].includes(portrait.dataset.person)?1.1:1),height=Math.max(0,Math.min(desired,available,d.clientWidth*1.08));portrait.style.height=`${height}px`;const left=portrait.classList.contains('portrait-left'),edges={grandfather:[38,37],childhood:[37,37],adult:[22,23],ahe:[31,31]},edge=edges[portrait.dataset.person][(left!==portrait.classList.contains('portrait-mirrored'))?0:1]*height/900;d.style.setProperty('--portrait-tuck',`${tuck}px`);d.style.setProperty('--portrait-edge',`${edge}px`);d.style.setProperty('--panel-inset',getComputedStyle(panel).paddingLeft);};
  const observer=new ResizeObserver(fitPortrait);observer.observe($('.dialogue'));observer.observe(app);$('.dialogue').addEventListener('animationend',fitPortrait);fitPortrait();disposeWork=()=>observer.disconnect();
 }
 if(lampTalk){
  const fit=()=>{const d=$('.dialogue'),focus=$('.lamp-focus');if(!d||!focus)return;const paragraph=d.querySelector('p'),text=paragraph.textContent,l=LAMPS[lampTalk.id];paragraph.style.minHeight='';paragraph.textContent=l.me;const first=paragraph.getBoundingClientRect().height;paragraph.textContent=l.grandpa;const second=paragraph.getBoundingClientRect().height;paragraph.textContent=text;paragraph.style.minHeight=`${Math.max(first,second)}px`;focus.style.setProperty('--focus-bottom',`${innerHeight-d.getBoundingClientRect().top+16}px`);focus.style.setProperty('--focus-top',`${Math.max($('header').getBoundingClientRect().bottom+12,innerWidth<=700?102:72)}px`);};
  const observer=new ResizeObserver(fit);observer.observe($('.dialogue'));observer.observe(app);fit();disposeWork=()=>observer.disconnect();
  $('.next')?.focus({preventScroll:true});
 }
 if(n.chapter===2)setupLamps();
 $('.next')?.addEventListener('click',goNext);$('.prev')?.addEventListener('click',()=>{state.index--;save();render();});$('.action-next')?.addEventListener('click',goNext);
 $('.pan-control.left')?.addEventListener('click',()=>browsePan(-1));$('.pan-control.right')?.addEventListener('click',()=>browsePan(1));
 $('#sky-fire')?.addEventListener('click',()=>lightFire(innerWidth*.55,innerHeight*.25));
 $('[data-pattern]')&&document.querySelectorAll('[data-pattern]').forEach(b=>b.onclick=()=>{state.pattern=b.dataset.pattern;save();chime(784);render();});
 document.querySelectorAll('[data-knot]').forEach(b=>b.onclick=()=>{const i=+b.dataset.knot;if(!state.knots.includes(i))state.knots.push(i);save();chime(587);render();});
 if(active&&CraftInteractions.kinds.includes(n.kind))disposeWork=CraftInteractions.mount(n.kind,{state,save,render,chime,art:{motif}});else setupDrag();applyPan();
 }
 function updateExplore(){if(mode==='story'&&node().type==='action'&&!lampTalk){const done=isDone(node().kind);$('.action-next')?.toggleAttribute('hidden',!done);if(done&&node().kind==='village')$('.interaction-note').textContent='左右拖动画面，轻点夜空放烟花';}}
 function completeDrop(){const k=node().kind;if(k==='bend')state.bones=Math.min(3,state.bones+1);if(k==='cloth')state.cloth=true;if(k==='pass')state.passed=true;selected=false;save();chime(660);render();}
 function setupDrag(){const material=$('.material'),target=$('.drop-zone');if(!material||!target)return;
 material.onclick=()=>{if(drag?.moved)return;selected=!selected;material.classList.toggle('selected',selected);if(node().kind==='pass')return;const label=target.querySelector('span')||target;label.textContent=selected?'轻点这里放置':node().kind==='bend'?'弯入灯骨':node().kind==='pass'?'递给孩子':'覆上棉布';};
 target.onclick=()=>{if(selected)completeDrop();else{if(node().kind!=='pass')(target.querySelector('span')||target).textContent='先选左侧材料';material.focus();}};
 material.onpointerdown=e=>{if(e.button!==0||!e.isPrimary||drag)return;drag={x:e.clientX,y:e.clientY,moved:false,element:material,id:e.pointerId};material.setPointerCapture(e.pointerId);};
 material.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>7)drag.moved=true;material.style.transform=`translate(${dx}px,${dy}px)`;const path=$('#bending-strip');if(path)path.setAttribute('d',`M12 80Q${Math.max(-10,50-Math.abs(dx)*.5)} ${Math.max(0,45-Math.abs(dx)*.15)} 98 10`);};
 material.onpointerup=e=>{if(!drag||drag.id!==e.pointerId)return;const r=target.getBoundingClientRect(),moved=drag.moved;material.style.transform='';drag=null;if(moved){e.preventDefault();const success=e.clientX>=r.left-20&&e.clientX<=r.right+20&&e.clientY>=r.top-20&&e.clientY<=r.bottom+20;if(success)completeDrop();else{selected=false;render();}}};
 material.onpointercancel=()=>{drag=null;selected=false;render();};material.onlostpointercapture=()=>{if(drag){drag=null;material.style.transform='';}};
 }
 scenery.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||gesture||e.target.closest('button')||mode!=='story'||!['village','festival'].includes(node().kind)||lampTalk)return;gesture={x:e.clientX,y:e.clientY,pan:state.pan,moved:false,id:e.pointerId};scenery.setPointerCapture(e.pointerId);});
 scenery.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,max=panorama.offsetWidth-innerWidth;if(Math.abs(dx)>8){gesture.moved=true;state.pan=Math.max(0,Math.min(1,gesture.pan-dx/max));if(node().kind==='village')state.villageDragged=true;applyPan();updateExplore();}});
 scenery.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const moved=gesture.moved;gesture=null;if(!moved&&node().kind==='village'&&e.clientY<innerHeight*.62)lightFire(e.clientX,e.clientY);save();});
 scenery.addEventListener('pointercancel',e=>{if(gesture?.id===e.pointerId)gesture=null;});scenery.addEventListener('lostpointercapture',e=>{if(gesture?.id===e.pointerId)gesture=null;});
 window.addEventListener('blur',()=>{gesture=null;if(drag){drag.element.style.transform='';drag=null;}});
 window.addEventListener('resize',()=>{applyPan();fireworks.resize();});
 document.addEventListener('keydown',e=>{if($('#chapter-menu').open)return;if(mode==='story'&&node().type==='action'&&['village','festival'].includes(node().kind)&&!lampTalk){if(e.key==='ArrowLeft'){e.preventDefault();browsePan(-1);}if(e.key==='ArrowRight'){e.preventDefault();browsePan(1);}}if((e.key===' '||e.key==='Enter')&&e.target===document.body){e.preventDefault();if(mode==='story'&&(node().type==='line'||lampTalk))goNext();}});
 $('#brand').onclick=()=>{lampTalk=null;mode='cover';save();render();};
 $('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=`音效 ${sound?'开':'关'}`;$('#sound').setAttribute('aria-pressed',sound);$('#sound').setAttribute('aria-label',sound?'关闭音效':'开启音效');chime();};
 function openChapters(){if(!entered||!state.completed)return;const list=$('#chapter-list');list.innerHTML=CHAPTERS.map((c,i)=>`<button data-chapter="${i}" ${i>state.maxChapter?'disabled':''}>卷${numerals[i]}　${c}${i>state.maxChapter?'　· 未至':''}</button>`).join('');list.querySelectorAll('button').forEach(b=>b.onclick=()=>{const c=+b.dataset.chapter;state.index=STORY.findIndex(n=>n.chapter===c);state.pan=0;state.passed=false;state.craft=CraftInteractions.defaults();if(c<=1){state.bones=0;state.knots=[];state.cloth=false;state.pattern='';}if(c<=2)state.visited=[];if(c===0){state.fireLit=false;state.villageDragged=false;}lampTalk=null;mode='story';save();$('#chapter-menu').close();render();});$('#chapter-menu').showModal();}
 $('#chapters-button').onclick=openChapters;
 $('#close-menu').onclick=()=>$('#chapter-menu').close();$('#chapter-menu').onclick=e=>{if(e.target===$('#chapter-menu')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
 function fireworkSound(){
  if(!sound)return;
  try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();
   const length=Math.floor(audio.sampleRate*.65),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);
   for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2);
   const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=480;gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.16,audio.currentTime+.025);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.65);source.connect(filter);filter.connect(gain);gain.connect(audio.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }catch{}
 }
 const fireworks=VillageFireworks.create($('#fireworks'),fireworkSound);
 function lightFire(x,y){if(!fireworks.launch(x,y))return;state.fireLit=true;save();updateExplore();}
 render();
})();
