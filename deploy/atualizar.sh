#!/usr/bin/env bash
# =============================================================================
#  Atualiza o site da WebNet com a versão do GitHub.
#  Instalado pelo deploy/instalar.sh como o comando "webnet-atualizar". Rode como root.
#
#  Uso:
#    webnet-atualizar              última versão do branch (main)
#    webnet-atualizar v0.2.1       uma versão específica (tag), por exemplo para voltar atrás
#    webnet-atualizar --versoes    lista as versões disponíveis
#
#  As fotos da pasta fotos/ não são alteradas (o Git não as controla).
# =============================================================================
set -euo pipefail

# Roda a partir de uma cópia temporária: o próprio script pode ser atualizado pelo git durante a execução
if [[ -z "${WEBNET_COPIA:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  COPIA="$(mktemp)"; cp "${BASH_SOURCE[0]}" "$COPIA"
  WEBNET_COPIA=1 WEBNET_ORIGEM="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" exec bash "$COPIA" "$@"
fi

CONF="/etc/webnet-site.conf"
VERDE=$'\e[1;32m'; AMARELO=$'\e[1;33m'; VERMELHO=$'\e[1;31m'; FIM=$'\e[0m'
[[ -t 1 ]] || { VERDE=""; AMARELO=""; VERMELHO=""; FIM=""; }
SUDO=""; [[ -n "${SUDO_USER:-}" ]] && SUDO="sudo "
ok()   { echo "${VERDE}✔ $*${FIM}"; }
erro() { echo "${VERMELHO}✖ $*${FIM}" >&2; exit 1; }

[[ $EUID -eq 0 ]] || erro "Execute como root (ou com sudo):  webnet-atualizar"
[[ -f "$CONF" ]] || erro "Configuração não encontrada ($CONF). Rode primeiro o deploy/instalar.sh."
# shellcheck disable=SC1090
source "$CONF"
[[ -d "$DIR/.git" ]] || erro "$DIR não é uma cópia do GitHub. Rode o deploy/instalar.sh."

ALVO="${1:-}"
cd "$DIR"
git fetch -q --tags --prune origin

if [[ "$ALVO" == "--versoes" || "$ALVO" == "-l" ]]; then
  echo "Versões disponíveis (mais recentes primeiro):"
  git tag -l 'v*' --sort=-v:refname | head -20 | sed 's/^/  /'
  echo "Atual: $(git describe --tags --always)"
  exit 0
fi

ANTES="$(git describe --tags --always)"
if [[ -z "$ALVO" ]]; then
  git checkout -q -f "$BRANCH"
  git reset -q --hard "origin/$BRANCH"
else
  git rev-parse -q --verify "refs/tags/$ALVO" >/dev/null || erro "Versão $ALVO não existe. Veja: ${SUDO}webnet-atualizar --versoes"
  git checkout -q -f "refs/tags/$ALVO"
fi
DEPOIS="$(git describe --tags --always)"

# Permissões (arquivos novos) e pasta de fotos
mkdir -p "$DIR/fotos"
find "$DIR" -path "$DIR/.git" -prune -o -path "$DIR/fotos" -prune -o -type d -exec chmod 755 {} +
find "$DIR" -path "$DIR/.git" -prune -o -path "$DIR/fotos" -prune -o -type f -exec chmod 644 {} +
chgrp www-data "$DIR/fotos"; chmod 2775 "$DIR/fotos"

# Versão nos links de CSS/JS e endereço do site (prévia no WhatsApp, SEO)
bash "$DIR/deploy/carimbar.sh" "$DIR" "${ENDERECO:-https://$DOMINIO}"

# Recarrega o servidor web (só por garantia; arquivos estáticos já valem na hora)
if [[ "${SERVIDOR:-nginx}" == "nginx" ]]; then
  nginx -t >/dev/null 2>&1 && systemctl reload nginx
else
  apache2ctl configtest >/dev/null 2>&1 && systemctl reload apache2
fi

if [[ "$ANTES" == "$DEPOIS" ]]; then
  ok "O site já estava na versão mais recente ($DEPOIS)."
else
  ok "Site atualizado: $ANTES → $DEPOIS"
fi
echo "  ${ENDERECO:-https://$DOMINIO}"
[[ -n "$ALVO" ]] && echo "${AMARELO}  Fixado na versão $ALVO. Para voltar à mais recente: ${SUDO}webnet-atualizar${FIM}"
exit 0
