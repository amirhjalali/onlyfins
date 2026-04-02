FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl ffmpeg nginx \
    && rm -rf /var/lib/apt/lists/*

# Download go2rtc
RUN curl -L -o /usr/local/bin/go2rtc \
    https://github.com/AlexxIT/go2rtc/releases/download/v1.9.14/go2rtc_linux_amd64 \
    && chmod +x /usr/local/bin/go2rtc

# Copy static site
COPY public/ /var/www/html/

# Nginx config: serve static files + proxy /stream/ to go2rtc
RUN cat > /etc/nginx/sites-available/default << 'NGINX'
server {
    listen 8080;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /stream/ {
        proxy_pass http://127.0.0.1:1984/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
NGINX

COPY stream/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
