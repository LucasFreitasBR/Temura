import { leadSchema } from '../../server/validation';

// Envia os contatos do formulário para o e-mail da Temura via Resend.
// Variáveis de ambiente (painel da Netlify > Site configuration > Environment variables):
//   RESEND_API_KEY      chave gerada em resend.com/api-keys
//   CONTACT_TO_EMAIL    e-mail da Temura que recebe os contatos
//   CONTACT_FROM_EMAIL  remetente; opcional até verificar o domínio no Resend
const services: Record<string, string> = {
 web: 'Site ou landing page', ads: 'Tráfego pago', film: 'Fotos e vídeos', complete: 'Quero conectar tudo', talk: 'Vamos descobrir juntos'
};
const security: Record<string, string> = {
 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'Cache-Control': 'no-store'
};
function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
 return new Response(JSON.stringify(body), { status, headers: { ...security, 'Content-Type': 'application/json; charset=utf-8', ...extra } });
}
function escape(text: string) {
 return text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export default async (request: Request) => {
 if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405, { Allow: 'POST' });
 const url = new URL(request.url);
 const origin = request.headers.get('Origin');
 if (origin && origin !== url.origin) return json({ error: 'Origem não autorizada.' }, 403);
 if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({ error: 'Formato inválido.' }, 415);
 const body = await request.text();
 if (body.length > 16384) return json({ error: 'Não foi possível ler o formulário. Confira o tamanho da mensagem.' }, 400);
 let raw: unknown; try { raw = JSON.parse(body); } catch { return json({ error: 'Não foi possível ler o formulário.' }, 400); }
 const parsed = leadSchema.safeParse(raw);
 if (!parsed.success) return json({ error: 'Confira os campos obrigatórios e autorize o contato antes de enviar.' }, 400);
 const d = parsed.data; const now = Date.now();
 if (d.website || now - d.startedAt < 1800 || d.startedAt > now) return json({ error: 'Aguarde alguns instantes e tente novamente.' }, 400);

 const apiKey = process.env.RESEND_API_KEY; const to = process.env.CONTACT_TO_EMAIL;
 if (!apiKey || !to) { console.error('RESEND_API_KEY ou CONTACT_TO_EMAIL não configurados'); return json({ error: 'O formulário está temporariamente indisponível. Tente novamente em instantes.' }, 503); }
 const service = services[d.service];
 const rows: [string, string][] = [['Nome', d.name], ['E-mail', d.email], ['Empresa', d.company || '—'], ['Serviço', service]];
 const html = `<h2>Novo contato pelo site</h2><table cellpadding="6">${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escape(v)}</td></tr>`).join('')}</table><h3>Mensagem</h3><p style="white-space:pre-wrap">${escape(d.message)}</p>`;
 const text = `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMensagem:\n${d.message}`;

 try {
  const response = await fetch('https://api.resend.com/emails', {
   method: 'POST',
   // A chave de idempotência evita e-mail duplicado se o cliente reenviar o mesmo formulário.
   headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': d.idempotencyKey },
   body: JSON.stringify({
    from: process.env.CONTACT_FROM_EMAIL || 'Site Temura <onboarding@resend.dev>',
    to: to.split(',').map(s => s.trim()),
    reply_to: d.email,
    subject: `Novo contato: ${d.name} — ${service}`,
    html, text
   }),
   signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) { console.error('Resend error', response.status, await response.text()); return json({ error: 'Não foi possível enviar agora. Seus dados não foram confirmados. Tente novamente em instantes.' }, 502); }
  return json({ ok: true }, 201);
 } catch {
  console.error('Resend unavailable');
  return json({ error: 'O formulário está temporariamente indisponível. Seus dados não foram confirmados. Tente novamente em instantes.' }, 503);
 }
};

export const config = { path: '/api/leads' };
