# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [0.5.1] - 2026-09-30

### Corrigido

- Tradutor de Libras (VLibras) abria o painel, mas o avatar não carregava: o CSP bloqueava o quadro (iframe) de vlibras.gov.br. As estatísticas externas do próprio VLibras (PostHog) continuam bloqueadas.

### Alterado

- Cabeçalhos de segurança e CSP passam a ficar em `deploy/seguranca-apache.conf` e `deploy/seguranca-nginx.conf`, dentro do projeto: ajustes futuros valem com um `webnet-atualizar`, sem rodar o instalador.
- `webnet-atualizar` avisa quando a configuração do servidor web tem erro e mantém a configuração anterior no ar.

## [0.5.0] - 2026-09-30

### Adicionado

- Uma página por cidade atendida (`internet-fibra-<cidade>.html`), com planos, passo a passo, perguntas frequentes e dados estruturados; as cidades da faixa de cobertura viram links para elas. Geradas por `gerar-cidades.js`, que também atualiza o `sitemap.xml`.
- Tradutor de Libras (VLibras) em todas as páginas (`VLIBRAS_ATIVO` em `config.js`).
- Estrutura de depoimentos de clientes e link "Avalie a WebNet no Google" (`DEPOIMENTOS` em `config.js`), desligada até haver depoimentos reais autorizados.
- Botão pausar/continuar no carrossel.
- Cabeçalho de segurança Content-Security-Policy (CSP) e, na instalação definitiva, HSTS.

### Alterado

- Carrossel continua trocando sozinho com "animações reduzidas" no sistema (sem deslizar) e volta a trocar alguns segundos depois de um toque ou clique.

### Corrigido

- Acessibilidade (Lighthouse 90 → 100): papel ARIA dos slides, contraste do aviso do pré-cadastro e área de toque dos marcadores do carrossel.

## [0.4.0] - 2026-09-30

### Adicionado

- Página de Termos de Uso (`termos.html`), com link no rodapé de todas as páginas.
- Página 404 no visual do site.
- Prévia com imagem ao compartilhar o link no WhatsApp e nas redes sociais (`img/og-webnet.png`).
- Dados de empresa local para o Google (Schema.org), `sitemap.xml` e `robots.txt`.
- Botão flutuante do WhatsApp em todas as páginas.
- "Qual plano é ideal?": teste de 3 perguntas que recomenda um plano.
- Pré-cadastro "Quero ser cliente", enviado pelo WhatsApp sem gravar dados no site.
- Seção de planos empresariais (textos de exemplo, em `config.js` > `PLANOS_EMPRESA`).
- Dicas rápidas de suporte (internet caiu, Wi-Fi, lentidão, Smart TV).
- Aviso no topo para manutenção, instabilidade ou comunicados (`config.js` > `AVISO`, desligado por padrão).
- Estatísticas de acesso sem cookies, opcionais (GoatCounter).
- Teste de velocidade configurável, com suporte a LibreSpeed próprio.
- Otimização automática das fotos do carrossel no servidor (WEBP de até 1600 px).
- Arquivo `comum.js` com os itens compartilhados entre as páginas.

### Alterado

- Fonte Roboto servida pelo próprio site, sem Google Fonts.
- Rodapé: "Trabalhe conosco" abre e-mail com assunto preenchido; "Contrato de serviço" só aparece quando houver um PDF configurado.
- Política de Privacidade atualizada: pré-cadastro, teste de plano, estatísticas sem cookies e fim do Google Fonts.
- Instalador e `webnet-atualizar` rodam a partir de uma cópia temporária, para não serem afetados quando o próprio script é atualizado.

### Corrigido

- Visitantes podiam continuar vendo CSS e JS antigos por até 7 dias após uma atualização: agora os links levam a versão e as páginas não ficam em cache.
- No nginx, cabeçalhos de segurança deixavam de ser enviados em algumas rotas.
- Links "Contrato de serviço" e "Trabalhe conosco" do rodapé não levavam a lugar nenhum.

## [0.3.0] - 2026-09-30

### Adicionado

- Instalador `deploy/instalar.sh` para Debian/Ubuntu: detecta nginx e Apache, pergunta qual usar e instala o que faltar, pergunta domínio ou subdomínio (com opção de www), baixa o site do GitHub, configura o servidor web e emite o certificado Let's Encrypt com renovação automática. Pode ser executado de novo, reaproveitando as respostas. Tem também um modo "teste em outra porta", para servidores que já rodam outro serviço: usa o servidor web que já está ativo, cria um site separado na porta escolhida, reaproveita o certificado existente e não altera os sites nem as portas 80/443. Funciona como root, sem `sudo`.
- Comando `webnet-atualizar` (`deploy/atualizar.sh`) para deploy: atualiza o site com o GitHub sem mexer nas fotos, lista versões e permite voltar a uma versão específica.
- `.gitattributes` garante fim de linha LF nos scripts `.sh`.
- Estrutura do SVA de e-books, configurável em `SVA_EBOOKS` (`config.js`), com dados fictícios ("Estante Digital"): seção própria com destaques e ícones, estante com livros em duas prateleiras (capas com lombada e desenhos variados), faixa "Como acessar" com 3 passos numerados e botão de WhatsApp; linha "E-books inclusos" nos planos participantes e no seletor do topo.
- Slides de exemplo do carrossel (`GALERIA_EXEMPLOS` e ilustrações em `img/`), exibidos quando não há fotos, para o carrossel nunca ficar oculto.
- Política de Privacidade cita parceiros de serviços adicionais, como a plataforma de e-books.

### Alterado

- Consulta de cobertura por cidade no lugar do CEP: a faixa "A WebNet chega na sua rua?" lista as cidades atendidas (Propriá, Amparo de São Francisco, Cedro de São João, Malhada dos Bois, São Francisco e Telha) e o botão abre o WhatsApp para a equipe confirmar a rua. Cidades configuráveis em `CIDADES_ATENDIDAS`, no `script.js`.
- Título da página e descrição para buscadores citam Propriá e região.
- Texto da faixa de cobertura: "Onde atendemos:".
- Política de Privacidade: trecho sobre a consulta de cobertura atualizado.
- Atalho "Teste de velocidade" abre o fast.com em nova aba.
- Atalho "2ª via do boleto" e o link "2ª via do boleto" do cabeçalho e do menu do celular (nas duas páginas) abrem a janela da Área do Cliente.
- Atalho "Suporte no WhatsApp" abre a conversa com a WebNet já com uma mensagem de suporte técnico.
- Atalho "Trocar senha do Wi-Fi" abre o WhatsApp da WebNet com o pedido de troca de senha.

### Corrigido

- Seção "Novidades da WebNet" sem espaçamento no topo, com o título colado na borda do bloco; agora segue o mesmo espaçamento das demais seções.
- Links do menu (Planos, Novidades, Cobertura, Ajuda, Dúvidas) rolavam a página até uma posição em que o cabeçalho fixo cobria o topo da seção.

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

[Unreleased]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/jmanoelslva/WEBNET-SITE/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/jmanoelslva/WEBNET-SITE/releases/tag/v0.1.0
