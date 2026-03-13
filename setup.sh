#!/usr/bin/env bash
# =============================================================================
# setup.sh — VPS Ubuntu 24.04 (Hostinger) setup for [UNFINISHED]
# Stack: Docker + Nginx reverse proxy + Certbot SSL
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# CONFIGURE THESE VARIABLES BEFORE RUNNING
# ---------------------------------------------------------------------------
DOMAIN="${DOMAIN:-SEU-DOMINIO.COM}"
APP_PORT="8001"
GIT_REPO="https://github.com/prxdby4le/-UNFINISHED-v2.git"
PROJECT_DIR="/var/www/${DOMAIN}"
APP_KEY="${APP_KEY:-}"
DB_PASSWORD="${DB_PASSWORD:-$(openssl rand -base64 24)}"
DB_USERNAME="${DB_USERNAME:-trashtalk}"
DB_DATABASE="${DB_DATABASE:-trashtalk}"

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# Must run as root
[[ $EUID -ne 0 ]] && error "Execute como root: sudo bash setup.sh"

echo ""
echo "============================================="
echo "  [UNFINISHED] — VPS Setup"
echo "  Domain: ${DOMAIN}"
echo "============================================="
echo ""

# =====================================================================
# 1. SYSTEM UPDATE
# =====================================================================
info "Atualizando sistema..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
  ca-certificates curl gnupg lsb-release git ufw fail2ban \
  logrotate software-properties-common unzip

# =====================================================================
# 2. FIREWALL (UFW)
# =====================================================================
info "Configurando firewall (UFW)..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   comment "SSH"
ufw allow 80/tcp   comment "HTTP"
ufw allow 443/tcp  comment "HTTPS"
ufw --force enable
info "UFW ativo — portas 22, 80, 443 liberadas"

# =====================================================================
# 3. FAIL2BAN (proteção SSH)
# =====================================================================
info "Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local <<'JAIL'
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port    = ssh
backend = systemd
JAIL
systemctl enable --now fail2ban

# =====================================================================
# 4. DOCKER + DOCKER COMPOSE
# =====================================================================
if ! command -v docker &>/dev/null; then
  info "Instalando Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
    https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "${VERSION_CODENAME}") stable" \
    > /etc/apt/sources.list.d/docker.list

  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin

  systemctl enable --now docker
  info "Docker instalado"
else
  info "Docker já instalado, pulando..."
fi

# Add current sudo user to docker group
SUDO_USER_NAME="${SUDO_USER:-$USER}"
if id "$SUDO_USER_NAME" &>/dev/null && [ "$SUDO_USER_NAME" != "root" ]; then
  usermod -aG docker "$SUDO_USER_NAME"
  info "Usuário ${SUDO_USER_NAME} adicionado ao grupo docker"
fi

# =====================================================================
# 5. NGINX (host reverse proxy)
# =====================================================================
info "Instalando Nginx..."
apt-get install -y -qq nginx

cat > "/etc/nginx/sites-available/${DOMAIN}" <<NGINX
upstream app_backend {
    server 127.0.0.1:${APP_PORT};
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    client_max_body_size 0;

    # Security headers
    add_header X-Frame-Options        "SAMEORIGIN"       always;
    add_header X-Content-Type-Options "nosniff"          always;
    add_header X-XSS-Protection       "1; mode=block"    always;
    add_header Referrer-Policy         "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass         http://app_backend;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Connection        "";

        proxy_buffering        off;
        proxy_request_buffering off;
        proxy_read_timeout     300s;
        proxy_send_timeout     300s;
    }

    # Cache static assets served by the app
    location ~* \.(jpg|jpeg|png|gif|webp|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://app_backend;
        proxy_set_header Host \$host;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/${DOMAIN}" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx
info "Nginx configurado como reverse proxy para :${APP_PORT}"

# =====================================================================
# 6. CERTBOT (SSL) — executar após DNS apontar para a VPS
# =====================================================================
info "Instalando Certbot..."
apt-get install -y -qq certbot python3-certbot-nginx

warn "============================================="
warn "SSL: Execute APÓS o DNS apontar para esta VPS:"
warn ""
warn "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
warn ""
warn "O Certbot vai alterar o server block automaticamente."
warn "Renovação automática já está configurada via systemd timer."
warn "============================================="

# =====================================================================
# 7. LOG ROTATION
# =====================================================================
info "Configurando rotação de logs..."

cat > /etc/logrotate.d/docker-containers <<'LOGROTATE'
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
    maxsize 50M
}
LOGROTATE

