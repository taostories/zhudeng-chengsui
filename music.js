/* Stream MP3s instead of waiting for the entire file to decode. One forward song change. */
window.StoryMusic=(()=>{
 const urls=['assets/music/guzheng-city.mp3','assets/music/ripples.mp3'];
 const tracks=new Map();let context,started=false,enabled=true,phase=0,active=null,revision=0;
 function status(state){const button=document.querySelector('#sound');button.textContent=state==='loading'?'音乐加载中':state==='retry'?'音乐重试':`音乐 ${enabled?'开':'关'}`;button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',state==='retry'?'重试播放背景音乐':enabled?'关闭背景音乐和音效':'开启背景音乐和音效');}
 function ctx(){return context ||= new (window.AudioContext||window.webkitAudioContext)();}
 function track(index){
  if(tracks.has(index))return tracks.get(index);
  const media=new Audio();media.preload='none';media.loop=true;media.src=urls[index];
  const gain=ctx().createGain();gain.gain.value=0;ctx().createMediaElementSource(media).connect(gain);gain.connect(context.destination);
  const item={media,gain,index,timer:null};tracks.set(index,item);
  media.addEventListener('waiting',()=>{if(enabled&&index===phase)status('loading');});
  media.addEventListener('playing',()=>{if(enabled&&index===phase)status();});
  return item;
 }
 function fade(item,volume,seconds){if(!item)return;const now=context.currentTime;item.gain.gain.cancelScheduledValues(now);item.gain.gain.setValueAtTime(item.gain.gain.value,now);item.gain.gain.linearRampToValueAtTime(volume,now+seconds);}
 function fail(ticket){if(ticket!==revision)return;setEnabled(false);status('retry');document.dispatchEvent(new Event('music-unavailable'));}
 function play(){
  if(!started||!enabled||document.hidden)return;
  const ticket=++revision;
  try{
   const item=track(phase);clearTimeout(item.timer);
   if(item.media.error)item.media.load();
   if(active===item&&!item.media.paused){ctx().resume().catch(()=>fail(ticket));return;}
   status('loading');
   // Invoke synchronously in the click handler for mobile autoplay policies.
   const resumed=ctx().resume(),playing=item.media.play();
   Promise.all([resumed,playing]).then(()=>{
    if(ticket!==revision||!enabled||document.hidden)return;
    const previous=active;active=item;fade(item,.42,1.8);status();
    if(previous&&previous!==item){fade(previous,0,2.5);previous.timer=setTimeout(()=>{previous.media.pause();},2600);}
   }).catch(()=>fail(ticket));
  }catch{fail(ticket);}
 }
 function begin(){started=true;if(enabled)play();}
 function chapter(value){if(value>=3&&phase===0){phase=1;if(started&&enabled)play();}}
 function setEnabled(value){enabled=value;status();if(enabled&&started)play();else if(!enabled){revision++;for(const item of tracks.values()){clearTimeout(item.timer);item.media.pause();fade(item,0,0);}}}
 document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden){revision++;for(const item of tracks.values())item.media.pause();context.suspend().catch(()=>{});}else if(started&&enabled)play();});
 const credits=document.querySelector('#music-credits');
 document.querySelector('#music-credit-button').onclick=()=>credits.showModal();
 document.querySelector('#close-music-credits').onclick=()=>credits.close();
 credits.addEventListener('click',e=>{if(e.target===credits){const r=credits.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)credits.close();}});
 return {begin,chapter,setEnabled};
})();
