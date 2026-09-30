# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.2.1] - 2026-09-30

### Alterado

- Destaques do topo: suporte pelo WhatsApp, pelo app ou na loja, sem horário fixo; app WebNet SE com faturas, 2ª via e chamados.
- Bloco "Fale com a WebNet" sem horário de atendimento.

### Removido

- Horário "todos os dias, das 8h às 22h", que não correspondia ao atendimento real.
- Menção a "upload de até 50% do download".
- Aviso de "desconto de pontualidade" abaixo dos planos.

## [0.2.0] - 2026-09-30

### Adicionado

- Carrossel "Novidades da WebNet" para fotos de instalações, promoções e eventos, sem etiquetas de categoria, com setas, marcadores, gesto de arrastar no celular, navegação por teclado e troca automática que pausa com o mouse, o foco ou o toque.
- Carrossel lê sozinho as imagens da pasta `fotos/` pela listagem do servidor (nginx `autoindex` em JSON, Apache `Indexes` ou servidor local), em qualquer formato (JPG, PNG, WEBP, GIF, AVIF, SVG). Sem listagem, usa a lista de `galeria.js`.
- Atalho `atualizar-galeria.bat` (script `gerar-galeria.js`) para gerar a lista de `galeria.js` a partir da pasta, em servidores sem listagem.
- Guia `DEPLOY.md` para publicar em servidor Debian com nginx e HTTPS (Let's Encrypt).
- Fotos do carrossel fora do Git: o repositório guarda só a pasta vazia `fotos/`.
- Slides aceitam imagens de qualquer proporção: a foto aparece inteira sobre um fundo desfocado dela mesma. Legenda e botão são opcionais por foto.
- Link "Novidades" no menu.
- Botão "Área do cliente" (cabeçalho, menu do celular e página de privacidade) abre uma janela com duas opções: baixar o app (App Store e Google Play, com a loja do aparelho primeiro no celular) ou continuar no navegador em https://webnetse.com.br/client.
- Arquivo `config.js` com WhatsApp, links dos apps e da Área do Cliente, compartilhado pelas duas páginas.
- Bloco "Baixe o app da WebNet" na área de clientes, com os selos oficiais (`appstore.webp` e `googleplay.webp`) levando ao app WebNet SE na App Store e no Google Play.

### Alterado

- WhatsApp da empresa definido como (79) 9844-1264 em todos os botões de contratação e contato, no rodapé e na página de privacidade.
- Horário da loja aos sábados: 8h às 16h.
- Botão do bloco "Fale com a WebNet" mostra o ícone do WhatsApp e a palavra "WhatsApp", sem o número.
- Botão "Ligar" do bloco final trocado por "Enviar e-mail", até haver um telefone fixo definido.
- Fonte do site trocada para Roboto em títulos e textos (antes Bricolage Grotesque e Figtree).
- Texto corrido justificado, com hifenização em português, nos parágrafos longos (topo, seções, perguntas frequentes, carrossel e política de privacidade). Cartões estreitos e tabelas continuam alinhados à esquerda.
- Política de Privacidade reestruturada em 13 seções: definições, tabela de dados coletados e finalidades, bases legais (LGPD, art. 7º), compartilhamento, transferência internacional, segurança e alerta contra golpes, tabela de prazos de guarda (incluindo registros de conexão por 1 ano, Marco Civil art. 13), direitos do titular, aplicativo, serviços externos, lei e foro (Propriá-SE) e canal do encarregado. A política cita os aplicativos para Android e iOS.

- Planos residenciais atualizados conforme a lista vigente em 30/09/2026: 150 Mbps (R$ 64,90), 300 Mbps (R$ 74,90), 500 Mbps (R$ 84,90), 600 Mbps (R$ 94,90) e 800 Mbps (R$ 99,90).
- Selo "Mais contratado" movido para o plano de 300 Mbps, que também passa a vir selecionado no seletor do topo.
- Seletor do topo e grade de planos passam a exibir cinco planos.
- Botões dos cartões de plano encurtados para "Contratar", mantendo o nome do plano para leitores de tela.

### Removido

- Planos de exemplo de 700 Mega e 1 Giga.
- Benefícios de exemplo por plano (roteador Wi-Fi 6, repetidores mesh, suporte prioritário), que não constam na lista oficial.

## [0.1.0] - 2026-09-30

### Adicionado

- Página inicial do site da WebNet Conexão em Alta Velocidade (`index.html`).
- Seletor interativo de plano no topo, com velocidade, preço, perfil de uso e botão de contratação pelo WhatsApp.
- Consulta de cobertura por CEP, atendendo Propriá-SE (49940-000).
- Seção de planos de internet fibra (300 Mega, 500 Mega, 700 Mega e 1 Giga).
- Seções "Por que fibra", "Já é cliente?" (2ª via, suporte, teste de velocidade, senha do Wi-Fi), perguntas frequentes e contato.
- Página de Política de Privacidade conforme a LGPD (`privacidade.html`), com identificação da controladora dos dados.
- Logotipo oficial da marca no cabeçalho (`logo-marca.svg`), no rodapé (`webnet-logo.svg`) e como ícone da aba.
- Paleta de cores baseada no logotipo: azul petróleo `#236085` e verde-limão `#ACDA2D`.
- Dados da empresa no rodapé: razão social, CNPJ 13.094.761/0001-00, endereço na Praça Fausto Cardoso, 90, Propriá-SE, e e-mail gerente@webnetprovedor.com.
- Layout responsivo para celular, tablet e computador, com navegação por teclado e suporte a movimento reduzido.

[Unreleased]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.2.1...HEAD
[0.2.1]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jmanoelslva/WEBNET-SITE/releases/tag/v0.1.0
