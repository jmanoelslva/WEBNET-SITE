// Janela "Área do cliente": baixar o app ou continuar pelo navegador.
// Abre a partir de qualquer link com o atributo data-area-cliente. Links em config.js.
(function areaCliente() {
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  const web = AREA_CLIENTE_WEB || waLink("Olá! Quero acessar a Área do Cliente da WebNet pelo navegador.");

  const selo = {
    ios: `<a class="store" href="${APP_IOS}" target="_blank" rel="noopener"><img src="appstore.webp" alt="Baixar na App Store" width="256" height="86"></a>`,
    android: `<a class="store" href="${APP_ANDROID}" target="_blank" rel="noopener"><img src="googleplay.webp" alt="Disponível no Google Play" width="256" height="76"></a>`,
  };
  // No celular, a loja do aparelho aparece primeiro
  const selos = ios ? [selo.ios, selo.android] : android ? [selo.android, selo.ios] : [selo.ios, selo.android];

  const dlg = document.createElement("dialog");
  dlg.className = "modal";
  dlg.id = "area-cliente";
  dlg.setAttribute("aria-labelledby", "area-cliente-titulo");
  dlg.innerHTML = `
    <button class="modal__fechar" type="button" aria-label="Fechar">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <h2 id="area-cliente-titulo">Área do Cliente</h2>
    <p class="modal__intro">Consulte faturas, pegue a 2ª via e abra chamados. Escolha como prefere acessar:</p>
    <div class="modal__opcoes">
      <section class="modal__opcao modal__opcao--app">
        <h3>Pelo aplicativo</h3>
        <p>Mais prático no celular, com aviso antes do vencimento da fatura.</p>
        <div class="modal__selos">${selos.join("")}</div>
      </section>
      <section class="modal__opcao">
        <h3>Pelo navegador</h3>
        <p>Acesse sem instalar nada, no computador ou no celular.</p>
        <a class="btn btn--petrol btn--block" href="${web}" target="_blank" rel="noopener">Continuar no navegador</a>
      </section>
    </div>`;
  document.body.appendChild(dlg);

  const fechar = () => dlg.close();
  dlg.querySelector(".modal__fechar").addEventListener("click", fechar);
  // clique fora da janela fecha
  dlg.addEventListener("click", (e) => { if (e.target === dlg) fechar(); });
  // escolher uma opção também fecha a janela
  dlg.querySelectorAll(".modal__opcoes a").forEach((a) => a.addEventListener("click", fechar));

  document.querySelectorAll("[data-area-cliente]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const menu = document.getElementById("mobile-menu");
      const menuBtn = document.querySelector(".menu-btn");
      if (menu && !menu.hidden) { menu.hidden = true; menuBtn?.setAttribute("aria-expanded", "false"); }
      dlg.showModal();
    });
  });
})();
