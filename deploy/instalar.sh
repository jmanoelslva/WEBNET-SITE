#!/usr/bin/env bash
# =============================================================================
#  Instalador do site da WebNet — Debian / Ubuntu
#
#  Uso (no servidor):
#    curl -fsSL https://raw.githubusercontent.com/jmanoelslva/WEBNET-SITE/main/deploy/instalar.sh -o instalar.sh
#    bash instalar.sh          (como root; ou: sudo bash instalar.sh)
#
#  Dois modos:
#    1) Definitivo: o site responde no domínio (portas 80/443) e ganha um certificado
#       Let's Encrypt novo, com renovação automática.
#    2) Teste em outra porta: para servidores que já rodam outra coisa (ex.: Grafana).
#       Usa o nginx/Apache que já está rodando, abre uma porta separada (ex.: 8443),
#       reaproveita um certificado existente e não mexe em nenhum outro site.
#
#  Nos dois modos: baixa o site do GitHub em /var/www/webnet, configura o servidor
#  web (listagem da pasta fotos/, cache, segurança) e cria o comando "webnet-atualizar".
#  Pode ser executado de novo: as respostas anteriores viram sugestão.
# =============================================================================
set -euo pipefail

# Roda a partir de uma cópia temporária: o próprio script pode ser atualizado pelo git durante a execução
if [[ -z "${WEBNET_COPIA:-}" && -f "${BASH_SOURCE[0]}" ]]; then
  COPIA="$(mktemp)"; cp "${BASH_SOURCE[0]}" "$COPIA"
  WEBNET_COPIA=1 WEBNET_ORIGEM="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)" exec bash "$COPIA" "$@"
fi

REPO_PADRAO="https://github.com/jmanoelslva/WEBNET-SITE.git"
BRANCH_PADRAO="main"
DIR_PADRAO="/var/www/webnet"
CONF="/etc/webnet-site.conf"

# ---------- aparência ----------
if [[ -t 1 ]]; then
  AZUL=$'\e[1;34m'; VERDE=$'\e[1;32m'; AMARELO=$'\e[1;33m'; VERMELHO=$'\e[1;31m'; NEGRITO=$'\e[1m'; FIM=$'\e[0m'
else
  AZUL=""; VERDE=""; AMARELO=""; VERMELHO=""; NEGRITO=""; FIM=""
fi
titulo() { echo; echo "${AZUL}==> $*${FIM}"; }
ok()     { echo "${VERDE}  ✔ $*${FIM}"; }
aviso()  { echo "${AMARELO}  ! $*${FIM}"; }
erro()   { echo "${VERMELHO}  ✖ $*${FIM}" >&2; exit 1; }

# pergunta VARIAVEL "Texto" "padrão"
pergunta() {
  local __var="$1" __texto="$2" __padrao="${3:-}" __resp
  if [[ -n "$__padrao" ]]; then
    read -r -p "  $__texto [${__padrao}]: " __resp || true
    __resp="${__resp:-$__padrao}"
  else
    read -r -p "  $__texto: " __resp || true
  fi
  printf -v "$__var" '%s' "$__resp"
}

# sim_nao "Texto" s|n  -> retorna 0 para sim
sim_nao() {
  local __texto="$1" __padrao="${2:-n}" __resp __opcoes="s/N"
  [[ "$__padrao" == "s" ]] && __opcoes="S/n"
  read -r -p "  $__texto ($__opcoes): " __resp || true
  __resp="${__resp:-$__padrao}"
  [[ "${__resp,,}" == s* ]]
}

# Mostra "sudo " nos comandos sugeridos só se o instalador foi chamado com sudo (root direto não precisa)
SUDO=""; [[ -n "${SUDO_USER:-}" ]] && SUDO="sudo "

pacote_instalado() { dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q "install ok installed"; }
servico_ativo()    { systemctl is-active --quiet "$1" 2>/dev/null; }
porta_em_uso()     { ss -Htln "sport = :$1" 2>/dev/null | grep -q .; }

