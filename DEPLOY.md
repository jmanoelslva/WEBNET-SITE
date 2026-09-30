# Publicação em servidor Debian (nginx)

Guia para hospedar o site da WebNet em um servidor Debian 12 com nginx e HTTPS gratuito (Let's Encrypt).
O site é estático: não precisa de PHP, banco de dados nem Node.js no servidor.

Nos exemplos, o domínio é `webnetprovedor.com`. Troque pelo domínio real e aponte o DNS (registros `A` de `webnetprovedor.com` e `www`) para o IP do servidor antes do passo 4.

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
