import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {build} from './build.mjs';
await build();
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.md':'text/plain'};
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost'),p=path.resolve(root,'.'+decodeURIComponent(url.pathname.endsWith('/')?url.pathname+'index.html':url.pathname));
 if(!p.startsWith(root+path.sep))throw new Error('Invalid path');
 const body=await readFile(p);res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);
}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'0.0.0.0',()=>console.log('Open http://localhost:4173'));
