/* Load visible art first; prepare only nearby story art, two requests at a time. */
window.StoryImages = (() => {
 const root='assets/optimized/',loaded=new Map();
 const portrait=name=>root+'characters/'+name+'.webp';
 const tools=['lantern-frame','lantern-blank','lantern-wrinkled','lantern-lit','bamboo-bundle','wire-coil','wire-binding','cotton-cloth','brush','pattern-plum','pattern-orchid','pattern-bamboo'];
 const chapterArt=[[],tools,['round','square','butterfly','rose','lantern-lit'],[...tools,'ahe-hands-soft']];
 let timer,revision=0;
 function load(url,priority='low'){
  if(!url)return Promise.resolve();
  if(loaded.has(url))return loaded.get(url);
  const image=new Image();image.fetchPriority=priority;image.decoding='async';
  const promise=new Promise(resolve=>{image.onload=()=>resolve();image.onerror=()=>{loaded.delete(url);resolve();};});
  loaded.set(url,promise);image.src=url;return promise;
 }
 function scene(n){return n.type==='ending'?ART.cover:ART[n.scene||['village','workshop','festival','legacy'][n.chapter]];}
 function art(n){
  const result=[scene(n)];
  const person=n.who==='祖父'?'grandfather':n.who==='我'?(n.chapter<3?'childhood':'adult'):n.who==='阿禾'?'ahe':null;
  if(person)result.push(portrait(person));
  return result;
 }
 function warm(mode,index){
  clearTimeout(timer);const version=++revision,cover=mode==='cover',n=STORY[index];
  const first=cover?[ART.cover,root+'title-calligraphy.webp']:art(n);
  const ready=Promise.all(first.map(url=>load(url,'high')));
  const nearby=cover?[ART.village,portrait('childhood'),portrait('grandfather')]:[
   ...STORY.slice(index+1,index+7).flatMap(art),
   ...chapterArt[n.chapter].map(name=>root+'minigames/'+name+'.webp')
  ];
  // Wait for current art; obsolete work stops when the reader changes scenes.
  timer=setTimeout(async()=>{
   await ready;if(version!==revision)return;
   const queue=[...new Set(nearby)].filter(Boolean);
   async function worker(){while(version===revision&&queue.length)await load(queue.shift());}
   await Promise.all([worker(),worker()]);
  },300);
 }
 return {warm};
})();
