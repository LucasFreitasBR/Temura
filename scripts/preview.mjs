import http from 'node:http';
import { readFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import worker from '../dist/server/index.js';
await mkdir('.sites-runtime',{recursive:true});
const sqlite=new DatabaseSync('.sites-runtime/preview.sqlite');
sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations (name TEXT PRIMARY KEY)');
for(const name of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort()){
 if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name = ?').get(name)){
 sqlite.exec('BEGIN');try{sqlite.exec(await readFile('drizzle/'+name,'utf8'));sqlite.prepare('INSERT INTO local_migrations VALUES (?)').run(name);sqlite.exec('COMMIT');}catch(e){sqlite.exec('ROLLBACK');throw e;}
 }}
function prepare(sql){let values=[];const item={bind(...args){values=args;return item;},async first(){return sqlite.prepare(sql).get(...values)||null;},async run(){return sqlite.prepare(sql).run(...values);}};return item;}
const DB={prepare,async batch(items){sqlite.exec('BEGIN');try{const results=[];for(const item of items)results.push(await item.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
const root=resolve('dist/client');const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain','.json':'application/json'};
const ASSETS={async fetch(request){let path=decodeURIComponent(new URL(request.url).pathname);if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+path);if(!file.startsWith(root+sep))return new Response('Not found',{status:404});try{return new Response(await readFile(file),{headers:{'Content-Type':types[extname(file)]||'application/octet-stream'}});}catch{return new Response(await readFile(root+'/404.html'),{status:404,headers:{'Content-Type':'text/html'}});}}};
http.createServer(async(req,res)=>{try{const request=new Request('http://127.0.0.1:3001'+req.url,{method:req.method,headers:req.headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:req,duplex:'half'}:{})});const response=await worker.fetch(request,{DB,ASSETS},{waitUntil:p=>p.catch(console.error)});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){console.error(e.message);res.writeHead(500);res.end('Preview unavailable');}}).listen(3001,'127.0.0.1',()=>console.log('Temura preview ready at http://127.0.0.1:3001'));
