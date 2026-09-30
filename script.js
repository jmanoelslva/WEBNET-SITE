// ===== Configuração da WebNet — edite aqui =====
const WHATSAPP = "5500000000000"; // DDI + DDD + número, só dígitos

// CEPs atendidos (prefixos). Propriá-SE usa CEP único 49940-000.
// Para incluir povoados ou cidades vizinhas, acrescente os prefixos aqui.
const CEPS_ATENDIDOS = ["49940"];

const PLANOS = [
  {
    mega: 300, preco: 79, unidade: "Mega",
    para: "Para 1 a 3 pessoas: streaming em HD, redes sociais e home office.",
    extras: ["Wi-Fi dual band", "Instalação grátis", "Sem limite de consumo"],
  },
  {
    mega: 500, preco: 99, unidade: "Mega", destaque: "Mais contratado",
    para: "Para 4 a 6 pessoas: vídeo em 4K, chamadas e jogos ao mesmo tempo.",
    extras: ["Roteador Wi-Fi 6", "Instalação grátis", "Sem limite de consumo"],
  },
  {
    mega: 700, preco: 129, unidade: "Mega",
    para: "Para casas cheias e muitos aparelhos, incluindo câmeras e TV smart.",
    extras: ["Roteador Wi-Fi 6", "1 repetidor mesh", "Suporte prioritário"],
  },
  {
    mega: 1, preco: 169, unidade: "Giga",
    para: "Para quem trabalha com arquivos pesados, transmite ao vivo ou joga online.",
    extras: ["Roteador Wi-Fi 6", "2 repetidores mesh", "Suporte prioritário"],
  },
];
// ===============================================

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
const nomePlano = (p) => `${p.mega} ${p.unidade}`;

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
  el("pk-price").textContent = p.preco;
  el("pk-fit").textContent = p.para;
  el("pk-perks").innerHTML = p.extras.map((e) => `<li>${e}</li>`).join("");
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
    <p class="plan__price">R$ ${p.preco},90 <small>/mês</small></p>
    <ul>${p.extras.map((e) => `<li>${e}</li>`).join("")}</ul>
    <a class="btn btn--ghost" href="${waLink(`Olá! Quero contratar o plano de ${nomePlano(p)} da WebNet.`)}">Contratar ${nomePlano(p)}</a>
  </article>`).join("");

// Consulta de CEP
const cep = el("cep");
cep.addEventListener("input", () => {
  const d = cep.value.replace(/\D/g, "").slice(0, 8);
  cep.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
});
el("cep-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const d = cep.value.replace(/\D/g, "");
  const out = el("cep-result");
  if (d.length !== 8) { out.textContent = "Digite os 8 números do CEP."; return; }
  if (CEPS_ATENDIDOS.some((pre) => d.startsWith(pre))) {
    out.innerHTML = `Boa notícia: atendemos o CEP ${cep.value}. <a href="#planos">Escolha seu plano</a>.`;
  } else {
    out.innerHTML = `Ainda não confirmamos cobertura no CEP ${cep.value}. <a href="${waLink(`Olá! Vocês atendem o CEP ${cep.value}?`)}">Pergunte pelo WhatsApp</a> — a rede cresce todo mês.`;
  }
});

// WhatsApp genérico
document.querySelectorAll("[data-wa]").forEach((a) => (a.href = waLink("Olá! Gostaria de falar com a WebNet.")));

// Menu mobile
const menuBtn = document.querySelector(".menu-btn");
const menu = el("mobile-menu");
menuBtn.addEventListener("click", () => {
  const aberto = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", !aberto);
  menu.hidden = aberto;
});
menu.addEventListener("click", (e) => { if (e.target.tagName === "A") { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); } });

el("year").textContent = new Date().getFullYear();
