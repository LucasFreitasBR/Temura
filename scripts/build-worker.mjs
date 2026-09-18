import { build } from 'esbuild';
import { mkdir, cp, readFile, writeFile, readdir } from 'node:fs/promises';
await mkdir('dist/server',{recursive:true});await mkdir('dist/client',{recursive:true});await mkdir('dist/.openai',{recursive:true});
await cp('out','dist/client',{recursive:true});
if(!process.argv.includes('--prebundled')) await build({entryPoints:['server/worker.ts'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/.openai/drizzle',{recursive:true});
// CSP hashes allow Next.js hydration without accepting arbitrary inline scripts.
const files=await readdir('dist/client');
const {createHash}=await import('node:crypto');const hashes=new Set();
for(const file of files.filter(f=>f.endsWith('.html'))){const html=await readFile('dist/client/'+file,'utf8');for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){if(match[1])hashes.add("'sha256-"+createHash('sha256').update(match[1]).digest('base64')+"'");}}
let worker=await readFile('dist/server/index.js','utf8');worker=worker.replace("script-src 'self' 'unsafe-inline'",`script-src 'self' ${[...hashes].join(' ')}`);await writeFile('dist/server/index.js',worker);
console.log('Next.js exported; Worker and database migrations ready.');

