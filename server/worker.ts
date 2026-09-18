import type { D1Database, Fetcher, ExecutionContext } from '@cloudflare/workers-types';
import { leadSchema } from './validation';
import { getDB } from './db';
type Env={DB:D1Database;ASSETS:Fetcher};
const security:Record<string,string>={
 'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com https://*.chatgpt.com; upgrade-insecure-requests",
 'Strict-Transport-Security':'max-age=31536000; includeSubDomains'
};
function json(body:unknown,status=200,extra:Record<string,string>={}){return new Response(JSON.stringify(body),{status,headers:{...security,'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});}
async function limitedJSON(request:Request){
 const reader=request.body?.getReader();if(!reader)throw new Error('body');let size=0;const parts:Uint8Array[]=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw new Error('size');}parts.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}return JSON.parse(new TextDecoder().decode(bytes));
}
export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
 const url=new URL(request.url);
 if(url.pathname==='/api/leads'){
 if(request.method!=='POST')return json({error:'Método não permitido.'},405,{'Allow':'POST'});
 if(request.headers.get('Origin')!==url.origin || (request.headers.get('Sec-Fetch-Site') && !['same-origin','none'].includes(request.headers.get('Sec-Fetch-Site')!)))return json({error:'Origem não autorizada.'},403);
 if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return json({error:'Formato inválido.'},415);
 let raw:unknown;try{raw=await limitedJSON(request);}catch{return json({error:'Não foi possível ler o formulário. Confira o tamanho da mensagem.'},400);}
 const parsed=leadSchema.safeParse(raw);if(!parsed.success)return json({error:'Confira os campos obrigatórios e autorize o contato antes de enviar.'},400);
 const d=parsed.data;const now=Date.now();if(d.website || now-d.startedAt<1800 || d.startedAt>now)return json({error:'Aguarde alguns instantes e tente novamente.'},400);
 try{
 const db=getDB(env);const bucket=Math.floor(now/3600000);const ip=request.headers.get('CF-Connecting-IP')||'local';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${url.hostname}|${bucket}|${ip}`));const rateKey=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 const rate=await db.prepare('INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count').bind(rateKey,now+86400000).first<{count:number}>();
 if(!rate || rate.count>5)return json({error:'Muitos envios em pouco tempo. Tente novamente em uma hora.'},429,{'Retry-After':'3600'});
 await db.prepare('INSERT INTO leads (id, name, email, company, service, message, consent_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(d.idempotencyKey,d.name,d.email,d.company,d.service,d.message,'2026-09-18',now).run();
 ctx.waitUntil(db.batch([db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(now),db.prepare('DELETE FROM leads WHERE created_at < ?').bind(now-180*86400000)]).catch(()=>{console.error('Storage cleanup failed');}));
 return json({ok:true},201);
 }catch{console.error('Contact storage unavailable');return json({error:'O formulário está temporariamente indisponível. Seus dados não foram confirmados. Tente novamente em instantes.'},503);}
 }
 if(url.pathname.startsWith('/api/'))return json({error:'Página não encontrada.'},404);
 const response=await env.ASSETS.fetch(request as never);const headers=new Headers(response.headers as never);for(const [name,value] of Object.entries(security))headers.set(name,value);
 return new Response(response.body as never,{status:response.status,headers});
 }
};

