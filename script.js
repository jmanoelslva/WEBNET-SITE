// ===== Configuração da WebNet — edite aqui =====
// WhatsApp, links dos apps e da Área do Cliente ficam em config.js.

// Cidades atendidas (aparecem na faixa "A WebNet chega na sua rua?").
// Para incluir uma cidade, acrescente o nome aqui.
const CIDADES_ATENDIDAS = [
  "Propriá",
  "Amparo de São Francisco",
  "Cedro de São João",
  "Malhada dos Bois",
  "São Francisco",
  "Telha",
];

// Incluso em todos os planos (aparece no seletor do topo)
const INCLUSO = ["Wi-Fi incluso", "Instalação grátis", "Sem limite de consumo"];

// Planos residenciais ativos no sistema em 30/09/2026.
// preco em reais; extras = benefícios próprios do plano, além do INCLUSO.
const PLANOS = [
  {
    mega: 150, preco: 64.9, unidade: "Mega",
    para: "Para 1 a 2 pessoas: redes sociais, estudo e vídeos em HD.",
    extras: [],
  },
  {
    mega: 300, preco: 74.9, unidade: "Mega", destaque: "Mais contratado",
    para: "Para 2 a 4 pessoas: streaming em HD, home office e chamadas de vídeo.",
    extras: [],
  },
  {
    mega: 500, preco: 84.9, unidade: "Mega",
    para: "Para 4 a 6 pessoas: vídeo em 4K, chamadas e jogos ao mesmo tempo.",
    extras: [],
  },
  {
    mega: 600, preco: 94.9, unidade: "Mega",
    para: "Para casas cheias e muitos aparelhos, incluindo câmeras e TV smart.",
    extras: [],
  },
  {
    mega: 800, preco: 99.9, unidade: "Mega",
    para: "Para quem trabalha com arquivos pesados, transmite ao vivo ou joga online.",
    extras: [],
  },
];
// ===============================================

// SVA de e-books: acrescenta o benefício aos planos participantes (config.js)
const EBOOKS_ATIVO = typeof SVA_EBOOKS !== "undefined" && SVA_EBOOKS.ativo;
if (EBOOKS_ATIVO) {
  PLANOS.forEach((p) => {
    if (p.unidade === "Mega" && SVA_EBOOKS.planos.includes(p.mega)) p.extras.unshift(`E-books inclusos (${SVA_EBOOKS.nome})`);
  });
}

const nomePlano = (p) => `${p.mega} ${p.unidade}`;
const reais = (v) => Math.floor(v);
const centavos = (v) => String(Math.round((v % 1) * 100)).padStart(2, "0");

// Seletor do topo
const speeds = document.querySelector(".picker__speeds");
const el = (id) => document.getElementById(id);

function escolher(i, focar) {
  const p = PLANOS[i];
  speeds.querySelectorAll("button").forEach((b, j) => {
    b.setAttribute("aria-checked", j === i);
    b.tabIndex = j === i ? 0 : -1;
    if (j === i && focar) b.focus();
  });
  el("pk-speed").textContent = p.mega;
  el("pk-unit").textContent = p.unidade;
  el("pk-price").textContent = reais(p.preco);
  el("pk-cents").textContent = `,${centavos(p.preco)}`;
  el("pk-fit").textContent = p.para;
  el("pk-perks").innerHTML = [...p.extras, ...INCLUSO].map((e) => `<li>${e}</li>`).join("");
  el("pk-cta").href = waLink(`Olá! Quero contratar o plano de ${nomePlano(p)} da WebNet.`);
  el("pk-cta").textContent = `Contratar ${nomePlano(p)} pelo WhatsApp`;
  [el("pk-speed").parentElement, el("pk-price").parentElement].forEach((n) => {
    n.classList.remove("pulse"); void n.offsetWidth; n.classList.add("pulse");
  });
}

PLANOS.forEach((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("role", "radio");
  b.textContent = p.unidade === "Giga" ? "1 Giga" : `${p.mega}`;
  b.setAttribute("aria-label", nomePlano(p));
  b.addEventListener("click", () => escolher(i));
  b.addEventListener("keydown", (e) => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (d) { e.preventDefault(); escolher((i + d + PLANOS.length) % PLANOS.length, true); }
  });
  speeds.appendChild(b);
});
escolher(Math.max(0, PLANOS.findIndex((p) => p.destaque)));

