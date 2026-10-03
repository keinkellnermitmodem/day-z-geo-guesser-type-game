import {distance,score,selectRounds,validateLocation,clamp} from './core.js';
import {MapView,SceneViewer} from './viewers.js';
import {zip} from './zip.js';
const $=s=>document.querySelector(s),fmt=n=>Math.round(n).toLocaleString('en-US'),metres=n=>n<1000?`${fmt(n)} m`:`${(n/1000).toFixed(2)} km`;
const storage={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};
let pack,rounds=[],index=0,total=0,results=[],seed='',timed=false,startTime=0,phase='loading',guess=null,loadGeneration=0;
let map,editorMap,viewer,editorFile=null,editorURL=null,editorGeneration=0;
const image=new Image();image.src='assets/chernarus.webp';
const open=id=>$(id).showModal();
$('#workshop-open').onclick=()=>{open('#workshop');editorMap?.draw();};
$('#help-open').onclick=()=>open('#help');$('#credits-open').onclick=()=>open('#credits');
$('#play-tab').onclick=()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();};
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
$('#timed-mode').checked=storage.get('dr-timed')==='true';
$('#timed-mode').onchange=e=>storage.set('dr-timed',e.target.checked);
function pin(p){if(phase!=='playing')return;guess={...p};$('#guess').disabled=false;$('#pin-status').textContent='● Position marked';$('#pin-coords').textContent=`${fmt(p.x)} / ${fmt(p.z)}`;}
function setEditorPin(p){$('#edit-x').value=p.x;$('#edit-z').value=p.z;}
function dots(){const el=$('#round-dots');el.replaceChildren();rounds.forEach((_,i)=>{const s=document.createElement('span');s.className=i<index?'done':i===index?'current':'';el.append(s);});}
function freshSeed(){return Array.from(crypto.getRandomValues(new Uint32Array(2)),x=>x.toString(36)).join('');}
function begin(useLink=false){
 if(!pack)return;
 const params=new URLSearchParams(location.hash.slice(1));seed=useLink&&params.get('seed')?params.get('seed').slice(0,100):freshSeed();timed=useLink&&params.has('timed')?params.get('timed')==='1':$('#timed-mode').checked;
 if(useLink&&params.get('pack')&&params.get('pack')!==pack.version)alert('This challenge used a different location pack. The current pack may give different locations.');
 rounds=selectRounds(pack.locations,seed,5);index=0;total=0;results=[];
 if($('#summary').open)$('#summary').close();
 history.replaceState(null,'','#'+new URLSearchParams({seed,pack:pack.version,timed:timed?'1':'0'}));
 $('#total-score').textContent='0';$('#timer-label').textContent=timed?'TIME LEFT':'TIME SPENT';loadRound();
}
async function loadRound(){
 const generation=++loadGeneration;phase='loading';guess=null;map.pin=null;map.answer=null;map.locked=true;map.reset();dots();
 $('#round-number').innerHTML=`${String(index+1).padStart(2,'0')} <span>/ ${String(rounds.length).padStart(2,'0')}</span>`;
 $('#note-eyebrow').textContent=`FIELD EXERCISE / ${String(index+1).padStart(2,'0')}`;
 $('#note-title').innerHTML='Somewhere in<br> Chernarus.';$('#note-title').classList.remove('reveal');
 $('#note-text').innerHTML='Look for a familiar road, skyline or sign.<br> Then mark your position on the map.';
 $('#map-title').textContent='Where are you?';$('#pin-status').textContent='Place your pin on the map';$('#pin-coords').textContent='';
 $('#guess').textContent='Confirm location';$('#guess').disabled=true;$('#skip').hidden=false;$('#skip').disabled=true;
 $('#load-state').hidden=false;$('#load-state').textContent='Loading the field…';$('#timer').textContent=timed?'02:00':'00:00';$('#timer').classList.remove('warning-time');
 const location=rounds[index],pano=location.type==='panorama'&&viewer.gl;
 $('#scene-kind').textContent=pano?'360° PANORAMA':'FIELD PHOTOGRAPH';$('#scene-tip').textContent=pano?'↔ Drag to look around · Scroll to zoom':'Screenshot · Zoom to inspect details';
 try{
  await viewer.load(location);if(generation!==loadGeneration)return;
  $('#load-state').hidden=true;phase='playing';map.locked=false;$('#skip').disabled=false;startTime=Date.now();
 }catch(e){if(generation!==loadGeneration)return;$('#load-state').textContent='This image could not load. Skip this round or start a new run.';phase='image-error';$('#skip').disabled=false;}
}
function submit(skipped=false){
 if(!['playing','image-error'].includes(phase))return;if(!skipped&&!guess)return;
 const target=rounds[index],d=guess&&!skipped?distance(guess,target):null,points=d===null?0:score(d);total+=points;
 results.push({title:target.title,distance:d,score:points});phase='result';map.locked=true;map.answer=target;map.reset();
 $('#total-score').textContent=fmt(total);$('#note-eyebrow').textContent=d===null?'LOCATION REVEALED':d<=30?'RIGHT ON TARGET':d<750?'GOOD BEARINGS':'LOCATION REVEALED';
 $('#note-title').textContent=d===null?'Keep moving.':`${metres(d)} away.`;$('#note-title').classList.add('reveal');
 $('#note-text').textContent=`${target.title} · +${fmt(points)} points.${target.approximate?' Community-estimated camera position.':''}`;
 $('#map-title').textContent='The way back.';$('#pin-status').textContent='● Your guess';$('#pin-coords').textContent='◉ Actual location';
 $('#guess').textContent=index===rounds.length-1?'View expedition results':'Next location';$('#guess').disabled=false;$('#skip').hidden=true;
}
$('#guess').onclick=()=>{if(phase==='result'){if(index===rounds.length-1)finish();else{index++;loadRound();}}else submit();};
$('#skip').onclick=()=>submit(true);
$('#new-run').onclick=()=>{if(pack)begin();};$('#play-again').onclick=()=>begin();
function finish(){
 phase='complete';$('#guess').textContent='View expedition results';$('#guess').onclick=()=>{if(phase==='complete')open('#summary');else if(phase==='result'){if(index===rounds.length-1)finish();else{index++;loadRound();}}else submit();};
 const key=`dr-best-${timed?'timed':'relaxed'}-${rounds.length}`,best=Math.max(Number(storage.get(key))||0,total);storage.set(key,best);
 $('#final-score').innerHTML=`${fmt(total)} <small>/ ${fmt(rounds.length*5000)}</small>`;$('#best-score').textContent=`Personal best · ${fmt(best)} · ${timed?'Two-minute':'Untimed'} runs`;
 $('#summary-title').textContent=total>=rounds.length*4000?'Chernarus feels like home.':total>=rounds.length*2000?'You found your way.':'Every road teaches you.';
 const list=$('#results-list');list.replaceChildren();results.forEach((r,i)=>{const row=document.createElement('div');row.className='result-row';for(const [tag,text] of [['span',`0${i+1} · ${r.title}`],['span',r.distance===null?'Skipped':metres(r.distance)],['b',fmt(r.score)]]){const el=document.createElement(tag);el.textContent=text;row.append(el);}list.append(row);});
 $('#share-status').textContent='Challenge links use the same locations and round settings.';open('#summary');
}
$('#copy-challenge').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('#share-status').textContent='Challenge link copied. Send it to a fellow survivor.';}catch{$('#share-status').textContent='Copy the address from your browser to share this challenge.';}};
setInterval(()=>{if(phase!=='playing')return;const elapsed=Math.floor((Date.now()-startTime)/1000),seconds=timed?Math.max(0,120-elapsed):elapsed;$('#timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;$('#timer').classList.toggle('warning-time',timed&&seconds<=20);if(timed&&seconds===0)submit(!guess);},250);
$('#map-plus').onclick=()=>map?.changeZoom(1.5);$('#map-minus').onclick=()=>map?.changeZoom(1/1.5);$('#map-reset').onclick=()=>map?.reset();
$('#expand-map').onclick=()=>{const expanded=$('.map-panel').classList.toggle('expanded');$('#expand-map').setAttribute('aria-label',expanded?'Shrink map':'Expand map');};
$('#view-plus').onclick=()=>viewer?.zoom(-10);$('#view-minus').onclick=()=>viewer?.zoom(10);$('#view-reset').onclick=()=>viewer?.reset();
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#game').requestFullscreen();}catch{$('#scene-tip').textContent='Fullscreen is unavailable in this browser.';}};
for(const id of ['#edit-x','#edit-z'])$(id).oninput=()=>{if($('#edit-x').value===''||$('#edit-z').value==='')return;const p={x:Number($('#edit-x').value),z:Number($('#edit-z').value)};try{validateLocation(p);editorMap.pin=p;editorMap.draw();}catch{}};
async function selectImage(file){
 if(!file)return;
 if(!/\.(png|jpe?g|webp)$/i.test(file.name)||file.size>25*1024*1024){$('#editor-status').textContent='Choose a JPG, PNG or WebP under 25 MB.';return;}
 const generation=++editorGeneration;editorFile=null;$('#export-location').disabled=true;$('#location-name').value=file.name.replace(/\.[^.]+$/,'').replaceAll('_',' ');$('#image-type').value='photo';
 const url=URL.createObjectURL(file),check=new Image();check.src=url;try{await check.decode();}catch{URL.revokeObjectURL(url);if(generation===editorGeneration){$('#editor-status').textContent='The image could not be decoded. Try another file.';$('#export-location').disabled=false;}return;}
 if(generation!==editorGeneration){URL.revokeObjectURL(url);return;}$('#export-location').disabled=false;
 if(editorURL)URL.revokeObjectURL(editorURL);editorURL=url;editorFile=file;$('#editor-preview').src=url;$('#editor-preview').hidden=false;$('#upload-label').hidden=true;
 $('#editor-status').textContent=`${check.width} × ${check.height} pixels. Choose the camera position. Standard screenshot selected by default.`;
}
$('#image-file').onchange=e=>selectImage(e.target.files[0]);$('#dropzone').ondragover=e=>e.preventDefault();$('#dropzone').ondrop=e=>{e.preventDefault();selectImage(e.dataTransfer.files[0]);};
$('#export-location').onclick=async()=>{
 try{
  if(!editorFile)throw new Error('Add a screenshot first.');if($('#edit-x').value===''||$('#edit-z').value==='')throw new Error('Pin the camera position or enter X and Z coordinates.');
  const p=validateLocation({title:$('#location-name').value.trim()||'Field location',map:'chernarus',x:Number($('#edit-x').value),z:Number($('#edit-z').value),type:$('#image-type').value,author:$('#image-author').value.trim(),license:'Contributor supplied'});
  if(p.type==='panorama'){const im=$('#editor-preview');if(Math.abs(im.naturalWidth/im.naturalHeight-2)>.06)throw new Error('A full 360° panorama must have a 2:1 aspect ratio. Use Standard screenshot for this image.');}
  const slug=p.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'location',base=`${slug}__x${p.x}__z${p.z}`,ext=editorFile.name.split('.').pop().toLowerCase();
  const blob=await zip([[`locations/chernarus/${base}.${ext}`,editorFile],[`locations/chernarus/${base}.json`,JSON.stringify(p,null,2)+'\n']]);
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=base+'.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);$('#editor-status').textContent='Downloaded. Extract the ZIP and commit the files to locations/chernarus/.';
 }catch(e){$('#editor-status').textContent=e.message;}
};
async function init(){try{
 const [p,l]=await Promise.all([fetch('data/locations.json').then(r=>{if(!r.ok)throw new Error('Location pack not found. Run npm run build.');return r.json();}),fetch('data/labels.json').then(r=>r.ok?r.json():[]),image.decode()]);
 if(!p.locations?.length)throw new Error('No playable locations found.');pack=p;
 map=new MapView($('#guess-map'),image,pin,l);editorMap=new MapView($('#editor-map'),image,setEditorPin,l);viewer=new SceneViewer($('#panorama'),$('#flat-photo'));
 $('#pack-label').textContent=`CHERNARUS FIELD PACK · ${pack.locations.length} LOCATIONS`;
 map.draw();begin(true);
 }catch(e){$('#load-state').hidden=false;$('#load-state').textContent=`Could not start: ${e.message} Serve the dist folder over HTTP; see README.md.`;}
}
init();
