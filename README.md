# Temura

Site em React 19 e Next.js 16, com GSAP ScrollTrigger. Interface exportada pelo Next.js; a API de contato roda separadamente em Cloudflare Workers com banco D1. Não depende de um servidor Node.js em produção; Node.js é usado no desenvolvimento e build.

## Desenvolvimento

Instale com `pnpm install`. Execute `pnpm dev` para editar o visual. A API só está disponível na prévia completa: execute `pnpm db:generate` ao mudar o schema, `pnpm build`, `pnpm exec wrangler d1 migrations apply temura-local --local` e `pnpm preview`.

## Formulário

Os contatos ficam na tabela `leads`, acessível pelas ferramentas autenticadas do proprietário do Site. Não há endpoint público de listagem, nem envio de e-mail automático. A API usa validação no servidor, SQL parametrizado, verificação de origem, limite de tamanho, honeypot, limite de 5 tentativas por hora por identificador de rede e chave de idempotência. Falhas preservam o conteúdo do formulário. O limite por IP reduz abuso, mas não substitui uma solução de desafio contra bots distribuídos.

Identificadores técnicos expiram em 24 horas e registros antigos após 180 dias; a limpeza ocorre no próximo envio válido. Não enviar dados sensíveis pelo formulário. A política de retenção e os dados oficiais do responsável devem ser revisados antes de abrir o site para clientes. O Site é publicado inicialmente como privado para revisão do proprietário.

## Próximas personalizações

- Trocar a arte de `public/temura-chrome.webp` por imagens reais e adicionar trabalhos apenas quando fornecidos.
- Cadastrar contato oficial, domínio e informações do responsável no aviso de privacidade.
- Revisar retenção de contatos e definir acesso operacional ao banco ou integrar um CRM.
- Revisar os metadados `robots` (atualmente noindex), configurar domínio e acesso público quando aprovado.

O site respeita redução de movimento. Não contém clientes, depoimentos, resultados ou métricas fictícios. O gráfico é uma composição visual do serviço, sem dados de desempenho.
