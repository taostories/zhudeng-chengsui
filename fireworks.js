/* Canvas-only effects: no generated images or external assets. */
window.VillageFireworks = (() => {
 function create(canvas,onBurst=()=>{}){
  const ctx=canvas.getContext('2d'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const palettes=[['#f6d992','#e9b966','#fff2cb'],['#efdcb1','#d8c6a3','#fff3d8'],['#de8b79','#edbb83','#f7d6a2']];
  let width=0,height=0,pan=0,shows=[],frame=0,last=0,serial=0,lastLaunch=-Infinity;
  const sprites=new Map(),skyMask=document.createElement('canvas');let skyDirty=true;
  // Foreground silhouette in the supplied 1938 x 811 village illustration.
  const skyline=[[0,168],[75,194],[158,214],[213,210],[226,205],[228,231],[300,280],[320,275],[345,307],[408,349],[455,324],[500,395],[545,409],[580,375],[630,390],[670,300],[710,313],[750,242],[790,300],[820,248],[860,300],[920,258],[970,307],[1010,342],[1040,405],[1090,348],[1180,407],[1220,437],[1300,445],[1380,430],[1450,440],[1530,434],[1600,418],[1700,390],[1740,366],[1800,300],[1840,340],[1890,300],[1938,300]];
  function skyGeometry(){const r=document.querySelector('#panorama').getBoundingClientRect(),scale=Math.max(r.width/1938,r.height/811);return {scale,left:r.left+(r.width-1938*scale)/2,top:r.top+(r.height-811*scale)/2};}
  function skyY(x,g=skyGeometry()){const sx=Math.max(0,Math.min(1938,(x-g.left)/g.scale));let i=1;while(i<skyline.length-1&&skyline[i][0]<sx)i++;const a=skyline[i-1],b=skyline[i];return g.top+(a[1]+(b[1]-a[1])*(sx-a[0])/(b[0]-a[0]))*g.scale;}
  function updateMask(){if(!skyDirty)return;skyDirty=false;skyMask.width=Math.ceil(width);skyMask.height=Math.ceil(height);const c=skyMask.getContext('2d'),g=skyGeometry();for(let x=0;x<width;x+=3){const y=skyY(x,g),fade=c.createLinearGradient(0,y-10,0,y+2);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#ffffff00');c.fillStyle=fade;c.fillRect(x,0,3,Math.max(0,y+2));}}
  function glow(color){if(sprites.has(color))return sprites.get(color);const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),fill=g.createRadialGradient(16,16,0,16,16,16);fill.addColorStop(0,color);fill.addColorStop(.15,color+'b0');fill.addColorStop(.4,color+'32');fill.addColorStop(1,color+'00');g.fillStyle=fill;g.fillRect(0,0,32,32);sprites.set(color,c);return c;}
  function reset(){if(frame)cancelAnimationFrame(frame);frame=0;shows=[];last=0;ctx.clearRect(0,0,width,height);canvas.dataset.phase='idle';}
  function resize(){reset();width=innerWidth;height=innerHeight;skyDirty=true;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function launch(x,y){
   const now=performance.now();if(document.hidden||now-lastLaunch<220||shows.length>=4)return false;
   lastLaunch=now;let radius=Math.min(195,width*.29,height*.22);const reduced=motion.matches;
   x=Math.max(radius*.7,Math.min(width-radius*.7,x));const horizon=skyY(x);radius=Math.min(radius,Math.max(38,(horizon-55)*.46));y=Math.max(radius+20,Math.min(height*.38,horizon-radius*.9-12,y));
   const type=serial++%3;
   shows.push({x:x-pan,y,originX:x-pan+(Math.random()-.5)*radius*.8,originY:Math.min(height*.64,y+height*.33),age:0,launchTime:reduced?0:.72+Math.random()*.2,type,radius,reduced,particles:null,seed:Math.random()*6.28});
   if(!frame){last=now;frame=requestAnimationFrame(tick);}return true;
  }
  function explode(show){
   const {type,radius,seed}=show,count=show.reduced?38:type===1?100:136;
   show.particles=Array.from({length:count},(_,i)=>{
    const ring=i%3,angle=i/count*Math.PI*2+seed+(Math.random()-.5)*.025;
    const speed=radius*(ring===0?.42:ring===1?.8:1.15)*(.76+Math.random()*.44);
    return {vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:type===1?2.6+Math.random()*.65:1.8+Math.random()*.7,drag:type===1?.74:1.15,gravity:type===1?radius*.18:radius*.11,color:palettes[type][ring],phase:Math.random()*6.28,weight:.7+Math.random()*.65};
   });
   if(!show.reduced)onBurst();
  }
  function point(show,p,t){const easing=(1-Math.exp(-p.drag*t))/p.drag;return {x:show.x+pan+p.vx*easing+Math.sin(t*1.4+p.phase)*t*1.6,y:show.y+p.vy*easing+p.gravity*t*t};}
  function halo(x,y,r,color,alpha){ctx.globalAlpha=alpha;ctx.drawImage(glow(color),x-r,y-r,r*2,r*2);}
  function rocket(show){
   const t=Math.min(1,show.age/show.launchTime),at=u=>{const e=1-Math.pow(1-u,1.65);return {x:show.originX+pan+(show.x-show.originX)*e+Math.sin(u*Math.PI)*5,y:show.originY+(show.y-show.originY)*e};},head=at(t);
   for(let i=12;i>0;i--){const a=at(Math.max(0,t-i*.012)),b=at(Math.max(0,t-(i-1)*.012));ctx.globalAlpha=(1-i/13)*.65;ctx.strokeStyle='#f0c784';ctx.lineWidth=.65+(1-i/13);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
   halo(head.x,head.y,9,'#f6d992',.6);ctx.globalAlpha=.9;ctx.fillStyle='#fff2cb';ctx.beginPath();ctx.arc(head.x,head.y,1.3,0,Math.PI*2);ctx.fill();
  }
  function bloom(show,t){
   // A small local glow, with no full-screen flash or black clearing trails.
   halo(show.x+pan,show.y,show.radius*1.6,palettes[show.type][0],Math.max(0,.12*(1-t/1.4)));
   for(const p of show.particles){
    if(t>p.life)continue;
    const fade=Math.pow(Math.max(0,1-t/p.life),.65),head=point(show,p,t);
    const tail=Math.min(t,show.type===1?1.05:.65),steps=14;
    for(let j=0;j<steps;j++){
     const a=point(show,p,t-tail+tail*j/steps),b=point(show,p,t-tail+tail*(j+1)/steps);
     ctx.strokeStyle=t>p.life*.7?'#d79c61':p.color;ctx.lineWidth=p.weight*(.5+j/steps*.5);ctx.globalAlpha=fade*(.15+j/steps*.65);
     ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    }
    halo(head.x,head.y,3.5,p.color,fade*.45);
    ctx.globalAlpha=fade*(.7+.3*Math.sin(t*9+p.phase)**2);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(head.x,head.y,p.weight*.7,0,Math.PI*2);ctx.fill();
    if(show.type===1&&t>.55){const a=point(show,p,Math.max(0,t-.24));ctx.globalAlpha=fade*.3;ctx.fillRect(a.x,a.y,.8,.8);}
   }
  }
  function quietBloom(show,t){
   const fade=Math.min(1,t/.3)*Math.max(0,1-t/1.5);for(const p of show.particles){const a=point(show,p,.75),b=point(show,p,1.1);ctx.globalAlpha=fade*.65;ctx.strokeStyle=p.color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();halo(b.x,b.y,3,p.color,fade*.3);}
  }
  function tick(now){
   const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;ctx.clearRect(0,0,width,height);ctx.globalCompositeOperation='lighter';
   for(const show of shows){show.age+=dt;if(show.age<show.launchTime){rocket(show);continue;}if(!show.particles)explode(show);const t=show.age-show.launchTime;if(show.reduced)quietBloom(show,t);else bloom(show,t);}
   shows=shows.filter(s=>s.age<s.launchTime+(s.reduced?1.5:3.4));
   updateMask();ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-in';ctx.drawImage(skyMask,0,0,width,height);ctx.globalCompositeOperation='source-over';
   canvas.dataset.phase=shows.some(s=>!s.particles)?'launch':shows.length?'bloom':'idle';
   if(shows.length)frame=requestAnimationFrame(tick);else{frame=0;ctx.clearRect(0,0,width,height);}
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  motion.addEventListener('change',reset);
  resize();return {launch,reset,resize,setPan(value){if(pan!==value)skyDirty=true;pan=value;}};
 }
 return {create};
})();
