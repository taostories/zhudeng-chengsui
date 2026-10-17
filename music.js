/* Two licensed tracks, one forward transition per page session. No audio fetch on the cover. */
window.StoryMusic=(()=>{
 const urls=['assets/music/guzheng-city.mp3','assets/music/ripples.mp3'];
 const buffers=new Map(),pending=new Map(),voices=new Set();
 let context,started=false,enabled=true,phase=0,active=null,revision=0;
 function status(){document.querySelector('#sound').textContent=`声音 ${enabled?'开':'关'}`;document.querySelector('#sound').setAttribute('aria-pressed',String(enabled));document.querySelector('#sound').setAttribute('aria-label',enabled?'关闭音乐和音效':'开启音乐和音效');}
 function ctx(){return context ||= new (window.AudioContext||window.webkitAudioContext)();}
 async function buffer(index){
  if(buffers.has(index))return buffers.get(index);
  if(!pending.has(index))pending.set(index,(async()=>{const r=await fetch(urls[index]);if(!r.ok)throw Error('Music unavailable');const b=await ctx().decodeAudioData(await r.arrayBuffer());buffers.set(index,b);return b;})().finally(()=>pending.delete(index)));
  return pending.get(index);
 }
 function stop(voice,fade=0){if(!voice||voice.stopping)return;voice.stopping=true;const now=context.currentTime;voice.gain.gain.cancelScheduledValues(now);voice.gain.gain.setValueAtTime(voice.gain.gain.value,now);voice.gain.gain.linearRampToValueAtTime(0,now+fade);voice.source.stop(now+fade+.02);}
 async function play(){
  if(!started||!enabled||document.hidden)return;
  const ticket=++revision,index=phase;
  try{
   await ctx().resume();const data=await buffer(index);
   if(ticket!==revision||!enabled||document.hidden)return;
   if(active?.index===index&&!active.stopping)return;
   const source=context.createBufferSource(),gain=context.createGain();source.buffer=data;source.loop=true;source.connect(gain);gain.connect(context.destination);
   const voice={source,gain,index,stopping:false};voices.add(voice);
   source.onended=()=>{source.disconnect();gain.disconnect();voices.delete(voice);};
   gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(.19,context.currentTime+2.5);source.start();stop(active,2.5);active=voice;
  }catch{if(ticket===revision){setEnabled(false);document.dispatchEvent(new Event('music-unavailable'));}}
 }
 function begin(){started=true;if(enabled)play();}
 function chapter(value){const next=value>=3?1:0;if(next>phase){phase=next;if(started&&enabled)play();}else if(started&&enabled&&value===2)buffer(1).catch(()=>{});}
 function setEnabled(value){enabled=value;status();if(enabled&&started)play();else if(!enabled){revision++;for(const voice of voices)stop(voice);active=null;}}
 document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden){context.suspend().catch(()=>{});}else if(started&&enabled){context.resume().then(play).catch(()=>{});}});
 const credits=document.querySelector('#music-credits');
 document.querySelector('#music-credit-button').onclick=()=>credits.showModal();
 document.querySelector('#close-music-credits').onclick=()=>credits.close();
 credits.addEventListener('click',e=>{if(e.target===credits){const r=credits.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)credits.close();}});
 return {begin,chapter,setEnabled};
})();
