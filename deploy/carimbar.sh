#!/usr/bin/env bash
# Prepara os arquivos publicados após cada deploy (chamado pelo instalar.sh e pelo atualizar.sh):
#  - acrescenta ?v=<versão> nos links de CSS e JS das páginas, para o navegador baixar os
#    arquivos novos depois de uma atualização (em vez de usar os antigos guardados em cache);
#  - troca __SITE_URL__ e __DATA__ pelo endereço do site e pela data (prévia no WhatsApp, SEO).
# Uso: bash carimbar.sh /var/www/webnet https://site.exemplo.com.br
set -euo pipefail
DIR="$1"
URL="${2%/}"
VERSAO="${VERSAO:-$(git -C "$DIR" rev-parse --short HEAD 2>/dev/null || date +%s)}"
HOJE="$(date +%F)"
URL_SED="$(printf '%s' "$URL" | sed 's/[&~\\]/\\&/g')"

for f in "$DIR"/*.html "$DIR"/robots.txt "$DIR"/sitemap.xml; do
  [[ -f "$f" ]] || continue
  sed -i -E \
    -e 's~((href|src)="/?[^":?#]+\.(css|js))(\?v=[^"]*)?"~\1?v='"$VERSAO"'"~g' \
    -e "s~__SITE_URL__~${URL_SED}~g" \
    -e "s~__DATA__~${HOJE}~g" \
    "$f"
done
echo "  versão $VERSAO aplicada aos arquivos publicados"