// Cards de planos
el("plans-grid").innerHTML = PLANOS.map((p) => `
  <article class="plan${p.destaque ? " plan--featured" : ""}">
    ${p.destaque ? `<span class="plan__tag">${p.destaque}</span>` : ""}
    <h3 class="plan__speed">${p.mega}<small>${p.unidade}</small></h3>
    <p class="plan__for">${p.para}</p>
    <p class="plan__price">R$ ${reais(p.preco)},${centavos(p.preco)} <small>/mês</small></p>
    ${p.extras.length ? `<ul>${p.extras.map((e) => `<li>${e}</li>`).join("")}</ul>` : ""}
    <a class="btn btn--ghost" href="${waLink(`Olá! Quero contratar o plano de ${nomePlano(p)} da WebNet.`)}" aria-label="Contratar ${nomePlano(p)}">Contratar</a>
  </article>`).join("");

// Consulta de cobertura por cidade: a rua é confirmada pela equipe no WhatsApp
const slugCidade = (c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
el("cidades-lista").innerHTML = CIDADES_ATENDIDAS.map((c) => `<li><a href="internet-fibra-${slugCidade(c)}.html">${c}</a></li>`).join("");
const cidade = el("cidade");
cidade.innerHTML = `<option value="">Selecione…</option>` +
  CIDADES_ATENDIDAS.map((c) => `<option>${c}</option>`).join("") +
  `<option value="outra">Outra cidade</option>`;
function atualizarCobertura() {
  const c = cidade.value;
  const out = el("cobertura-result");
  const wa = el("cobertura-wa");
  if (!c) {
    out.textContent = "";
    wa.href = waLink("Olá! Quero saber se a WebNet atende o meu endereço.");
  } else if (c === "outra") {
    out.textContent = "Ainda não atendemos outras cidades, mas a rede cresce sempre. Fale com a gente pelo WhatsApp.";
    wa.href = waLink("Olá! Vocês atendem a minha cidade? Moro em: ");
  } else {
    out.textContent = `Atendemos ${c}! Confirme sua rua com a nossa equipe pelo WhatsApp.`;
    wa.href = waLink(`Olá! Moro em ${c} e quero confirmar se a WebNet atende o meu endereço: `);
  }
}
cidade.addEventListener("change", atualizarCobertura);
el("cobertura-form").addEventListener("submit", (e) => e.preventDefault());
atualizarCobertura();

// Menu do celular, ano do rodapé, links de WhatsApp e demais itens comuns ficam em comum.js

// Carrossel de novidades
// 1. Tenta ler a listagem da pasta fotos/ direto do servidor (nginx "autoindex", Apache "Indexes"
//    ou servidor local), assim basta enviar a imagem para a pasta.
// 2. Se o servidor não listar a pasta, usa a lista de galeria.js.
// Legendas e botões opcionais sempre vêm de galeria.js, pelo nome do arquivo.
const FORMATOS_IMAGEM = /\.(jpe?g|png|webp|gif|avif|svg|bmp)$/i;

async function listarFotos() {
  const base = typeof GALERIA !== "undefined" ? GALERIA : [];
  const porArquivo = new Map(base.map((g) => [g.imagem.split("/").pop(), g]));
  let arquivos = null;
  try {
    const r = await fetch("fotos/", { headers: { Accept: "application/json, text/html" }, cache: "no-store" });
    if (r.ok) {
      const tipo = r.headers.get("content-type") || "";
      if (tipo.includes("json")) {
        // nginx: autoindex_format json -> [{ name, type, mtime }]
        arquivos = (await r.json())
          .filter((f) => f.type === "file" && FORMATOS_IMAGEM.test(f.name))
          .sort((a, b) => new Date(b.mtime) - new Date(a.mtime))
          .map((f) => f.name);
      } else if (tipo.includes("html")) {
        // listagem em HTML (Apache, nginx em HTML, http-server)
        const doc = new DOMParser().parseFromString(await r.text(), "text/html");
        arquivos = [...new Set([...doc.querySelectorAll("a[href]")]
          .map((a) => decodeURIComponent(a.getAttribute("href").split(/[?#]/)[0].split("/").pop()))
          .filter((n) => FORMATOS_IMAGEM.test(n)))];
        // sem data na listagem: primeiro a ordem de galeria.js, depois as novas por nome
        const ordem = [...porArquivo.keys()];
        arquivos.sort((a, b) => {
          const ia = ordem.indexOf(a), ib = ordem.indexOf(b);
          if (ia >= 0 && ib >= 0) return ia - ib;
          if (ia >= 0 || ib >= 0) return ia >= 0 ? 1 : -1;
          return b.localeCompare(a, "pt-BR", { numeric: true });
        });
      }
    }
  } catch (_) { /* sem listagem: segue com galeria.js */ }

  if (!arquivos || !arquivos.length) return base;
  return arquivos.map((nome) => porArquivo.get(nome) || { imagem: `fotos/${encodeURIComponent(nome)}`, alt: "Novidade da WebNet" });
}

listarFotos().then(function carrossel(itens) {
  const secao = el("novidades");
  const track = el("news-track");
  const dots = el("news-dots");
  if (!secao) return;
  // Sem fotos (ou sem acesso à pasta, como ao abrir o arquivo direto do disco): usa os slides de exemplo
  if (!itens.length) itens = typeof GALERIA_EXEMPLOS !== "undefined" ? GALERIA_EXEMPLOS : [];
  if (!itens.length) { secao.hidden = true; return; }

  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const destino = (link) => (link === "whatsapp" ? waLink("Olá! Vi uma novidade no site da WebNet.") : link);

  // Qualquer proporção de imagem: a foto aparece inteira e uma cópia desfocada preenche o fundo
  track.innerHTML = itens.map((g, i) => {
    const legenda = g.titulo || g.texto || g.link;
    const lazy = i ? ' loading="lazy"' : "";
    return `
    <div class="slide${legenda ? "" : " slide--sem-legenda"}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${itens.length}">
      <img class="slide__fundo" src="${esc(g.imagem)}" alt=""${lazy}>
      <img class="slide__foto" src="${esc(g.imagem)}" alt="${esc(g.alt || "")}"${lazy}>
      ${legenda ? `<div class="slide__caption">
        ${g.titulo ? `<h3>${esc(g.titulo)}</h3>` : ""}
        ${g.texto ? `<p>${esc(g.texto)}</p>` : ""}
        ${g.link ? `<a class="btn btn--lime" href="${esc(destino(g.link))}"${g.link === "whatsapp" || /^https?:/.test(g.link) ? ' target="_blank" rel="noopener"' : ""}>${esc(g.botao || "Saiba mais")}</a>` : ""}
      </div>` : ""}
    </div>`;
  }).join("");

  dots.innerHTML = itens.map((_, i) => `<button type="button" aria-label="Ir para o slide ${i + 1}"></button>`).join("");
  const slides = [...track.children];
  const botoes = [...dots.children];
  let atual = 0;

  const ir = (i) => {
    atual = (i + itens.length) % itens.length;
    track.scrollTo({ left: atual * track.clientWidth, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const marcar = () => {
    atual = Math.round(track.scrollLeft / track.clientWidth);
    botoes.forEach((b, j) => b.setAttribute("aria-current", j === atual));
  };

  secao.querySelectorAll(".news__arrow").forEach((b) => b.addEventListener("click", () => ir(atual + Number(b.dataset.dir))));
  botoes.forEach((b, j) => b.addEventListener("click", () => ir(j)));
  track.addEventListener("scroll", () => requestAnimationFrame(marcar), { passive: true });
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); ir(atual + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); ir(atual - 1); }
  });
  track.tabIndex = 0;
  marcar();

  if (itens.length < 2) { secao.querySelector(".news__controls").hidden = true; dots.hidden = true; }

  // Troca automática. Pausa enquanto o mouse está em cima e por alguns segundos depois de um
  // toque ou clique; o botão pausar/continuar dá o controle ao visitante (acessibilidade).
  // Com "animações reduzidas" no sistema, a troca continua, só que sem deslizar.
  const segundos = typeof GALERIA_AUTOPLAY === "number" ? GALERIA_AUTOPLAY : 0;
  if (segundos > 0 && itens.length > 1) {
    let pausadoPeloBotao = false, mouseEmCima = false, ultimaInteracao = 0;
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "news__pausa";
    const desenhar = () => {
      botao.setAttribute("aria-label", pausadoPeloBotao ? "Continuar a troca automática" : "Pausar a troca automática");
      botao.innerHTML = pausadoPeloBotao
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
    };
    botao.addEventListener("click", () => { pausadoPeloBotao = !pausadoPeloBotao; desenhar(); });
    desenhar();
    dots.prepend(botao);
    const interagiu = () => (ultimaInteracao = Date.now());
    secao.addEventListener("mouseenter", () => (mouseEmCima = true));
    secao.addEventListener("mouseleave", () => (mouseEmCima = false));
    ["touchstart", "pointerdown", "keydown"].forEach((ev) => secao.addEventListener(ev, interagiu, { passive: true }));
    setInterval(() => {
      const recente = Date.now() - ultimaInteracao < segundos * 1500;
      if (!pausadoPeloBotao && !mouseEmCima && !recente && !document.hidden) ir(atual + 1);
    }, segundos * 1000);
  }
});

// Botões das lojas de aplicativos: sem link cadastrado, o botão leva ao WhatsApp
[["app-ios", APP_IOS, "iPhone"], ["app-android", APP_ANDROID, "Android"]].forEach(([id, url, so]) => {
  const a = el(id);
  if (a) a.href = url || waLink(`Olá! Quero o link do app da WebNet para ${so}.`);
});

// Seção do SVA de e-books (conteúdo em config.js > SVA_EBOOKS)
(function ebooks() {
  const secao = el("ebooks");
  if (!secao || !EBOOKS_ATIVO) return;
  const S = SVA_EBOOKS;
  const ICONES = {
    livros: '<path d="M4 19V5a2 2 0 0 1 2-2h4v18H6a2 2 0 0 1-2-2z M10 3h4v18h-4z M14 4.5l3.8-1 3.2 16.4-3.8 1z"/>',
    download: '<path d="M12 3v12 M7 10l5 5 5-5 M4 20h16"/>',
    dispositivos: '<rect x="2" y="4" width="14" height="10" rx="1.5"/><path d="M6 18h6 M9 14v4"/><rect x="17" y="8" width="5" height="11" rx="1.2"/>',
    familia: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0 M13.5 20a4 4 0 0 1 8 0"/>',
  };
  const lista = (arr) => arr.length > 1 ? `${arr.slice(0, -1).join(", ")} e ${arr[arr.length - 1]}` : arr.join("");

  el("ebooks-nome").textContent = S.nome;
  el("ebooks-titulo").textContent = S.chamada;
  el("ebooks-desc").textContent = S.descricao;
  el("ebooks-planos").innerHTML = `Incluso nos planos de <strong>${lista(S.planos.map((m) => `${m} Mega`))}</strong>.`;
  el("ebooks-destaques").innerHTML = S.destaques.map((d) => `
    <li>
      <svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[d.icone] || ICONES.livros}</svg>
      <span><strong>${d.titulo}</strong>${d.texto}</span>
    </li>`).join("");
  // Estante: os livros ficam em prateleiras de 3
  const livros = S.vitrine.map((l, i) => `
      <div class="livro livro--${i % 6}" role="listitem">
        <span class="livro__arte" aria-hidden="true"></span>
        <span class="livro__titulo">${l.titulo}</span>
        <span class="livro__autor">${l.autor}</span>
      </div>`);
  const prateleiras = [];
  for (let i = 0; i < livros.length; i += 3) prateleiras.push(`<div class="prateleira">${livros.slice(i, i + 3).join("")}</div>`);
  el("ebooks-vitrine").innerHTML = prateleiras.join("");
  el("ebooks-passos").innerHTML = S.passos.map((p) => `<li>${p}</li>`).join("");
  el("ebooks-cta").href = waLink(`Olá! Quero um plano da WebNet com os e-books da ${S.nome}.`);
  secao.hidden = false;
})();

// Planos empresariais (config.js > PLANOS_EMPRESA)
(function empresas() {
  const secao = el("empresas");
  if (!secao || typeof PLANOS_EMPRESA === "undefined" || !PLANOS_EMPRESA.ativo) return;
  el("empresas-titulo").textContent = PLANOS_EMPRESA.titulo;
  el("empresas-desc").textContent = PLANOS_EMPRESA.descricao;
  el("empresas-itens").innerHTML = PLANOS_EMPRESA.itens.map((i) => `<li><strong>${i.titulo}</strong>${i.texto}</li>`).join("");
  el("empresas-cta").href = waLink("Olá! Quero conhecer os planos da WebNet para empresas.");
  secao.hidden = false;
})();

// Pré-cadastro "Quero ser cliente": monta a mensagem e abre o WhatsApp (nada é gravado no site)
(function cadastro() {
  const form = el("cadastro-form");
  if (!form) return;
  el("cadastro-cidade").innerHTML = `<option value="">Selecione…</option>` +
    CIDADES_ATENDIDAS.map((c) => `<option>${c}</option>`).join("") + `<option>Outra cidade</option>`;
  el("cadastro-plano").innerHTML = `<option>Ainda não sei</option>` + PLANOS.map((p) => `<option>${nomePlano(p)}</option>`).join("");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const erro = el("cadastro-erro");
    if (!d.nome.trim() || !d.cidade) { erro.textContent = "Preencha o nome e escolha a cidade."; return; }
    erro.textContent = "";
    const msg = [
      "Olá! Quero ser cliente da WebNet.",
      `Nome: ${d.nome.trim()}`,
      `Cidade: ${d.cidade}`,
      d.endereco.trim() && `Endereço: ${d.endereco.trim()}`,
      `Plano de interesse: ${d.plano}`,
      `Melhor horário para contato: ${d.horario}`,
    ].filter(Boolean).join("\n");
    window.open(waLink(msg), "_blank", "noopener");
  });
})();

// "Qual plano é ideal?": 3 perguntas, 0 a 2 pontos cada
(function quiz() {
  const abrir = el("quiz-abrir");
  if (!abrir) return;
  const perguntas = [
    { t: "Quantas pessoas usam a internet na sua casa?", o: ["1 ou 2", "3 ou 4", "5 ou mais"] },
    { t: "O que vocês mais fazem na internet?", o: ["Redes sociais e vídeos", "Filmes e séries em HD ou 4K", "Jogos online, lives ou arquivos pesados"] },
    { t: "Quantos aparelhos ficam conectados ao mesmo tempo?", o: ["Até 5", "De 6 a 10", "Mais de 10 (TVs, câmeras…)"] },
  ];
  // pontuação total (0–6) → posição do plano na lista, do mais leve ao mais rápido
  const indice = (pts) => Math.min(PLANOS.length - 1, [0, 0, 1, 2, 3, 4, 4][pts]);
  const dlg = document.createElement("dialog");
  dlg.className = "modal quiz";
  dlg.setAttribute("aria-labelledby", "quiz-titulo");
  document.body.appendChild(dlg);
  let respostas = [];

  function mostrar() {
    const i = respostas.length;
    const fechar = `<button class="modal__fechar" type="button" aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    if (i < perguntas.length) {
      const q = perguntas[i];
      dlg.innerHTML = `${fechar}<p class="quiz__passo">Pergunta ${i + 1} de ${perguntas.length}</p>
        <h2 id="quiz-titulo">${q.t}</h2>
        <div class="quiz__opcoes">${q.o.map((o, n) => `<button type="button" class="quiz__opcao" data-pts="${n}">${o}</button>`).join("")}</div>`;
      dlg.querySelectorAll(".quiz__opcao").forEach((b) => b.addEventListener("click", () => { respostas.push(+b.dataset.pts); mostrar(); }));
      dlg.querySelector(".quiz__opcao").focus();
    } else {
      const p = PLANOS[indice(respostas.reduce((a, b) => a + b, 0))];
      dlg.innerHTML = `${fechar}<p class="quiz__passo">Resultado</p>
        <h2 id="quiz-titulo">O plano ideal para você é o de ${nomePlano(p)}</h2>
        <div class="quiz__resultado">
          <span class="plan__speed">${p.mega}<small>${p.unidade}</small></span>
          <span class="plan__price">R$ ${reais(p.preco)},${centavos(p.preco)} <small>/mês</small></span>
          <p>${p.para}</p>
        </div>
        <div class="quiz__acoes">
          <a class="btn btn--lime btn--wa" target="_blank" rel="noopener" data-evento="quiz-contratar" href="${waLink(`Olá! Fiz o teste no site e quero contratar o plano de ${nomePlano(p)} da WebNet.`)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icone-whatsapp"/></svg> Contratar pelo WhatsApp</a>
          <button type="button" class="btn btn--ghost" id="quiz-refazer">Refazer o teste</button>
        </div>`;
      dlg.querySelector("#quiz-refazer").addEventListener("click", () => { respostas = []; mostrar(); });
    }
    dlg.querySelector(".modal__fechar").addEventListener("click", () => dlg.close());
  }
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  abrir.addEventListener("click", () => { respostas = []; mostrar(); dlg.showModal(); });
})();

// Depoimentos (config.js > DEPOIMENTOS): só aparecem se houver depoimentos reais cadastrados
(function depoimentos() {
  const secao = el("depoimentos");
  if (!secao || typeof DEPOIMENTOS === "undefined" || !DEPOIMENTOS.ativo || !DEPOIMENTOS.lista.length) return;
  const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  el("depoimentos-lista").innerHTML = DEPOIMENTOS.lista.map((d) => `
    <li class="depoimento">
      <blockquote>${esc(d.texto)}</blockquote>
      <p class="depoimento__autor"><strong>${esc(d.nome)}</strong>${d.cidade ? ` · ${esc(d.cidade)}` : ""}</p>
    </li>`).join("");
  if (DEPOIMENTOS.avaliarGoogleUrl) {
    const a = el("depoimentos-avaliar");
    a.href = DEPOIMENTOS.avaliarGoogleUrl;
    a.hidden = false;
  }
  secao.hidden = false;
})();
