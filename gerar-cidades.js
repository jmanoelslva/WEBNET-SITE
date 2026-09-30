// Gera uma página por cidade atendida (internet-fibra-<cidade>.html) e atualiza o sitemap.xml.
// Rode de novo sempre que mudar planos, preços ou cidades em script.js:
//   node gerar-cidades.js
// As páginas usam o mesmo cabeçalho e rodapé da página de Termos de Uso.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RAIZ = __dirname;
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), "utf8");
const pegar = (fonte, nome) => {
  // lista numa linha só ou em várias linhas (terminando em "\n];")
  const m = fonte.match(new RegExp(`const ${nome} = (\\[[^\\n]*\\]);`)) || fonte.match(new RegExp(`const ${nome} = (\\[[\\s\\S]*?\\n\\]);`));
  if (!m) throw new Error(`${nome} não encontrado`);
  return vm.runInNewContext(`(${m[1]})`);
};
const script = ler("script.js");
const CIDADES = pegar(script, "CIDADES_ATENDIDAS");
const PLANOS = pegar(script, "PLANOS");
const INCLUSO = pegar(script, "INCLUSO");
const cfg = {};
vm.runInNewContext(ler("config.js") + ";this.W=WHATSAPP;this.E=typeof SVA_EBOOKS!=='undefined'?SVA_EBOOKS:null;", cfg);

