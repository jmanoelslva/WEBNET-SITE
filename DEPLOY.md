# Publicação em servidor Debian (nginx ou Apache)

Guia para hospedar o site da WebNet em um servidor Debian 12 (ou Ubuntu) com HTTPS gratuito (Let's Encrypt).
O site é estático: não precisa de PHP, banco de dados nem Node.js no servidor.

## Instalação automática (recomendado)

A pasta `deploy/` tem dois scripts que fazem tudo sozinhos. Os dois foram testados em Debian 12, com nginx e com Apache.

### Primeira instalação

No servidor, como root (ou com `sudo` na frente de cada comando):

```bash
curl -fsSL https://raw.githubusercontent.com/jmanoelslva/WEBNET-SITE/main/deploy/instalar.sh -o instalar.sh
```

```bash
bash instalar.sh
```

O instalador começa perguntando o tipo de instalação:

- **1) Definitiva:** o site responde no domínio, nas portas 80 e 443, com certificado novo.
- **2) Teste em outra porta:** para um servidor que já roda outro serviço, como o Grafana em `grafana.webnetse.com.br`. Usa o nginx ou o Apache que já está rodando, cria um site separado numa porta à sua escolha (por exemplo `https://grafana.webnetse.com.br:9443`) e reaproveita o certificado que o servidor já tem. Não altera as portas 80 e 443 nem os sites existentes, e não emite certificado novo. Para remover depois: `a2dissite webnet-teste && systemctl reload apache2` (Apache) ou `rm /etc/nginx/sites-enabled/webnet-teste && systemctl reload nginx` (nginx).

Na instalação definitiva, o instalador:

1. mostra se o **nginx** ou o **Apache** já estão instalados e pergunta qual usar. Instala o escolhido se faltar e oferece desativar o outro, para não disputarem a porta 80;
2. pergunta o **domínio ou subdomínio** (e se também deve responder pelo `www`) e o **e-mail** para o certificado;
3. instala Git e Certbot;
4. baixa o site do GitHub em `/var/www/webnet`;
5. configura o servidor web: listagem da pasta `fotos/` para o carrossel, cache, cabeçalhos de segurança e bloqueio de arquivos internos (`.git`, `deploy/`, `.md`, `.bat`);
6. confere o DNS e emite o **certificado HTTPS do Let's Encrypt**, com redirecionamento de HTTP para HTTPS e renovação automática;
7. cria o comando `webnet-atualizar`.

O DNS do domínio precisa apontar para o servidor antes de emitir o certificado. Se ainda não estiver, responda "n" na pergunta do certificado e rode o instalador de novo depois: ele reaproveita as respostas anteriores, salvas em `/etc/webnet-site.conf`.

### Atualizar o site (deploy)

Depois de enviar mudanças ao GitHub:

```bash
webnet-atualizar
```

Outras opções:

```bash
webnet-atualizar --versoes
```

```bash
webnet-atualizar v0.2.1
```

O primeiro lista as versões (tags) disponíveis; o segundo instala uma versão específica, por exemplo para voltar atrás. A pasta `fotos/` nunca é alterada pela atualização.

### Atenção: portal /client

A Área do Cliente usa `https://webnetse.com.br/client`. Se o site for instalado no próprio `webnetse.com.br` e o sistema de clientes estiver em outro servidor, o `/client` deixa de funcionar. Prefira um subdomínio para o site ou configure um proxy para `/client`. O instalador avisa quando detecta esse caso.

---

## Instalação manual

Se preferir configurar tudo à mão, siga os passos abaixo. Nos exemplos, o domínio é `webnetprovedor.com`: troque pelo domínio real e aponte o DNS (registros `A` do domínio e do `www`) para o IP do servidor antes do passo 4.

## 1. Instalar o nginx, o Git e o Certbot

```bash
sudo apt update
sudo apt install -y nginx git certbot python3-certbot-nginx
```

## 2. Baixar o site

```bash
sudo git clone https://github.com/jmanoelslva/WEBNET-SITE.git /var/www/webnet
sudo chown -R www-data:www-data /var/www/webnet
```

A pasta `fotos/` vem vazia. As imagens do carrossel são enviadas direto para o servidor (passo 5), não pelo Git.

## 3. Configurar o nginx

Crie o arquivo `/etc/nginx/sites-available/webnet`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name webnetprovedor.com www.webnetprovedor.com;

    root /var/www/webnet;
    index index.html;
    charset utf-8;

    # Compressão de texto
    gzip on;
    gzip_types text/css application/javascript image/svg+xml application/json;

    # Segurança básica
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        try_files $uri $uri/ =404;
    }

    # Carrossel: o site lê a lista de imagens desta pasta sozinho.
    # Basta enviar a foto para /var/www/webnet/fotos/.
    # A lista não fica em cache, para fotos novas aparecerem na hora;
    # as imagens em si usam o cache do bloco seguinte.
    location /fotos/ {
        autoindex on;
        autoindex_format json;
        add_header Cache-Control "no-cache";
    }

    # Cache de imagens, estilos e scripts
    location ~* \.(css|js|svg|png|jpe?g|webp|gif|avif|ico)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # Não publicar arquivos internos do projeto
    location ~ /\.(?!well-known) { deny all; }
    location ~* \.(md|bat)$ { deny all; }
    location = /gerar-galeria.js { deny all; }
}
```

Ative e recarregue:

```bash
sudo ln -s /etc/nginx/sites-available/webnet /etc/nginx/sites-enabled/webnet
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Ativar HTTPS

```bash
sudo certbot --nginx -d webnetprovedor.com -d www.webnetprovedor.com
```

O Certbot ajusta a configuração para HTTPS e renova o certificado automaticamente.

## 5. Enviar fotos para o carrossel

Envie as imagens para `/var/www/webnet/fotos/` por SFTP (por exemplo, com o WinSCP ou o FileZilla) ou pelo terminal:

```bash
scp promocao-outubro.jpg usuario@servidor:/var/www/webnet/fotos/
```

As fotos aparecem no site na próxima visita, das mais recentes para as mais antigas. Para apagar uma foto do carrossel, apague o arquivo da pasta.

Recomendações:

- Prefira JPG ou WEBP com até 1600 px de largura e até ~300 KB. Capturas de tela em PNG costumam ter vários MB e deixam o site lento no celular.
- Nomeie os arquivos de forma descritiva, sem acentos, por exemplo `inauguracao-bairro-sao-jose.jpg`.
- Para exibir título, texto ou botão em uma foto, acrescente um bloco para ela em `galeria.js` (veja os comentários no arquivo).

## 6. Atualizar o site

Depois de enviar mudanças ao GitHub:

```bash
cd /var/www/webnet
sudo -u www-data git pull
```

As fotos da pasta `fotos/` não são afetadas, porque o Git as ignora.

## Usando Apache em vez de nginx

O site funciona igual no Apache. Para o carrossel ler a pasta sozinho, ative a listagem só na pasta de fotos, no `VirtualHost`:

```apache
<Directory /var/www/webnet/fotos>
    Options +Indexes
</Directory>
```

Se preferir não ativar a listagem, rode `node gerar-galeria.js` (ou `atualizar-galeria.bat` no Windows) após adicionar fotos e envie o `galeria.js` gerado.
