#!/usr/bin/env bash
# Otimiza as fotos enviadas para a pasta fotos/ do carrossel.
# Executado automaticamente a cada 5 minutos (cron criado pelo instalar.sh).
#
# Fotos maiores que 1600 px ou 400 KB viram WEBP de até 1600 px, bem mais leves.
# O arquivo original é guardado em fotos/.originais/ (não aparece no site).
# Uso manual: bash otimizar-fotos.sh /var/www/webnet/fotos
set -euo pipefail
PASTA="${1:-/var/www/webnet/fotos}"
LIMITE_KB=400
LADO=1600

command -v convert >/dev/null || { echo "ImageMagick não instalado (apt-get install imagemagick)"; exit 1; }
exec 9>/run/webnet-otimizar-fotos.lock
flock -n 9 || exit 0   # já existe uma execução em andamento

shopt -s nullglob nocaseglob
for f in "$PASTA"/*.{jpg,jpeg,png,bmp,webp}; do
  [[ -f "$f" ]] || continue
  tam_kb=$(( $(stat -c %s "$f") / 1024 ))
  largura=$(identify -format '%w' "$f[0]" 2>/dev/null || echo 0)
  altura=$(identify -format '%h' "$f[0]" 2>/dev/null || echo 0)
  if (( largura <= LADO && altura <= LADO )); then
    # WEBP no tamanho certo já está otimizado; os demais formatos só se forem pesados
    [[ "${f,,}" == *.webp ]] && continue
    (( tam_kb <= LIMITE_KB )) && continue
  fi

  base="${f%.*}"; destino="$base.webp"
  [[ "${f,,}" == *.webp ]] && destino="$base.otimizada.webp"
  tmp="$(mktemp --suffix=.webp)"
  if convert "$f[0]" -auto-orient -resize "${LADO}x${LADO}>" -strip -quality 82 "$tmp"; then
    mkdir -p "$PASTA/.originais"
    touch -r "$f" "$tmp"                      # mantém a data (ordem no carrossel)
    mv "$f" "$PASTA/.originais/"
    mv "$tmp" "$destino"
    chmod 664 "$destino"; chgrp www-data "$destino" 2>/dev/null || true
    echo "otimizada: $(basename "$f") (${tam_kb} KB) -> $(basename "$destino") ($(( $(stat -c %s "$destino") / 1024 )) KB)"
  else
    rm -f "$tmp"
    echo "não foi possível otimizar: $(basename "$f")"
  fi
done