const slug = (c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const arquivo = (c) => `internet-fibra-${slug(c)}.html`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const wa = (msg) => `https://wa.me/${cfg.W}?text=${encodeURIComponent(msg)}`;
const nomePlano = (p) => `${p.mega} ${p.unidade}`;
const preco = (v) => `R$ ${Math.floor(v)},${String(Math.round((v % 1) * 100)).padStart(2, "0")}`;
const ebooks = (p) => cfg.E && cfg.E.ativo && p.unidade === "Mega" && cfg.E.planos.includes(p.mega) ? [`E-books inclusos (${cfg.E.nome})`] : [];

const base = ler("termos.html");
const ini = base.indexOf("  <main id=\"conteudo\""), fim = base.indexOf("</main>") + "</main>".length;

function pagina(cidade) {
  const outras = CIDADES.filter((c) => c !== cidade);
  const titulo = `Internet fibra em ${cidade} – SE | WebNet`;
  const desc = `Internet fibra óptica em ${cidade} (SE) com a WebNet: planos de ${PLANOS[0].mega} a ${PLANOS[PLANOS.length - 1].mega} ${PLANOS[PLANOS.length - 1].unidade}, Wi-Fi incluso e suporte pelo WhatsApp.`;
  const cards = PLANOS.map((p) => `
          <article class="plan${p.destaque ? " plan--featured" : ""}">
            ${p.destaque ? `<span class="plan__tag">${esc(p.destaque)}</span>` : ""}
            <h3 class="plan__speed">${p.mega}<small>${p.unidade}</small></h3>
            <p class="plan__for">${esc(p.para)}</p>
            <p class="plan__price">${preco(p.preco)} <small>/mês</small></p>
            ${ebooks(p).length ? `<ul>${ebooks(p).map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}
            <a class="btn btn--ghost" href="${esc(wa(`Olá! Moro em ${cidade} e quero contratar o plano de ${nomePlano(p)} da WebNet.`))}" target="_blank" rel="noopener" data-evento="cidade-contratar" aria-label="Contratar ${nomePlano(p)} em ${esc(cidade)}">Contratar</a>
          </article>`).join("");
  const ld = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Internet fibra em ${cidade}`,
    serviceType: "Provedor de internet fibra óptica",
    provider: { "@id": "__SITE_URL__/#empresa", "@type": "LocalBusiness", name: "WebNet Conexão em Alta Velocidade", url: "__SITE_URL__/" },
    areaServed: { "@type": "City", name: `${cidade} - SE` },
    offers: PLANOS.map((p) => ({ "@type": "Offer", name: `Plano ${nomePlano(p)}`, price: p.preco.toFixed(2), priceCurrency: "BRL" })),
  };

  const main = `  <main id="conteudo" class="cidade">
    <section class="cidade__topo">
      <div class="wrap">
        <nav class="migalhas" aria-label="Você está em"><a href="index.html">Início</a> <span aria-hidden="true">›</span> <a href="index.html#cobertura">Cidades atendidas</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(cidade)}</span></nav>
        <h1>Internet fibra em ${esc(cidade)} – SE</h1>
        <p class="cidade__lead">A WebNet leva internet fibra óptica para ${esc(cidade)}, com Wi-Fi incluso, equipe técnica da região e suporte pelo WhatsApp e pelo app WebNet SE.</p>
        <div class="cidade__acoes">
          <a class="btn btn--lime btn--wa" href="${esc(wa(`Olá! Moro em ${cidade} e quero confirmar se a WebNet atende o meu endereço: `))}" target="_blank" rel="noopener" data-evento="cidade-cobertura">
            <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icone-whatsapp"/></svg>
            Confirmar cobertura na minha rua
          </a>
          <a class="btn btn--light" href="#planos-cidade">Ver planos</a>
        </div>
      </div>
    </section>

    <section class="plans" id="planos-cidade">
      <div class="wrap">
        <div class="section-head">
          <h2>Planos de internet em ${esc(cidade)}</h2>
          <p>Todos com ${esc(INCLUSO.map((i) => i.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " e $1"))}.</p>
        </div>
        <div class="plans__grid">${cards}
        </div>
        <p class="fine">A cobertura é confirmada rua a rua pela nossa equipe. Consulte as condições de instalação para o seu endereço.</p>
      </div>
    </section>

    <section class="cidade__passos">
      <div class="wrap">
        <h2>Como contratar em ${esc(cidade)}</h2>
        <ol>
          <li><strong>Fale com a gente</strong> pelo WhatsApp e informe sua rua em ${esc(cidade)}.</li>
          <li><strong>Confirmamos a cobertura</strong> e combinamos o melhor dia para a instalação.</li>
          <li><strong>Pronto:</strong> internet funcionando e suporte pelo WhatsApp e pelo app WebNet SE.</li>
        </ol>
      </div>
    </section>

    <section class="faq">
      <div class="wrap faq__grid">
        <h2>Dúvidas sobre a WebNet em ${esc(cidade)}</h2>
        <div class="faq__list">
          <details>
            <summary>A WebNet atende toda a cidade de ${esc(cidade)}?</summary>
            <p>Atendemos ${esc(cidade)} e seguimos ampliando a rede. Como a cobertura depende da rua, a confirmação é feita pela nossa equipe: é só mandar seu endereço pelo WhatsApp.</p>
          </details>
          <details>
            <summary>Como falo com o suporte morando em ${esc(cidade)}?</summary>
            <p>Pelo WhatsApp (79) 9844-1264, pelo app WebNet SE ou na nossa loja na Praça Fausto Cardoso, 90, em Propriá.</p>
          </details>
          <details>
            <summary>Como pago a mensalidade?</summary>
            <p>Pela Área do Cliente, no site ou no app WebNet SE, onde você consulta faturas e pega a 2ª via.</p>
          </details>
        </div>
      </div>
    </section>

    <section class="cidade__outras">
      <div class="wrap">
        <h2>Outras cidades atendidas</h2>
        <ul>${outras.map((c) => `<li><a href="${arquivo(c)}">Internet em ${esc(c)}</a></li>`).join("")}</ul>
      </div>
    </section>
  </main>`;

  let h = base.slice(0, ini) + main + base.slice(fim);
  h = h
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="__SITE_URL__/${arquivo(cidade)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(titulo)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="__SITE_URL__/${arquivo(cidade)}">`)
    .replace(/ aria-current="page">Termos de uso/, ">Termos de uso")
    .replace(/(<meta name="twitter:card"[^>]*>)/, `$1\n  <script type="application/ld+json">${JSON.stringify(ld)}</script>`);
  return h;
}

for (const c of CIDADES) fs.writeFileSync(path.join(RAIZ, arquivo(c)), pagina(c));

// sitemap.xml
const urls = ["", "privacidade.html", "termos.html", ...CIDADES.map(arquivo)];
const prio = (u) => (u === "" ? "1.0" : u.startsWith("internet-fibra-") ? "0.8" : "0.3");
fs.writeFileSync(path.join(RAIZ, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>__SITE_URL__/${u}</loc><lastmod>__DATA__</lastmod><priority>${prio(u)}</priority></url>`).join("\n")}
</urlset>
`);
console.log(`Páginas geradas: ${CIDADES.map(arquivo).join(", ")}`);
