import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {distance,score,toUV,fromUV,selectRounds,validateLocation} from '../public/core.js';
import {scan} from '../scripts/build.mjs';
import {zip} from '../public/zip.js';
test('World coordinates preserve north/south and metre distances',()=>{
 assert.deepEqual(toUV({x:0,z:15360}),{u:0,v:0});assert.deepEqual(fromUV(1,1),{x:15360,z:0});assert.equal(distance({x:100,z:200},{x:400,z:600}),500);
 assert.equal(score(0),5000);assert.equal(score(30),5000);assert.ok(score(500)<score(100));
});
test('Seeded games have reproducible unique rounds',()=>{const a=Array.from({length:34},(_,i)=>({id:String(i)}));const first=selectRounds(a,'hello');assert.equal(new Set(first.map(x=>x.id)).size,5);assert.deepEqual(first,selectRounds([...a].reverse(),'hello'));assert.notDeepEqual(first,selectRounds(a,'other'));assert.equal(selectRounds(a.slice(0,2),'a').length,2);});
test('Bad coordinates and maps are rejected',()=>{for(const p of [{x:NaN,z:4},{x:'4',z:4},{x:4,z:15361},{x:-1,z:0},{x:4,z:3,map:'sakhal'}])assert.throws(()=>validateLocation(p));});
test('Scanner supports nested flat photos, explicit panoramas, sidecars and disabled scenes',async()=>{
 const root=await mkdtemp(path.resolve('.import-test-'));try{
 await mkdir(path.join(root,'nested'));
 await writeFile(path.join(root,'nested','road__x123__z456.jpg'),'test');
 await writeFile(path.join(root,'hill__x500__z600__panorama.webp'),'test');
 await writeFile(path.join(root,'custom.png'),'test');await writeFile(path.join(root,'custom.json'),JSON.stringify({x:0,z:15360,title:'Special',type:'photo'}));
 await writeFile(path.join(root,'disabled.jpg'),'test');await writeFile(path.join(root,'disabled.json'),'{"enabled":false}');
 const list=await scan(root);assert.equal(list.length,3);assert.equal(list.find(x=>x.title==='road').type,'photo');assert.equal(list.find(x=>x.title==='hill').type,'panorama');assert.equal(list.find(x=>x.title==='Special').z,15360);
 await writeFile(path.join(root,'broken.jpg'),'test');await assert.rejects(scan(root),/Missing/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('Exported ZIP has local and central records for both files',async()=>{
 const blob=await zip([['locations/chernarus/a.jpg','abc'],['locations/chernarus/a.json','{}']]),bytes=await blob.arrayBuffer(),v=new DataView(bytes);assert.equal(v.getUint32(0,true),0x04034b50);assert.equal(v.getUint32(bytes.byteLength-22,true),0x06054b50);assert.equal(v.getUint16(bytes.byteLength-12,true),2);
});
