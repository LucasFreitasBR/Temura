"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  Plus,
  Minus,
  Menu,
  X,
  Check,
  LoaderCircle,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const services = [
  {
    number: "01",
    title: "Sites &\nlanding pages.",
    tag: "DESIGN QUE CONVERTE",
    text: "A primeira impressão abre portas. Criamos experiências digitais que traduzem sua marca e tornam o próximo passo do seu cliente simples.",
    items: [
      "Design sob medida",
      "Experiência mobile",
      "Desenvolvimento & performance",
    ],
    word: "PRESENÇA",
    kind: "web",
  },
  {
    number: "02",
    title: "Tráfego\npago.",
    tag: "ESTRATÉGIA QUE CONECTA",
    text: "Sua marca na frente de quem importa. Planejamos campanhas, acompanhamos os dados e ajustamos a rota para atrair oportunidades reais.",
    items: [
      "Estratégia de campanhas",
      "Google & Meta Ads",
      "Análise & otimização",
    ],
    word: "ALCANCE",
    kind: "ads",
  },
  {
    number: "03",
    title: "Imagem que\nconta histórias.",
    tag: "CONTEÚDO QUE APROXIMA",
    text: "Damos forma ao que torna sua marca única. Captação de fotos e vídeos para apresentar seu negócio, seus produtos e as pessoas por trás dele.",
    items: [
      "Captação de fotos & vídeos",
      "Conteúdo para redes sociais",
      "Criativos para campanhas",
    ],
    word: "CONEXÃO",
    kind: "film",
  },
];
const questions = [
  [
    "Posso contratar apenas um serviço?",
    "Sim. Podemos criar apenas seu site, cuidar de uma campanha ou produzir fotos e vídeos. Também conectamos as três frentes quando isso faz sentido para o seu momento.",
  ],
  [
    "Como funciona o orçamento?",
    "Começamos entendendo seu negócio, objetivo e necessidades. Com esse contexto, desenhamos o escopo e enviamos uma proposta com entregas, prazo e investimento.",
  ],
  [
    "Ainda não tenho fotos ou conteúdo. Podemos começar?",
    "Sim. Organizamos a estrutura e a direção visual primeiro. Depois, podemos planejar a captação e desenvolver os materiais para completar seu projeto.",
  ],
  [
    "O site vai funcionar no celular?",
    "Sim. A experiência é pensada para celular, tablet e computador, com atenção à leitura, navegação e velocidade.",
  ],
];

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const started = useRef(Date.now());
  const key = useRef("");
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    key.current = crypto.randomUUID();
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.to(".hero-art", {
          yPercent: 24,
          scale: 1.14,
          rotation: 8,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(".hero-title", {
          y: 110,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(".marquee-track", {
          xPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: ".marquee",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.utils
          .toArray<HTMLElement>(".reveal")
          .forEach((el) =>
            gsap.from(el, {
              y: 38,
              opacity: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: { trigger: el, start: "top 93%", once: true },
            }),
          );
        gsap.utils
          .toArray<HTMLElement>(".service-art")
          .forEach((el) =>
            gsap.fromTo(
              el,
              { yPercent: -8 },
              {
                yPercent: 8,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest(".service-card"),
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1,
                },
              },
            ),
          );
        gsap.to(".statement-word", {
          xPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: ".statement",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      }, root);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);
  useEffect(() => {
    if (privacy) dialog.current?.showModal();
    else dialog.current?.close();
  }, [privacy]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          service: data.get("service"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          startedAt: started.current,
          idempotencyKey: key.current,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ||
            "Não foi possível enviar agora. Tente novamente em instantes.",
        );
      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && error.name === "TimeoutError"
          ? "O envio demorou mais que o esperado. Tente novamente; não criaremos um contato duplicado."
          : error instanceof Error
            ? error.message
            : "Verifique sua conexão e tente novamente.",
      );
    }
  }
  return (
    <main ref={root} id="inicio">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="header">
        <a href="#inicio" className="logo" aria-label="Temura — início">
          temura<span>®</span>
        </a>
        <nav
          aria-label="Navegação principal"
          className={menu ? "nav is-open" : "nav"}
        >
          <a href="#sobre" onClick={() => setMenu(false)}>
            O estúdio
          </a>
          <a href="#servicos" onClick={() => setMenu(false)}>
            O que fazemos
          </a>
          <a href="#processo" onClick={() => setMenu(false)}>
            Como fazemos
          </a>
          <a className="nav-cta" href="#contato" onClick={() => setMenu(false)}>
            Vamos conversar <ArrowUpRight size={17} />
          </a>
        </nav>
        <button
          className="menu-toggle"
          aria-label={menu ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      <section className="hero" id="conteudo" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-meta">
          <span>
            <i /> ESTÚDIO CRIATIVO & DIGITAL
          </span>
          <span>ESTRATÉGIA. DESIGN. MOVIMENTO.</span>
        </div>
        <img
          className="hero-art"
          src="/temura-chrome.webp"
          alt=""
          fetchPriority="high"
          width="1536"
          height="1024"
        />
        <div className="hero-content">
          <h1 className="hero-title" id="hero-title">
            Sua marca.
            <br />O próximo
            <br />
            <span>movimento.</span>
          </h1>
        </div>
        <div className="hero-bottom">
          <a href="#sobre" className="scroll-cue">
            <span className="circle">
              <ArrowDown size={20} />
            </span>
            <span>
              ROLE PARA
              <br />
              DESCOBRIR
            </span>
          </a>
          <div className="hero-description">
            <p>
              Conectamos design, tráfego e imagem
              <br className="desktop-break" /> para transformar presença em
              possibilidade.
            </p>
            <a className="text-link" href="#contato">
              Vamos criar algo juntos <ArrowUpRight size={19} />
            </a>
          </div>
          <span className="hero-index">01 — 05</span>
        </div>
      </section>
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          IDEIAS EM MOVIMENTO <span>✳</span> MARCAS EM EVIDÊNCIA <span>✳</span>{" "}
          IDEIAS EM MOVIMENTO <span>✳</span> MARCAS EM EVIDÊNCIA <span>✳</span>
        </div>
      </div>
      <section id="sobre" className="about section-pad">
        <div className="section-label">
          <span>01 / O ESTÚDIO</span>
          <span>INDEPENDENTE POR NATUREZA.</span>
        </div>
        <div className="about-grid">
          <div className="about-mark" aria-hidden="true">
            t<span>↗</span>
          </div>
          <div>
            <h2 className="reveal">
              Boas marcas
              <br />
              não ficam <em>paradas.</em>
              <br />A gente também não.
            </h2>
            <div className="about-copy reveal">
              <p>
                Somos a Temura. Um estúdio que nasce para aproximar marcas e
                pessoas por meio de experiências digitais, estratégia e
                conteúdo.
              </p>
              <p>
                Do primeiro clique à próxima conversa, cada detalhe tem um
                propósito: fazer seu negócio se apresentar melhor e chegar mais
                longe.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="servicos" className="services section-pad">
        <div className="section-label">
          <span>02 / O QUE FAZEMOS</span>
          <span>TRÊS FRENTES. UMA DIREÇÃO.</span>
        </div>
        <div className="section-heading reveal">
          <h2>
            Da atenção
            <br />à <em>ação.</em>
          </h2>
          <p>
            O encontro entre o que sua marca é<br />e o que ela pode se tornar.
          </p>
        </div>
        <div className="service-stack">
          {services.map((s) => (
            <article className={"service-card " + s.kind} key={s.number}>
              <div className="service-copy">
                <div className="service-top">
                  <span>/{s.number}</span>
                  <span>{s.tag}</span>
                </div>
                <h3>
                  {s.title.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h3>
                <p>{s.text}</p>
                <ul>
                  {s.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <a
                  href={"#contato"}
                  className="text-link"
                  onClick={() => {
                    const sel =
                      document.querySelector<HTMLSelectElement>("#service");
                    if (sel) sel.value = s.kind;
                  }}
                >
                  Quero saber mais <ArrowUpRight size={20} />
                </a>
              </div>
              <div className="service-visual" aria-hidden="true">
                <div className="service-art">
                  {s.kind === "web" ? (
                    <div className="browser-design">
                      <div className="browser-bar">
                        <i />
                        <i />
                        <i />
                        <span>UMA NOVA PERSPECTIVA</span>
                      </div>
                      <div className="browser-content">
                        <span className="mini-brand">sua marca®</span>
                        <strong>
                          FEITO PARA
                          <br />
                          <em>IR ALÉM.</em>
                        </strong>
                        <div className="mini-line" />
                        <span>DESIGN COM INTENÇÃO. ↗</span>
                      </div>
                    </div>
                  ) : s.kind === "ads" ? (
                    <div className="ads-design">
                      <span>O PRÓXIMO NÍVEL</span>
                      <div className="chart-art">
                        <div />
                        <div />
                        <div />
                        <div />
                        <div />
                      </div>
                      <strong>
                        Mais perto.
                        <br />
                        Mais longe.
                      </strong>
                      <ArrowUpRight size={100} strokeWidth={1} />
                    </div>
                  ) : (
                    <div className="film-design">
                      <div className="film-top">
                        <span>
                          REC <i />
                        </span>
                        <span>TEMURA STUDIO</span>
                      </div>
                      <img
                        src="/temura-chrome.webp"
                        alt=""
                        width="1536"
                        height="1024"
                        loading="lazy"
                      />
                      <div className="film-cross">+</div>
                      <span className="film-caption">
                        OUTRO OLHAR.
                        <br />A SUA ESSÊNCIA.
                      </span>
                      <span className="film-bottom">
                        [ ENQUADRE O EXTRAORDINÁRIO ]
                      </span>
                    </div>
                  )}
                </div>
                <div className="visual-caption">
                  <span>{s.word}</span>
                  <span>ESTÚDIO TEMURA / {s.number}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="statement" aria-label="Criatividade com direção">
        <div className="statement-word" aria-hidden="true">
          CRIATIVIDADE
        </div>
        <div className="statement-inner">
          <span>
            MENOS DO MESMO?
            <br />
            NÃO É COM A GENTE.
          </span>
          <h2>
            Criatividade
            <br />
            com <em>direção.</em>
          </h2>
          <a href="#contato" aria-label="Conversar sobre meu projeto">
            <ArrowUpRight strokeWidth={1} />
          </a>
        </div>
      </section>
      <section id="processo" className="process section-pad">
        <div className="section-label">
          <span>03 / COMO FAZEMOS</span>
          <span>DO SEU MOMENTO AO PRÓXIMO PASSO.</span>
        </div>
        <div className="process-grid">
          <h2 className="reveal">
            Clareza no caminho.
            <br />
            <em>Intenção</em>
            <br />
            em cada etapa.
          </h2>
          <div className="steps">
            {[
              [
                "Escutar.",
                "Antes de criar, entendemos. Seu negócio, seu público e o que você quer alcançar.",
              ],
              [
                "Construir.",
                "Transformamos a estratégia em design, campanhas e conteúdo. Com você por perto.",
              ],
              [
                "Colocar em movimento.",
                "Publicamos, acompanhamos e identificamos o que pode evoluir. O lançamento é só o começo.",
              ],
            ].map(([title, text], i) => (
              <div className="step reveal" key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <Plus size={20} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="faq section-pad">
        <div className="section-label">
          <span>04 / SEM COMPLICAÇÃO</span>
        </div>
        <div className="faq-grid">
          <h2 className="reveal">
            Antes do
            <br />
            <em>primeiro oi.</em>
          </h2>
          <div>
            {questions.map(([q, a], i) => (
              <div className="faq-item" key={q}>
                <h3>
                  <button
                    aria-expanded={open === i}
                    aria-controls={"answer-" + i}
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    {q}
                    {open === i ? <Minus size={20} /> : <Plus size={20} />}
                  </button>
                </h3>
                <div id={"answer-" + i} hidden={open !== i}>
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="contato" className="contact section-pad">
        <div className="section-label">
          <span>05 / SEU PRÓXIMO MOVIMENTO</span>
          <span>ABERTOS A NOVAS CONEXÕES.</span>
        </div>
        <div className="contact-grid">
          <div>
            <h2 className="reveal">
              Toda grande
              <br />
              ideia começa
              <br />
              com um <em>oi.</em>
            </h2>
            <p>
              Conte um pouco sobre o seu momento.
              <br />
              Vamos descobrir o que podemos criar juntos.
            </p>
            <ArrowUpRight
              className="contact-arrow"
              size={100}
              strokeWidth={1}
            />
          </div>
          <form onSubmit={submit} className="contact-form">
            <div className="field-pair">
              <label>
                Seu nome *
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </label>
              <label>
                Empresa
                <input
                  name="company"
                  autoComplete="organization"
                  placeholder="Nome da sua marca"
                  maxLength={120}
                />
              </label>
            </div>
            <label>
              E-mail *
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com.br"
                required
                maxLength={254}
              />
            </label>
            <label>
              O que você tem em mente? *
              <select name="service" id="service" required defaultValue="">
                <option value="" disabled>
                  Selecione um serviço
                </option>
                <option value="web">Site ou landing page</option>
                <option value="ads">Tráfego pago</option>
                <option value="film">Fotos e vídeos</option>
                <option value="complete">Quero conectar tudo</option>
                <option value="talk">Vamos descobrir juntos</option>
              </select>
            </label>
            <label>
              Conte um pouco sobre seu projeto *
              <textarea
                name="message"
                placeholder="Sua ideia, seu desafio ou o próximo passo da sua marca…"
                required
                minLength={10}
                maxLength={3000}
                rows={3}
              />
            </label>
            <div className="honeypot" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <label className="consent">
              <input type="checkbox" name="consent" required />
              <span>
                Concordo com o uso dos meus dados para responder a este contato,
                conforme o{" "}
                <button type="button" onClick={() => setPrivacy(true)}>
                  aviso de privacidade
                </button>
                .
              </span>
            </label>
            <button
              className="submit-button"
              disabled={status === "sending" || status === "success"}
              type="submit"
            >
              {status === "sending" ? (
                <>
                  Enviando <LoaderCircle className="spin" size={21} />
                </>
              ) : status === "success" ? (
                <>
                  Mensagem recebida <Check size={22} />
                </>
              ) : (
                <>
                  Vamos começar <ArrowUpRight size={23} />
                </>
              )}
            </button>
            <div aria-live="polite" className={"form-feedback " + status}>
              {status === "success"
                ? "Obrigado pelo contato! Sua mensagem foi registrada para a Temura retornar pelo e-mail informado."
                : status === "error"
                  ? message
                  : ""}
            </div>
          </form>
        </div>
      </section>
      <footer className="footer">
        <div className="footer-top">
          <a
            href="#inicio"
            className="footer-word"
            aria-label="Temura — voltar ao início"
          >
            temura<span>®</span>
          </a>
          <a href="#inicio" className="back-top" aria-label="Voltar ao início">
            <ArrowUpRight size={32} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TEMURA. IDEIAS EM MOVIMENTO.</span>
          <button onClick={() => setPrivacy(true)}>Privacidade</button>
          <span>FEITO COM INTENÇÃO. NO BRASIL.</span>
        </div>
      </footer>
      <dialog
        ref={dialog}
        aria-labelledby="privacy-title"
        className="privacy-dialog"
        onCancel={() => setPrivacy(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setPrivacy(false);
        }}
      >
        <button
          className="dialog-close"
          autoFocus
          onClick={() => setPrivacy(false)}
          aria-label="Fechar aviso de privacidade"
        >
          <X />
        </button>
        <span className="eyebrow">TEMURA / PRIVACIDADE</span>
        <h2 id="privacy-title">
          Seu contato,
          <br />
          com cuidado.
        </h2>
        <p>
          O formulário coleta nome, e-mail, empresa (opcional), serviço de
          interesse e a mensagem para que a Temura possa avaliar a solicitação e
          retornar o contato.
        </p>
        <p>
          Os dados são armazenados em banco de dados no servidor e não ficam
          disponíveis publicamente. Não utilizamos este formulário para
          inscrever você em listas de marketing. Contatos com mais de 180 dias
          são removidos na próxima limpeza, realizada ao receber um novo envio
          válido.
        </p>
        <p>
          Usamos um identificador técnico temporário, derivado do endereço de
          rede, para limitar envios abusivos. Ele expira em 24 horas e é
          removido na próxima limpeza automática. Este site não instala cookies
          de publicidade.
        </p>
        <p>
          Para solicitar correção ou exclusão, informe esse pedido pelo
          formulário usando o mesmo e-mail do contato original. Não envie
          senhas, documentos ou outros dados sensíveis.
        </p>
        <button className="submit-button" onClick={() => setPrivacy(false)}>
          Entendi <Check size={20} />
        </button>
      </dialog>
    </main>
  );
}