# ---------- verificações iniciais ----------
[[ $EUID -eq 0 ]] || erro "Execute como root (ou com sudo):  bash $0"
command -v apt-get >/dev/null || erro "Este instalador é para Debian ou Ubuntu (apt-get não encontrado)."
# shellcheck disable=SC1091
. /etc/os-release 2>/dev/null || true

echo
echo "${NEGRITO}Instalador do site da WebNet${FIM}  —  ${PRETTY_NAME:-Linux}"

# Respostas de uma instalação anterior viram sugestão
if [[ -f "$CONF" ]]; then
  # shellcheck disable=SC1090
  source "$CONF"
  aviso "Encontrei uma instalação anterior ($CONF). As respostas antigas aparecem como sugestão."
fi

# ---------- 0. tipo de instalação ----------
titulo "Tipo de instalação"
echo "  1) Definitiva: o site responde no domínio (portas 80 e 443) com certificado HTTPS novo."
echo "  2) Teste em outra porta: para um servidor que já roda outro serviço (ex.: Grafana)."
echo "     Não mexe nas portas 80/443 nem nos sites existentes; reaproveita o certificado que já existe."
PADRAO_TIPO="1"; [[ "${MODO:-}" == "teste" ]] && PADRAO_TIPO="2"
while true; do
  pergunta TIPO "Escolha 1 ou 2" "$PADRAO_TIPO"
  case "$TIPO" in
    1) MODO="producao"; break ;;
    2) MODO="teste"; break ;;
    *) aviso "Responda 1 ou 2." ;;
  esac
done

# ---------- 1. servidor web ----------
titulo "1. Servidor web"
NGINX_INST=0; APACHE_INST=0; NGINX_ATIVO=0; APACHE_ATIVO=0
pacote_instalado nginx   && NGINX_INST=1
pacote_instalado apache2 && APACHE_INST=1
servico_ativo nginx      && NGINX_ATIVO=1
servico_ativo apache2    && APACHE_ATIVO=1
situacao() { if [[ $2 -eq 1 ]]; then echo "${VERDE}instalado e rodando${FIM}"; elif [[ $1 -eq 1 ]]; then echo "instalado, parado"; else echo "não instalado"; fi; }
echo "  nginx:  $(situacao $NGINX_INST $NGINX_ATIVO)"
echo "  Apache: $(situacao $APACHE_INST $APACHE_ATIVO)"

escolher_servidor() {
  while true; do
    pergunta ESCOLHA "Usar qual servidor? (nginx/apache)" "$1"
    case "${ESCOLHA,,}" in
      nginx|n)          SERVIDOR="nginx";  return ;;
      apache|apache2|a) SERVIDOR="apache"; return ;;
      *) aviso "Responda nginx ou apache." ;;
    esac
  done
}

if [[ "$MODO" == "teste" && $NGINX_ATIVO -eq 1 && $APACHE_ATIVO -eq 0 ]]; then
  SERVIDOR="nginx";  ok "Vou usar o nginx que já está rodando (nenhum site existente será alterado)."
elif [[ "$MODO" == "teste" && $APACHE_ATIVO -eq 1 && $NGINX_ATIVO -eq 0 ]]; then
  SERVIDOR="apache"; ok "Vou usar o Apache que já está rodando (nenhum site existente será alterado)."
else
  SUGESTAO="${SERVIDOR:-}"
  if [[ -z "$SUGESTAO" ]]; then
    if   [[ $NGINX_INST -eq 1 && $APACHE_INST -eq 0 ]]; then SUGESTAO="nginx"
    elif [[ $APACHE_INST -eq 1 && $NGINX_INST -eq 0 ]]; then SUGESTAO="apache"
    else SUGESTAO="nginx"; fi
  fi
  escolher_servidor "$SUGESTAO"
  ok "Servidor escolhido: $SERVIDOR"
fi

