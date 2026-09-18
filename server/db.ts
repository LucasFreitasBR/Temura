import type { D1Database } from '@cloudflare/workers-types';
export function getDB(env:{DB?:D1Database}){if(!env.DB)throw new Error('Storage unavailable');return env.DB;}