cat > "/etc/logrotate.d/${DOMAIN//\./-}" <<LOGROTATE
/var/log/nginx/${DOMAIN}*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \$(cat /var/run/nginx.pid)
    endscript
}
LOGROTATE

# Docker daemon log limits
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'DAEMON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "5"
  }
}
DAEMON
systemctl restart docker

# =====================================================================
# 8. PROJECT DIRECTORY + CLONE
# =====================================================================
info "Criando diretório do projeto..."
mkdir -p "${PROJECT_DIR}"

if [ -d "${PROJECT_DIR}/.git" ]; then
  info "Repositório já existe, atualizando..."
  cd "${PROJECT_DIR}" && git pull
else
  info "Clonando repositório..."
  git clone "${GIT_REPO}" "${PROJECT_DIR}"
fi

cd "${PROJECT_DIR}"

# Fix ownership
if [ "$SUDO_USER_NAME" != "root" ]; then
  chown -R "${SUDO_USER_NAME}:${SUDO_USER_NAME}" "${PROJECT_DIR}"
fi

# =====================================================================
# 9. ENVIRONMENT FILE
# =====================================================================
info "Gerando .env de produção..."

if [ -z "${APP_KEY}" ]; then
  warn "APP_KEY não definida. Gere uma com:"
  warn "  docker compose run --rm app php artisan key:generate --show"
  warn "E adicione ao .env manualmente."
  APP_KEY="base64:CHANGE_ME_AFTER_FIRST_RUN"
fi

cat > "${PROJECT_DIR}/.env" <<ENV
APP_NAME=UNFINISHED
APP_KEY=${APP_KEY}
APP_ENV=production
APP_DEBUG=false
APP_URL=https://${DOMAIN}

DB_DATABASE=${DB_DATABASE}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

APP_PORT=${APP_PORT}
ENV

chmod 600 "${PROJECT_DIR}/.env"
info ".env criado em ${PROJECT_DIR}/.env"

# =====================================================================
# 10. BUILD & START
# =====================================================================
info "Construindo e iniciando containers..."
cd "${PROJECT_DIR}"
docker compose build app
docker compose up -d

info "Aguardando containers ficarem healthy..."
sleep 10

if curl -sf -o /dev/null http://127.0.0.1:${APP_PORT}; then
  info "App respondendo na porta ${APP_PORT}"
else
  warn "App ainda não responde. Verifique com: docker compose logs -f"
fi

# =====================================================================
# 11. DEPLOY SCRIPT
# =====================================================================
info "Criando script de deploy rápido..."
cat > "${PROJECT_DIR}/deploy.sh" <<'DEPLOY'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "[deploy] Pulling latest code..."
git pull
echo "[deploy] Building..."
docker compose build app
echo "[deploy] Restarting..."
docker compose up -d app
echo "[deploy] Done! Checking health..."
sleep 5
docker compose ps
DEPLOY
chmod +x "${PROJECT_DIR}/deploy.sh"

# =====================================================================
# SUMMARY
# =====================================================================
echo ""
echo "============================================="
echo -e "${GREEN}  SETUP CONCLUÍDO${NC}"
echo "============================================="
echo ""
echo "  Domínio:    ${DOMAIN}"
echo "  Projeto:    ${PROJECT_DIR}"
echo "  App Port:   ${APP_PORT}"
echo "  DB User:    ${DB_USERNAME}"
echo "  DB Pass:    ${DB_PASSWORD}"
echo ""
echo "  Próximos passos:"
echo "  1. Aponte o DNS A record para o IP desta VPS"
echo "  2. Edite o .env se necessário: nano ${PROJECT_DIR}/.env"
echo "  3. Gere APP_KEY (se não definiu):"
echo "     cd ${PROJECT_DIR}"
echo "     docker compose run --rm app php artisan key:generate --show"
echo "  4. Instale SSL após DNS propagar:"
echo "     sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo "  5. Para futuros deploys:"
echo "     cd ${PROJECT_DIR} && ./deploy.sh"
echo ""
echo "============================================="
