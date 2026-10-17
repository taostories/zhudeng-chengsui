/* Brush strokes and the reveal mask share the SVG's coordinate system. */
window.LanternPainting=(()=>{
 const names={'梅花':'pattern-plum','兰草':'pattern-orchid','竹叶':'pattern-bamboo'};
 const source=p=>'assets/minigames/'+names[p||'兰草']+'.png';
 const motif=p=>`<image href="${source(p)}" x="65" y="93" width="100" height="140" opacity="0.85"/>`;
 const stroke=points=>points.length===1?`<circle cx="${points[0][0]}" cy="${points[0][1]}" r="10" fill="white"/>`:`<path d="M${points.map(p=>p.join(' ')).join('L')}" fill="none" stroke="white" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`;
 function drawing(s){const art=`<g transform="translate(85 -3)">${motif(s.pattern)}</g>`;if(s.craft.ink>=5)return art;return `<defs><mask id="paint-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="300"><g id="paint-strokes">${s.craft.paintStrokes.map(stroke).join('')}</g></mask></defs><g opacity=".12">${art}</g><g mask="url(#paint-reveal)">${art}</g>`;}
 const overlay=()=>'<button class="craft-point paint-step" aria-label="涂绘下一处纹样，也可按住灯面涂抹">·</button><img class="paint-brush" src="assets/minigames/brush.png" alt="" aria-hidden="true" draggable="false">';
 function mount({state:s,save,render,chime}){
  const surface=document.querySelector('.work-surface'),svg=surface.querySelector('svg'),layer=surface.querySelector('#paint-strokes'),marker=surface.querySelector('.paint-step'),brush=surface.querySelector('.paint-brush');
  const c=s.craft,canvas=document.createElement('canvas');canvas.width=400;canvas.height=300;const ctx=canvas.getContext('2d',{willReadFrequently:true});
  let active=null,alive=true,ready=false,pixels=[],current=null,tip=null;
  function draw(points){ctx.strokeStyle='white';ctx.fillStyle='white';ctx.lineWidth=20;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);if(points.length===1){ctx.arc(...points[0],10,0,Math.PI*2);ctx.fill();}else ctx.stroke();}
  function place(el,p){const q=new DOMPoint(...p).matrixTransform(svg.getScreenCTM()),r=surface.getBoundingClientRect();el.style.left=(q.x-r.left)+'px';el.style.top=(q.y-r.top)+'px';}
  function position(){if(tip)place(marker,tip);if(current)place(brush,current);}
  function progress(){const ink=ctx.getImageData(0,0,400,300).data;let count=0;tip=null;for(const p of pixels){if(ink[(p[1]*400+p[0])*4+3]>96)count++;else if(!tip)tip=p;}const coverage=pixels.length?count/pixels.length:0;c.ink=coverage>=.97?5:coverage*5;save();if(c.ink>=5){active=null;chime(587);render();return;}position();}
  const im=new Image();im.onload=()=>{if(!alive)return;const fit=Math.min(100/im.width,140/im.height),w=im.width*fit,h=im.height*fit;ctx.drawImage(im,150+(100-w)/2,90+(140-h)/2,w,h);const a=ctx.getImageData(0,0,400,300).data;for(let y=230;y>=90;y-=2)for(let x=150;x<=250;x+=2)if(a[(y*400+x)*4+3]>64)pixels.push([x,y]);ctx.clearRect(0,0,400,300);c.paintStrokes.forEach(draw);ready=true;progress();};im.src=source(s.pattern);
  const point=e=>{const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());return [Math.round(p.x*10)/10,Math.round(p.y*10)/10];};
  function add(p,start=false){if(!ready||!alive||p[0]<140||p[0]>260||p[1]<55||p[1]>255)return;current=p;position();let line=c.paintStrokes.at(-1);if(start||!line){line=[];c.paintStrokes.push(line);}if(line.length&&Math.hypot(p[0]-line.at(-1)[0],p[1]-line.at(-1)[1])<2)return;line.push(p);draw(line.slice(-2));layer.innerHTML=c.paintStrokes.map(stroke).join('');progress();}
  surface.onpointerdown=e=>{if(!ready||e.button!==0||!e.isPrimary||active!==null)return;const p=point(e);if(p[0]<140||p[0]>260||p[1]<55||p[1]>255)return;e.preventDefault();active=e.pointerId;surface.setPointerCapture(e.pointerId);add(p,true);};
  surface.onpointermove=e=>{if(active===e.pointerId){e.preventDefault();add(point(e));}};
  const stop=e=>{if(active!==e.pointerId)return;active=null;save();};surface.onpointerup=stop;surface.onpointercancel=stop;surface.onlostpointercapture=stop;
  marker.onclick=e=>{if(e.detail===0&&tip)add(tip,true);};
  const observer=new ResizeObserver(position);observer.observe(surface);
  return()=>{alive=false;active=null;observer.disconnect();surface.onpointerdown=surface.onpointermove=surface.onpointerup=surface.onpointercancel=surface.onlostpointercapture=null;};
 }
 return {motif,drawing,overlay,mount};
})();