# ---------- 2. endereço ----------
if [[ "$MODO" == "producao" ]]; then
  titulo "2. Domínio"
  echo "  Informe o domínio ou subdomínio do site, sem http:// (ex.: webnetse.com.br ou site.webnetse.com.br)."
  PADRAO_DOMINIO="${DOMINIO:-}"
else
  titulo "2. Endereço de teste"
  echo "  Informe o domínio que já aponta para este servidor (ex.: grafana.webnetse.com.br)."
  echo "  O site de teste vai responder nesse domínio, numa porta separada."
  PADRAO_DOMINIO="${DOMINIO:-$(hostname -f 2>/dev/null || true)}"
fi
while true; do
  pergunta DOMINIO "Domínio ou subdomínio" "$PADRAO_DOMINIO"
  DOMINIO="${DOMINIO,,}"; DOMINIO="${DOMINIO#http://}"; DOMINIO="${DOMINIO#https://}"; DOMINIO="${DOMINIO%%/*}"; DOMINIO="${DOMINIO%%:*}"
  [[ "$DOMINIO" =~ ^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$ ]] && break
  aviso "Domínio inválido. Exemplo: site.webnetse.com.br"
done

WWW=""; EMAIL="${EMAIL:-}"; CERT=""; CHAVE=""
if [[ "$MODO" == "producao" ]]; then
  PORTA=80
  if [[ "$DOMINIO" != www.* ]]; then
    PADRAO_WWW="n"; [[ -n "${WWW_ANTERIOR:-}" ]] && PADRAO_WWW="s"
    if sim_nao "Também responder por www.$DOMINIO? (só se o DNS de www também apontar para cá)" "$PADRAO_WWW"; then
      WWW="www.$DOMINIO"
    fi
  fi
  while true; do
    pergunta EMAIL "E-mail para avisos do certificado (Let's Encrypt)" "$EMAIL"
    [[ "$EMAIL" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] && break
    aviso "E-mail inválido."
  done
else
  # Certificado existente para reaproveitar (certificados valem por domínio, não por porta)
  if [[ -f "/etc/letsencrypt/live/$DOMINIO/fullchain.pem" ]]; then
    CERT="/etc/letsencrypt/live/$DOMINIO/fullchain.pem"; CHAVE="/etc/letsencrypt/live/$DOMINIO/privkey.pem"
    ok "Certificado encontrado para $DOMINIO: o teste vai usar HTTPS."
  else
    DISPONIVEIS=()
    for d in /etc/letsencrypt/live/*/; do [[ -f "$d/fullchain.pem" ]] && DISPONIVEIS+=("$(basename "$d")"); done
    if [[ ${#DISPONIVEIS[@]} -gt 0 ]]; then
      aviso "Não há certificado com o nome $DOMINIO. Certificados neste servidor: ${DISPONIVEIS[*]}"
      aviso "Um certificado só funciona para o domínio que ele cobre."
    fi
    pergunta CAMINHO_CERT "Caminho do fullchain.pem para usar HTTPS (Enter = só HTTP)" ""
    if [[ -n "$CAMINHO_CERT" ]]; then
      [[ -f "$CAMINHO_CERT" ]] || erro "Arquivo não encontrado: $CAMINHO_CERT"
      CERT="$CAMINHO_CERT"
      pergunta CHAVE "Caminho da chave privada (privkey.pem)" "$(dirname "$CAMINHO_CERT")/privkey.pem"
      [[ -f "$CHAVE" ]] || erro "Arquivo não encontrado: $CHAVE"
    else
      aviso "Sem certificado: o teste vai usar HTTP (sem cadeado)."
    fi
  fi

  PADRAO_PORTA="${PORTA:-}"; [[ -z "$PADRAO_PORTA" || "$PADRAO_PORTA" == "80" ]] && { [[ -n "$CERT" ]] && PADRAO_PORTA="8443" || PADRAO_PORTA="8080"; }
  while true; do
    pergunta PORTA "Porta do site de teste" "$PADRAO_PORTA"
    [[ "$PORTA" =~ ^[0-9]+$ && "$PORTA" -ge 1024 && "$PORTA" -le 65535 ]] || { aviso "Use um número entre 1024 e 65535."; continue; }
    # A porta pode estar em uso pela própria instalação de teste anterior
    if porta_em_uso "$PORTA" && ! grep -qs "webnet" "/etc/nginx/sites-enabled/webnet-teste" "/etc/apache2/sites-enabled/webnet-teste.conf" 2>/dev/null; then
      aviso "A porta $PORTA já está em uso neste servidor. Escolha outra."; continue
    fi
    break
  done
fi

titulo "Opções avançadas (Enter mantém o padrão)"
pergunta REPO   "Repositório do GitHub" "${REPO:-$REPO_PADRAO}"
pergunta BRANCH "Branch" "${BRANCH:-$BRANCH_PADRAO}"
pergunta DIR    "Pasta do site no servidor" "${DIR:-$DIR_PADRAO}"

if [[ "$MODO" == "producao" ]]; then
  ENDERECO="https://$DOMINIO"
else
  ENDERECO="$([[ -n "$CERT" ]] && echo https || echo http)://$DOMINIO:$PORTA"
fi

# ---------- resumo ----------
titulo "Resumo"
echo "  Tipo:          $([[ "$MODO" == "teste" ]] && echo "teste em outra porta" || echo "definitiva")"
echo "  Servidor web:  $SERVIDOR"
echo "  Endereço:      $ENDERECO${WWW:+  (e https://$WWW)}"
[[ "$MODO" == "producao" ]] && echo "  E-mail:        $EMAIL"
[[ -n "$CERT" ]] && echo "  Certificado:   $CERT"
echo "  Repositório:   $REPO ($BRANCH)"
echo "  Pasta:         $DIR"
sim_nao "Confirmar e instalar?" "s" || erro "Instalação cancelada."

# ---------- 3. pacotes ----------
titulo "3. Instalando pacotes"
export DEBIAN_FRONTEND=noninteractive
PACOTES=(git ca-certificates imagemagick)
[[ "$MODO" == "producao" ]] && PACOTES+=(certbot)
if [[ "$SERVIDOR" == "nginx" ]]; then
  PACOTES+=(nginx);   [[ "$MODO" == "producao" ]] && PACOTES+=(python3-certbot-nginx)
else
  PACOTES+=(apache2); [[ "$MODO" == "producao" ]] && PACOTES+=(python3-certbot-apache)
fi
FALTANDO=()
for p in "${PACOTES[@]}"; do pacote_instalado "$p" || FALTANDO+=("$p"); done
if [[ ${#FALTANDO[@]} -gt 0 ]]; then
  echo "  Instalando: ${FALTANDO[*]}"
  apt-get update -qq
  apt-get install -y -qq "${FALTANDO[@]}" >/dev/null
fi
ok "Pacotes prontos: ${PACOTES[*]}"

# Só na instalação definitiva: o outro servidor web ocupando a porta 80 impede o site de funcionar
if [[ "$MODO" == "producao" ]]; then
  OUTRO="apache2"; [[ "$SERVIDOR" == "apache" ]] && OUTRO="nginx"
  if servico_ativo "$OUTRO"; then
    aviso "O $OUTRO também está rodando e pode estar ocupando as portas 80/443."
    if sim_nao "Parar e desativar o $OUTRO?" "s"; then
      systemctl disable --now "$OUTRO" >/dev/null 2>&1 || true
      ok "$OUTRO desativado."
    else
      aviso "Mantido. Se houver conflito de porta, o $SERVIDOR não vai iniciar."
    fi
  fi
fi

# ---------- 4. código do site ----------
titulo "4. Baixando o site do GitHub"
if [[ -d "$DIR/.git" ]]; then
  git -C "$DIR" remote set-url origin "$REPO"
  git -C "$DIR" fetch -q --tags --prune origin
  git -C "$DIR" checkout -q -f "$BRANCH"
  git -C "$DIR" reset -q --hard "origin/$BRANCH"
  ok "Site atualizado em $DIR"
else
  if [[ -e "$DIR" && -n "$(ls -A "$DIR" 2>/dev/null)" ]]; then
    BACKUP="$DIR.backup-$(date +%Y%m%d-%H%M%S)"
    aviso "$DIR já existe e não veio do GitHub. Movendo para $BACKUP"
    mv "$DIR" "$BACKUP"
  fi
  mkdir -p "$(dirname "$DIR")"
  git clone -q --branch "$BRANCH" "$REPO" "$DIR"
  ok "Site baixado em $DIR"
fi
git config --system --add safe.directory "$DIR" 2>/dev/null || true
VERSAO="$(git -C "$DIR" describe --tags --always 2>/dev/null || echo "?")"

# Permissões: arquivos só leitura para o servidor web; pasta fotos/ gravável pelo grupo www-data
mkdir -p "$DIR/fotos"
chown -R root:root "$DIR"
find "$DIR" -path "$DIR/.git" -prune -o -type d -exec chmod 755 {} +
find "$DIR" -path "$DIR/.git" -prune -o -type f -exec chmod 644 {} +
chgrp -R www-data "$DIR/fotos"
chmod 2775 "$DIR/fotos"
ok "Permissões ajustadas (fotos/ gravável pelo grupo www-data)"

# ---------- 5. configuração do servidor web ----------
titulo "5. Configurando o $SERVIDOR"
NOMES="$DOMINIO${WWW:+ $WWW}"
# Política de conteúdo (CSP): só carrega scripts do próprio site, do VLibras (governo federal)
# e das estatísticas GoatCounter. 'unsafe-eval'/'wasm-unsafe-eval' são exigidos pelo VLibras.
VLB="https://vlibras.gov.br https://*.vlibras.gov.br https://cdn.jsdelivr.net"
CSP="default-src 'self'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' $VLB https://gc.zgo.at; style-src 'self' 'unsafe-inline' $VLB; img-src 'self' data: blob: $VLB; font-src 'self' data: $VLB; connect-src 'self' blob: data: $VLB https://*.goatcounter.com; worker-src 'self' blob:; media-src 'self' blob: $VLB; object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
SITE="webnet"; [[ "$MODO" == "teste" ]] && SITE="webnet-teste"

if [[ "$SERVIDOR" == "nginx" ]]; then
  mkdir -p /etc/nginx/snippets
  cat > /etc/nginx/snippets/webnet-seguranca.conf <<EOF
# Cabeçalhos de segurança do site da WebNet (incluídos em cada bloco do site)
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Content-Security-Policy "$CSP" always;
EOF
  [[ "$MODO" == "producao" ]] && echo "add_header Strict-Transport-Security \"max-age=31536000\" always;" >> /etc/nginx/snippets/webnet-seguranca.conf
  if [[ -n "$CERT" ]]; then
    LISTEN="    listen $PORTA ssl;
    listen [::]:$PORTA ssl;
    ssl_certificate     $CERT;
    ssl_certificate_key $CHAVE;
    # Quem abrir com http:// nesta porta é levado para https://
    error_page 497 =301 https://\$host:\$server_port\$request_uri;"
  else
    LISTEN="    listen $PORTA;
    listen [::]:$PORTA;"
  fi
  cat > "/etc/nginx/sites-available/$SITE" <<EOF
# Site da WebNet ($MODO) — gerado por deploy/instalar.sh
server {
$LISTEN
    server_name $NOMES;

    root $DIR;
    index index.html;
    charset utf-8;

    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;

    error_page 404 /404.html;
    include snippets/webnet-seguranca.conf;

    # Arquivos internos do projeto não são publicados (vêm antes das demais regras)
    location ~ /\.(?!well-known) { deny all; }
    location ^~ /deploy/ { deny all; }
    location ~* \.(md|bat|sh)\$ { deny all; }
    location ~ ^/gerar-(galeria|cidades)\.js\$ { deny all; }

    location / {
        try_files \$uri \$uri/ =404;
    }

    # Páginas: sempre conferidas com o servidor, para mostrar a versão nova após um deploy
    location ~* \.html\$ {
        include snippets/webnet-seguranca.conf;
        add_header Cache-Control "no-cache";
    }

    # Carrossel: o site lê a lista de imagens desta pasta
    location /fotos/ {
        autoindex on;
        autoindex_format json;
        include snippets/webnet-seguranca.conf;
        add_header Cache-Control "no-cache";
    }

    # CSS e JS levam ?v=versão a cada deploy, então podem ficar em cache
    location ~* \.(css|js|svg|png|jpe?g|webp|gif|avif|ico|woff2)\$ {
        expires 30d;
        include snippets/webnet-seguranca.conf;
        add_header Cache-Control "public";
    }
}
EOF
  ln -sf "/etc/nginx/sites-available/$SITE" "/etc/nginx/sites-enabled/$SITE"
  if ! nginx -t >/dev/null 2>&1; then
    nginx -t || true
    rm -f "/etc/nginx/sites-enabled/$SITE"
    erro "Configuração do nginx inválida. O site novo foi desativado e os sites existentes continuam como estavam."
  fi
  systemctl enable --now nginx >/dev/null 2>&1
  systemctl reload nginx
  PLUGIN="nginx"
else
  a2enmod -q headers expires deflate >/dev/null
  SSL_APACHE=""
  if [[ -n "$CERT" ]]; then
    # Ativar o mod_ssl liga a porta 443 no Apache: só faz isso se ele já estiver ativo ou a 443 estiver livre
    if a2query -q -m ssl 2>/dev/null || ! porta_em_uso 443; then
      a2enmod -q ssl >/dev/null
      SSL_APACHE="    SSLEngine on
    SSLCertificateFile $CERT
    SSLCertificateKeyFile $CHAVE"
    else
      aviso "O módulo SSL do Apache está desligado e a porta 443 é usada por outro serviço."
      aviso "Para não afetar esse serviço, o teste vai usar HTTP."
      CERT=""; CHAVE=""; ENDERECO="http://$DOMINIO:$PORTA"
    fi
  fi
  LISTEN_APACHE=""
  if [[ "$MODO" == "teste" ]] && ! grep -rqsE "^\s*Listen\s+([0-9.:\[\]]*:)?$PORTA\b" /etc/apache2/ports.conf /etc/apache2/conf-enabled; then
    LISTEN_APACHE="Listen $PORTA"
  fi
  cat > "/etc/apache2/sites-available/$SITE.conf" <<EOF
# Site da WebNet ($MODO) — gerado por deploy/instalar.sh
$LISTEN_APACHE
<VirtualHost *:$PORTA>
    ServerName $DOMINIO
    ${WWW:+ServerAlias $WWW}
    DocumentRoot $DIR
$SSL_APACHE

    <Directory $DIR>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    # Carrossel: o site lê a lista de imagens desta pasta
    <Directory $DIR/fotos>
        Options +Indexes
    </Directory>
    <LocationMatch "^/fotos/\$">
        Header set Cache-Control "no-cache"
    </LocationMatch>

    # Arquivos internos do projeto não são publicados
    <DirectoryMatch "^$DIR/(\.git|deploy|fotos/\.originais)">
        Require all denied
    </DirectoryMatch>
    <FilesMatch "(\.(md|bat|sh)|^gerar-(galeria|cidades)\.js|^\.git.*)\$">
        Require all denied
    </FilesMatch>

    ErrorDocument 404 /404.html

    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Content-Security-Policy "$CSP"
    $( [[ "$MODO" == "producao" ]] && echo 'Header always set Strict-Transport-Security "max-age=31536000"' || echo '# HSTS só na instalação definitiva' )

    # Páginas: sempre conferidas com o servidor, para mostrar a versão nova após um deploy
    <FilesMatch "\.html\$">
        Header set Cache-Control "no-cache"
    </FilesMatch>

    # CSS e JS levam ?v=versão a cada deploy, então podem ficar em cache
    ExpiresActive On
    ExpiresByType text/css "access plus 30 days"
    ExpiresByType application/javascript "access plus 30 days"
    ExpiresByType text/javascript "access plus 30 days"
    ExpiresByType image/svg+xml "access plus 30 days"
    ExpiresByType image/png "access plus 30 days"
    ExpiresByType image/jpeg "access plus 30 days"
    ExpiresByType image/webp "access plus 30 days"
    ExpiresByType font/woff2 "access plus 30 days"

    AddOutputFilterByType DEFLATE text/html text/css application/javascript image/svg+xml

    ErrorLog \${APACHE_LOG_DIR}/$SITE-erro.log
    CustomLog \${APACHE_LOG_DIR}/$SITE-acesso.log combined
</VirtualHost>
EOF
  a2ensite -q "$SITE" >/dev/null
  if ! apache2ctl configtest >/dev/null 2>&1; then
    apache2ctl configtest || true
    a2dissite -q "$SITE" >/dev/null || true
    erro "Configuração do Apache inválida. O site novo foi desativado e os sites existentes continuam como estavam."
  fi
  systemctl enable --now apache2 >/dev/null 2>&1
  systemctl reload apache2
  PLUGIN="apache"
fi
ok "$SERVIDOR configurado: $ENDERECO"

# Firewall (se o UFW estiver ativo)
if command -v ufw >/dev/null && ufw status 2>/dev/null | grep -q "Status: active"; then
  if [[ "$MODO" == "teste" ]]; then
    ufw allow "$PORTA/tcp" >/dev/null
    ok "Firewall liberado na porta $PORTA"
  elif [[ "$SERVIDOR" == "nginx" ]]; then
    ufw allow "Nginx Full" >/dev/null; ok "Firewall liberado para HTTP e HTTPS"
  else
    ufw allow "WWW Full" >/dev/null;   ok "Firewall liberado para HTTP e HTTPS"
  fi
fi

# ---------- 6. certificado HTTPS (só na instalação definitiva) ----------
CERT_OK=0
if [[ "$MODO" == "producao" ]]; then
  titulo "6. Certificado HTTPS (Let's Encrypt)"
  IPS_LOCAIS="$(hostname -I 2>/dev/null || true)"
  DNS_OK=1
  for d in $NOMES; do
    IP_DNS="$(getent ahostsv4 "$d" 2>/dev/null | awk 'NR==1{print $1}' || true)"
    if [[ -z "$IP_DNS" ]]; then
      aviso "$d ainda não tem registro DNS."; DNS_OK=0
    else
      echo "  $d aponta para $IP_DNS"
      [[ " $IPS_LOCAIS " == *" $IP_DNS "* ]] || aviso "Esse IP não está entre os IPs deste servidor ($IPS_LOCAIS). Se o servidor estiver atrás de NAT, pode estar tudo certo."
    fi
  done

  PADRAO_CERT="s"; [[ $DNS_OK -eq 0 ]] && PADRAO_CERT="n"
  if sim_nao "Emitir o certificado agora? (o DNS precisa já apontar para este servidor)" "$PADRAO_CERT"; then
    DOMINIOS_CERT=(-d "$DOMINIO"); [[ -n "$WWW" ]] && DOMINIOS_CERT+=(-d "$WWW")
    if certbot --"$PLUGIN" "${DOMINIOS_CERT[@]}" --non-interactive --agree-tos -m "$EMAIL" --redirect --keep-until-expiring; then
      CERT_OK=1
      ok "Certificado emitido. HTTP agora redireciona para HTTPS."
      if systemctl list-timers 2>/dev/null | grep -q certbot; then ok "Renovação automática ativa (certbot.timer)."; else aviso "Confira a renovação automática com: certbot renew --dry-run"; fi
    else
      aviso "Não foi possível emitir o certificado. Confira o DNS e rode depois:"
      echo "      ${SUDO}certbot --$PLUGIN ${DOMINIOS_CERT[*]} -m $EMAIL --agree-tos --redirect"
    fi
  else
    aviso "Certificado não emitido. Quando o DNS estiver pronto, rode este instalador de novo."
  fi
  [[ $CERT_OK -eq 1 ]] || ENDERECO="http://$DOMINIO"
fi

# ---------- publicação: versão nos arquivos e otimização de fotos ----------
bash "$DIR/deploy/carimbar.sh" "$DIR" "$ENDERECO"
cat > /etc/cron.d/webnet-fotos <<EOF
# Otimiza as fotos do carrossel do site da WebNet a cada 5 minutos
*/5 * * * * root bash $DIR/deploy/otimizar-fotos.sh $DIR/fotos >/dev/null 2>&1
EOF
chmod 644 /etc/cron.d/webnet-fotos
ok "Fotos enviadas para $DIR/fotos/ serão otimizadas automaticamente a cada 5 minutos"

# ---------- 7. comando de atualização ----------
titulo "7. Comando de atualização"
cat > /usr/local/bin/webnet-atualizar <<EOF
#!/usr/bin/env bash
exec bash "$DIR/deploy/atualizar.sh" "\$@"
EOF
chmod 755 /usr/local/bin/webnet-atualizar
ok "Criado: webnet-atualizar"

# Guarda as respostas para a próxima execução e para o webnet-atualizar
cat > "$CONF" <<EOF
# Gerado por deploy/instalar.sh em $(date '+%d/%m/%Y %H:%M')
MODO="$MODO"
SERVIDOR="$SERVIDOR"
DOMINIO="$DOMINIO"
PORTA="$PORTA"
WWW_ANTERIOR="$WWW"
EMAIL="$EMAIL"
REPO="$REPO"
BRANCH="$BRANCH"
DIR="$DIR"
ENDERECO="$ENDERECO"
EOF
chmod 600 "$CONF"

# Aviso: a Área do Cliente usa um endereço /client no mesmo domínio?
if [[ "$MODO" == "producao" ]]; then
  AREA="$(grep -oE 'AREA_CLIENTE_WEB = "https?://[^/"]+' "$DIR/config.js" 2>/dev/null | sed -E 's#.*://##' || true)"
  if [[ -n "$AREA" && ( "$AREA" == "$DOMINIO" || "$AREA" == "$WWW" ) ]]; then
    aviso "A Área do Cliente (config.js) usa https://$AREA/... — o mesmo endereço deste site."
    aviso "Se o sistema de clientes roda em outro servidor, o /client vai parar de funcionar."
    aviso "Nesse caso, use um subdomínio para o site ou configure um proxy para /client."
  fi
fi

# ---------- fim ----------
titulo "Pronto!"
echo "  Site:            ${NEGRITO}$ENDERECO${FIM}   (versão $VERSAO)"
echo "  Pasta:           $DIR"
echo "  Fotos:           envie para $DIR/fotos/ (aparecem sozinhas no carrossel)"
echo "                   para enviar por SFTP com seu usuário:  ${SUDO}usermod -aG www-data SEU_USUARIO"
echo "  Atualizar site:  ${SUDO}webnet-atualizar"
echo "  Outra versão:    ${SUDO}webnet-atualizar v0.2.1      (lista: ${SUDO}webnet-atualizar --versoes)"
if [[ "$MODO" == "teste" ]]; then
  echo
  echo "  ${AMARELO}Se o servidor estiver atrás de firewall do provedor ou de NAT, libere também a porta $PORTA lá.${FIM}"
  if [[ "$SERVIDOR" == "nginx" ]]; then
    echo "  Para remover o teste:  ${SUDO}rm /etc/nginx/sites-enabled/webnet-teste && ${SUDO}systemctl reload nginx"
  else
    echo "  Para remover o teste:  ${SUDO}a2dissite webnet-teste && ${SUDO}systemctl reload apache2"
  fi
fi
echo
