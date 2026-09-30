# WebNet — Site

Site institucional da **WebNet Conexão em Alta Velocidade**, provedor de internet fibra óptica em Propriá-SE.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página inicial |
| `privacidade.html` | Política de Privacidade (LGPD) |
| `styles.css` | Estilos e paleta de cores (variáveis no início do arquivo) |
| `config.js` | WhatsApp, links dos apps e endereço da Área do Cliente (usado nas duas páginas) |
| `script.js` | Planos, preços e CEPs atendidos (configuração no início do arquivo) |
| `area-cliente.js` | Janela da Área do Cliente: baixar o app ou continuar no navegador |
| `galeria.js` | Lista de slides do carrossel (gerada por `atualizar-galeria.bat`) |
| `gerar-galeria.js`, `atualizar-galeria.bat` | Atualizam o carrossel com as imagens de `fotos/` |
| `fotos/` | Imagens do carrossel (não versionadas) |
| `DEPLOY.md` | Publicação em servidor Debian com nginx |
| `logo-marca.svg`, `webnet-logo.svg` | Logotipos usados no site |
| `LOGO.svg`, `LOGO.png` | Arquivos originais do logotipo |
| `appstore.webp`, `googleplay.webp` | Selos das lojas de aplicativos |

## Publicação

O site será hospedado em um servidor Debian com nginx. O passo a passo está em [DEPLOY.md](DEPLOY.md).

## Como visualizar

É um site estático, sem etapa de build. Abra `index.html` no navegador ou sirva a pasta com qualquer servidor:

```bash
npx http-server . -p 5180
```

## Como editar os planos

Altere a lista `PLANOS` e `CEPS_ATENDIDOS` no início de `script.js`. WhatsApp, links dos apps e da Área do Cliente ficam em `config.js`.

## Como adicionar fotos ao carrossel de novidades

- **No servidor:** envie as imagens para a pasta `fotos/`. O carrossel lê a pasta sozinho, em qualquer formato (JPG, PNG, WEBP, GIF, AVIF, SVG) e proporção. Veja [DEPLOY.md](DEPLOY.md).
- **No Windows, para testar:** coloque as imagens em `fotos/` e rode `npx http-server . -p 5180`. O carrossel também lê a pasta. Sem servidor, dê dois cliques em `atualizar-galeria.bat` para gerar a lista em `galeria.js`.
- **Legenda e botão (opcionais):** acrescente um bloco para a foto em `galeria.js`.

As fotos não vão para o Git: só a pasta vazia (`fotos/.gitkeep`) fica no repositório.

Prefira JPG ou WEBP com até 1600 px e ~300 KB. Capturas de tela em PNG costumam ter vários MB e deixam o site lento no celular.

## Versionamento

Este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/). As mudanças de cada versão estão em [CHANGELOG.md](CHANGELOG.md).
