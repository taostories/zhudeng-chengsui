/* Cropped from the user's two transparent sheets; geometry is shared with input. */
window.MinigameArt = (() => {
 const root='assets/optimized/minigames/';
 const ribs=[
  'M175 251C133 220 129 103 172 56L228 56C271 103 267 220 225 251Z',
  'M182 251C151 211 150 101 180 56L220 56C250 101 249 211 218 251Z',
  'M200 251V56'
 ];
 const creases=['M200 124Q176 138 151 135','M201 219Q232 211 253 190'];
 // Front rib / horizontal hoop intersections, measured on the supplied frame.
 const knots=[[160,145],[240,145],[170,230],[230,230]];
 // Cotton body measured on lantern-blank.webp, excluding the handle and bamboo rims.
 const clothFace={x:140,y:61,width:120,height:189,path:'M166 61H234C256 80 260 109 260 145C260 204 256 230 234 247Q200 253 166 247C144 230 140 204 140 145C140 109 144 80 166 61Z'};
 const image=(name,attrs='')=>`<image href="${root}${name}.webp" x="0" y="0" width="400" height="300" ${attrs}/>`;
 function frame(s,solid=false,pattern='',lit=false){
  return `<g class="work-frame imported-lamp">${image(solid?(lit?'lantern-lit':'lantern-blank'):'lantern-frame')}${!solid?(s.knots||[]).map(i=>{const [x,y]=knots[i];return `<image class="bound-wire" href="${root}wire-binding.webp" x="${x-7}" y="${y-5}" width="14" height="10"/>`;}).join(''):pattern}</g>`;
 }
 let serial=0;
 function wrinkles(progress){
  const id='wrinkle-'+serial++,top=Math.max(0,1-progress/4),bottom=Math.min(1,Math.max(0,1-(progress-4)/4));
  return `<defs><clipPath id="${id}-top"><rect width="400" height="172"/></clipPath><clipPath id="${id}-bottom"><rect y="172" width="400" height="128"/></clipPath></defs>${image('lantern-wrinkled',`class="wrinkle-top" opacity="${top}" clip-path="url(#${id}-top)"`)}${image('lantern-wrinkled',`class="wrinkle-bottom" opacity="${bottom}" clip-path="url(#${id}-bottom)"`)}`;
 }
 function updateWrinkles(root,progress){root.querySelector('.wrinkle-top')?.setAttribute('opacity',String(Math.max(0,1-progress/4)));root.querySelector('.wrinkle-bottom')?.setAttribute('opacity',String(Math.min(1,Math.max(0,1-(progress-4)/4))));}
 const detailBounds={"round": [162, 20, 395, 667], "square": [172, 20, 376, 667], "butterfly": [70, 20, 579, 616], "rose": [142, 20, 436, 640]};
 const festival=(type,detail=false)=>`<svg viewBox="${detail?detailBounds[type].join(' '):'0 0 720 960'}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><image href="${root}${type}.webp" width="720" height="960"/></svg>`;
 return {ribs,creases,knots,clothFace,frame,wrinkles,updateWrinkles,festival};
})();
