// Itens comuns a todas as páginas: menu do celular, rodapé, links de WhatsApp,
// botão flutuante do WhatsApp, aviso no topo e estatísticas (opcionais, em config.js).
(function comum() {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const guardar = { ler: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } },
                    gravar: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} } };

  // Menu do celular
  const menuBtn = $(".menu-btn");
  const menu = $("#mobile-menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const aberto = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!aberto));
      menu.hidden = aberto;
    });
    menu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
    });
  }

  // Ano do rodapé
  $$("#year").forEach((e) => (e.textContent = new Date().getFullYear()));

  // Links de WhatsApp: [data-wa] mensagem geral, [data-wa-msg="..."] mensagem própria
  $$("[data-wa]").forEach((a) => (a.href = waLink("Olá! Gostaria de falar com a WebNet.")));
  $$("[data-wa-msg]").forEach((a) => (a.href = waLink(a.dataset.waMsg)));

  // Teste de velocidade
  if (typeof TESTE_VELOCIDADE_URL !== "undefined" && TESTE_VELOCIDADE_URL) {
    $$("[data-teste-velocidade]").forEach((a) => (a.href = TESTE_VELOCIDADE_URL));
  }

  // Rodapé: contrato (só aparece se houver arquivo) e "Trabalhe conosco"
  $$("[data-contrato]").forEach((a) => {
    if (typeof CONTRATO_URL !== "undefined" && CONTRATO_URL) a.href = CONTRATO_URL;
    else a.closest("li")?.remove();
  });
  $$("[data-trabalhe]").forEach((a) => {
    const email = typeof TRABALHE_CONOSCO_EMAIL !== "undefined" ? TRABALHE_CONOSCO_EMAIL : "";
    if (email) a.href = `mailto:${email}?subject=${encodeURIComponent("Trabalhe conosco — WebNet")}`;
    else a.closest("li")?.remove();
  });

  // Botão flutuante do WhatsApp
  if (!$(".wa-flutuante")) {
    const wa = document.createElement("a");
    wa.className = "wa-flutuante";
    wa.href = waLink("Olá! Vim pelo site da WebNet e gostaria de atendimento.");
    wa.target = "_blank";
    wa.rel = "noopener";
    wa.setAttribute("aria-label", "Falar com a WebNet no WhatsApp");
    wa.dataset.evento = "whatsapp-flutuante";
    wa.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#icone-whatsapp"/></svg><span>Fale conosco</span>';
    document.body.appendChild(wa);
  }

  // Aviso no topo (manutenção, instabilidade ou comunicado)
  if (typeof AVISO !== "undefined" && AVISO.ativo && AVISO.texto) {
    const ate = AVISO.ate ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(AVISO.ate) ? AVISO.ate : `${AVISO.ate}:00-03:00`) : null;
    const chave = `webnet-aviso-fechado:${AVISO.texto}`;
    const vencido = ate && !isNaN(ate) && Date.now() > ate.getTime();
    if (!vencido && guardar.ler(chave) !== "1") {
      const tipo = ["manutencao", "instabilidade", "info"].includes(AVISO.tipo) ? AVISO.tipo : "info";
      const rotulo = { manutencao: "Manutenção programada", instabilidade: "Instabilidade", info: "Aviso" }[tipo];
      const barra = document.createElement("div");
      barra.className = `aviso aviso--${tipo}`;
      barra.setAttribute("role", tipo === "instabilidade" ? "alert" : "status");
      const texto = document.createElement("p");
      const forte = document.createElement("strong");
      forte.textContent = `${rotulo}: `;
      texto.append(forte, AVISO.texto);
      const fechar = document.createElement("button");
      fechar.type = "button";
      fechar.className = "aviso__fechar";
      fechar.setAttribute("aria-label", "Fechar aviso");
      fechar.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      fechar.addEventListener("click", () => { barra.remove(); guardar.gravar(chave, "1"); });
      const wrap = document.createElement("div");
      wrap.className = "wrap aviso__inner";
      wrap.append(texto, fechar);
      barra.append(wrap);
      document.body.prepend(barra);
    }
  }

  // Tradutor de Libras (VLibras): incluído em cada página; aqui só é escondido se desligado em config.js
  if (typeof VLIBRAS_ATIVO !== "undefined" && !VLIBRAS_ATIVO) $$("[vw]").forEach((e) => e.remove());

  // Estatísticas sem cookies (GoatCounter), só se configurado
  if (typeof ESTATISTICAS_GOATCOUNTER !== "undefined" && /^[a-z0-9-]+$/i.test(ESTATISTICAS_GOATCOUNTER)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${ESTATISTICAS_GOATCOUNTER}.goatcounter.com/count`;
    document.head.appendChild(s);
    // Cliques em contratação, WhatsApp e Área do Cliente viram eventos (sem identificar o visitante)
    document.addEventListener("click", (e) => {
      const alvo = e.target.closest("[data-evento], a[href*='wa.me'], [data-area-cliente]");
      if (!alvo || !window.goatcounter?.count) return;
      const nome = alvo.dataset.evento || (alvo.hasAttribute("data-area-cliente") ? "area-cliente" : "whatsapp");
      window.goatcounter.count({ path: `evento-${nome}`, title: nome, event: true });
    });
  }
})();
