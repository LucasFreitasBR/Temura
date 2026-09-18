import { z } from 'zod';
export const leadSchema=z.object({
 name:z.string().trim().min(2).max(100),email:z.email().max(254).transform(s=>s.toLowerCase()),company:z.string().trim().max(120).default(''),service:z.enum(['web','ads','film','complete','talk']),message:z.string().trim().min(10).max(3000),consent:z.literal(true),website:z.string().max(300).default(''),startedAt:z.number().finite(),idempotencyKey:z.uuid()
}).strict();
