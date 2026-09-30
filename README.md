# WebNet — Site

Site institucional da **WebNet Conexão em Alta Velocidade**, provedor de internet fibra óptica em Propriá-SE.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página inicial |
| `privacidade.html` | Política de Privacidade (LGPD) |
| `styles.css` | Estilos e paleta de cores (variáveis no início do arquivo) |
| `config.js` | WhatsApp, apps, Área do Cliente, rodapé, aviso no topo, teste de velocidade, estatísticas, planos empresariais e SVA de e-books |
| `comum.js` | Itens comuns às páginas: menu, rodapé, WhatsApp flutuante, aviso no topo e estatísticas |
| `termos.html`, `404.html` | Termos de Uso e página de erro 404 |
| `internet-fibra-*.html` | Uma página por cidade atendida (geradas por `gerar-cidades.js`) |
| `gerar-cidades.js` | Gera as páginas por cidade e o `sitemap.xml`: rode `node gerar-cidades.js` ao mudar planos ou cidades |
| `vlibras.js` | Inicia o tradutor de Libras (VLibras) |
| `fontes/` | Fonte Roboto servida pelo próprio site (licença SIL OFL) |
| `robots.txt`, `sitemap.xml` | Orientação para buscadores (endereço preenchido no deploy) |
| `script.js` | Planos, preços e CEPs atendidos (configuração no início do arquivo) |
| `area-cliente.js` | Janela da Área do Cliente: baixar o app ou continuar no navegador |
| `galeria.js` | Lista de slides do carrossel (gerada por `atualizar-galeria.bat`) |
| `gerar-galeria.js`, `atualizar-galeria.bat` | Atualizam o carrossel com as imagens de `fotos/` |
| `fotos/` | Imagens do carrossel (não versionadas) |
| `img/` | Ilustrações dos slides de exemplo, exibidos quando `fotos/` está vazia |
| `DEPLOY.md` | Publicação em servidor Debian (nginx ou Apache) |
| `deploy/instalar.sh` | Instalador para o servidor: servidor web, domínio e certificado HTTPS |
| `deploy/atualizar.sh` | Deploy de novas versões do GitHub (comando `webnet-atualizar`) |
| `deploy/carimbar.sh` | Aplica a versão nos links de CSS/JS e o endereço do site a cada deploy |
| `deploy/otimizar-fotos.sh` | Converte fotos pesadas em WEBP (executado a cada 5 minutos no servidor) |
| `deploy/og-imagem.html` | Fonte da imagem de compartilhamento `img/og-webnet.png` |
| `logo-marca.svg`, `webnet-logo.svg` | Logotipos usados no site |
| `LOGO.svg`, `LOGO.png` | Arquivos originais do logotipo |
| `appstore.webp`, `googleplay.webp` | Selos das lojas de aplicativos |

## Publicação

O site será hospedado em um servidor Debian. No servidor, como root, `bash instalar.sh` instala tudo (nginx ou Apache, domínio e certificado HTTPS, ou um teste numa porta separada) e `webnet-atualizar` faz os próximos deploys. Detalhes em [DEPLOY.md](DEPLOY.md).

## Como visualizar

É um site estático, sem etapa de build. Abra `index.html` no navegador ou sirva a pasta com qualquer servidor:

```bash
npx http-server . -p 5180
```

## Como editar os planos

Altere a lista `PLANOS` e `CEPS_ATENDIDOS` no início de `script.js`. WhatsApp, links dos apps e da Área do Cliente ficam em `config.js`.

## SVA de e-books

A seção de e-books, o benefício nos cartões de planos e o slide de lançamento são montados a partir de `SVA_EBOOKS`, em `config.js`. **Nome, números e textos atuais são fictícios.** Troque pelos dados do fornecedor contratado, ou use `ativo: false` para esconder tudo.

## Como adicionar fotos ao carrossel de novidades

- **No servidor:** envie as imagens para a pasta `fotos/`. O carrossel lê a pasta sozinho, em qualquer formato (JPG, PNG, WEBP, GIF, AVIF, SVG) e proporção. Veja [DEPLOY.md](DEPLOY.md).
- **No Windows, para testar:** coloque as imagens em `fotos/` e rode `npx http-server . -p 5180`. O carrossel também lê a pasta. Sem servidor, dê dois cliques em `atualizar-galeria.bat` para gerar a lista em `galeria.js`.
- **Legenda e botão (opcionais):** acrescente um bloco para a foto em `galeria.js`.

As fotos não vão para o Git: só a pasta vazia (`fotos/.gitkeep`) fica no repositório.

Prefira JPG ou WEBP com até 1600 px e ~300 KB. Capturas de tela em PNG costumam ter vários MB e deixam o site lento no celular.

## Versionamento

Este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/). As mudanças de cada versão estão em [CHANGELOG.md](CHANGELOG.md).
