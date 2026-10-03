import {readdir,readFile,writeFile,mkdir,rm,cp,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateLocation} from '../public/core.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function scan(root=path.join(ROOT,'locations')) {
  const out=[],errors=[];
  async function walk(dir) {
    for(const e of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      if(e.name.startsWith('.'))continue;
      const file=path.join(dir,e.name);
      if(e.isSymbolicLink()) {errors.push(`Symlinks are not supported: ${file}`);continue;}
      if(e.isDirectory()){await walk(file);continue;}
      if(!/\.(jpg|jpeg|png|webp)$/i.test(e.name))continue;
      const rel=path.relative(root,file).split(path.sep).join('/');
      try {
        let p; const sidecar=file.replace(/\.[^.]+$/,'.json');
        try {p=JSON.parse(await readFile(sidecar,'utf8'));}
        catch(err) {
          if(err.code!=='ENOENT')throw err;
          const match=e.name.match(/^(.+?)__x(\d+(?:\.\d+)?)__z(\d+(?:\.\d+)?)(?:__(photo|panorama))?\.[^.]+$/i);
          if(!match)throw new Error('Missing .json sidecar or __xNUMBER__zNUMBER filename coordinates.');
          p={title:match[1].replaceAll('-',' '),x:Number(match[2]),z:Number(match[3]),type:match[4]?.toLowerCase()||'photo'};
        }
        if(p.enabled===false)continue;
        validateLocation(p);
        if((await stat(file)).size>25*1024*1024)throw new Error('Image exceeds 25 MB; resize it before upload.');
        const id=createHash('sha256').update(rel).digest('hex').slice(0,16),contentHash=createHash('sha256').update(await readFile(file)).digest('hex').slice(0,16);
        out.push({id,contentHash,image:'locations/'+rel.split('/').map(encodeURIComponent).join('/'),title:p.title||'Unmarked location',map:'chernarus',type:p.type||'photo',x:p.x,z:p.z,heading:p.heading||0,author:p.author||'Community contribution',source:p.source||'',license:p.license||'Contributor supplied',approximate:!!p.approximate});
      }catch(err){errors.push(`${rel}: ${err.message}`);}
    }
  }
  await walk(root);
  if(errors.length)throw new Error('Location validation failed:\n'+errors.join('\n'));
  if(!out.length)throw new Error('No locations found. Add a photo with coordinates to locations/chernarus/.');
  return out;
}
export async function build(){
  const locations=await scan(); // Validate BEFORE replacing a working build.
  const version=createHash('sha256').update(JSON.stringify(locations)).digest('hex').slice(0,12);
  const dist=path.join(ROOT,'dist');await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
  await cp(path.join(ROOT,'public'),dist,{recursive:true});
  await cp(path.join(ROOT,'locations'),path.join(dist,'locations'),{recursive:true});
  await writeFile(path.join(dist,'data','locations.json'),JSON.stringify({version,locations},null,2));
  await writeFile(path.join(dist,'.nojekyll'),'');
  await cp(path.join(ROOT,'LICENSE.md'),path.join(dist,'LICENSE.md'));
  await cp(path.join(ROOT,'ATTRIBUTION.md'),path.join(dist,'ATTRIBUTION.md'));
  // Include source to meet the starter collection's public-source requirement.
  const source=path.join(dist,'source');await mkdir(source,{recursive:true});
  for(const item of ['public','scripts','tests','package.json','README.md','LICENSE.md','ATTRIBUTION.md','.github'])await cp(path.join(ROOT,item),path.join(source,item),{recursive:true});
  const links=['README.md','LICENSE.md','ATTRIBUTION.md','package.json','public/index.html','public/style.css','public/app.js','public/core.js','public/viewers.js','public/zip.js','scripts/build.mjs','scripts/dev.mjs','tests/core.test.mjs','.github/workflows/pages.yml'];
  await writeFile(path.join(source,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dead Reckoning source</title><style>body{background:#14211d;color:#eee;font:16px/1.6 system-ui;max-width:800px;margin:50px auto;padding:20px}a{color:#d3eb79}li{margin:10px 0}</style><h1>Dead Reckoning source</h1><p>Public application source under LiCL-1.0. Map assets retain their separate ADPL-SA license. See attribution for details.</p><ul>'+links.map(p=>`<li><a href="${p}">${p}</a></li>`).join('')+'</ul><p>Shared scene assets are available in the game\'s <a href="../data/locations.json">location manifest</a>; each image has a matching JSON sidecar in the same directory.</p><p><a href="../">Return to the game</a></p></html>');
  console.log(`Built ${locations.length} locations → dist/ (pack ${version})`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  await build();
  if(process.argv.includes('--watch')){
    let last='';let busy=false;
    setInterval(async()=>{if(busy)return;busy=true;try{
      async function stamp(d){let s='';for(const e of await readdir(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isSymbolicLink())continue;s+=e.isDirectory()?await stamp(p):p+':'+(await stat(p)).mtimeMs;}return s;}
      const next=await stamp(path.join(ROOT,'locations'))+await stamp(path.join(ROOT,'public'));
      if(next!==last){last=next;await build();}
    }catch(e){console.error(e.message);}finally{busy=false;}},1500);
    console.log('Watching locations/ and public/ every 1.5 seconds.');
  }
}
