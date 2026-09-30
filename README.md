# WebNet — Site

Site institucional da **WebNet Conexão em Alta Velocidade**, provedor de internet fibra óptica em Propriá-SE.

## Estrutura

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Página inicial |
| `privacidade.html` | Política de Privacidade (LGPD) |
| `styles.css` | Estilos e paleta de cores (variáveis no início do arquivo) |
| `script.js` | Planos, preços, WhatsApp e CEPs atendidos (configuração no início do arquivo) |
| `logo-marca.svg`, `webnet-logo.svg` | Logotipos usados no site |
| `LOGO.svg`, `LOGO.png` | Arquivos originais do logotipo |

## Como visualizar

É um site estático, sem etapa de build. Abra `index.html` no navegador ou sirva a pasta com qualquer servidor:

```bash
npx http-server . -p 5180
```

## Como editar os planos

Altere a lista `PLANOS` e as constantes `WHATSAPP` e `CEPS_ATENDIDOS` no início de `script.js`.

## Versionamento

Este projeto segue o [Versionamento Semântico](https://semver.org/lang/pt-BR/). As mudanças de cada versão estão em [CHANGELOG.md](CHANGELOG.md).
