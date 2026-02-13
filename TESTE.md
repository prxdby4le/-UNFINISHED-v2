# 🧪 Guia para Testar o Trashtalk Records

## Opção 1: Docker (recomendado)

### Passo a passo

```bash
# 1. Parar containers de produção (se estiverem rodando)
docker compose down

# 2. Garantir que .env existe (usa config do Docker)
cp .env.docker.example .env   # só se .env não existir

# 3. Subir ambiente de desenvolvimento
docker compose -f docker-compose.dev.yml up -d --build

# Aguarde o build (primeira vez pode levar 5–10 min). Depois:

# 4. Gerar chave da aplicação
docker compose -f docker-compose.dev.yml exec app php artisan key:generate

# 5. Rodar migrations
docker compose -f docker-compose.dev.yml exec app php artisan migrate

# 6. (Opcional) Criar usuário para teste
docker compose -f docker-compose.dev.yml exec app php artisan tinker
# No tinker: \App\Models\User::factory()->create(['email' => 'teste@teste.com']);
```

### URLs

- **App**: http://localhost:8000
- **Vite HMR**: http://localhost:5173 (hot reload automático)

### Comandos úteis

```bash
# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Shell no container
docker compose -f docker-compose.dev.yml exec app sh

# Parar
docker compose -f docker-compose.dev.yml down
```

---

## Opção 2: Ambiente local (sem Docker)

### Pré-requisitos

- PHP 8.2+, Node 20+, Composer, npm
- SQLite (ou MySQL/PostgreSQL configurado no .env)

### Passo a passo

```bash
# 1. Corrigir permissões (necessário se já rodou Docker antes)
sudo chown -R $(whoami):$(whoami) public/build

# 2. Instalar dependências
composer install
npm install

# 3. Configurar ambiente
cp .env.example .env
php artisan key:generate

# 4. Banco SQLite (padrão do .env.example)
touch database/database.sqlite
php artisan migrate

# 5. Subir tudo (Laravel + Vite + Queue)
composer run dev
```

### URLs

- **App**: http://localhost:8000 (ou porta exibida no terminal)

---

## 🔧 Problema de permissão em `public/build`

Se aparecer `EACCES, Permission denied: public/build/assets` ao rodar `npm run build`:

```bash
sudo chown -R $(whoami):$(whoami) public/build
```

Motivo: o Docker cria esses arquivos como root, e o usuário local não consegue sobrescrevê-los.

---

## ✅ Checklist de teste

1. [ ] Acessar http://localhost:8000
2. [ ] Registrar novo usuário
3. [ ] Criar um projeto
4. [ ] Fazer upload de áudio
5. [ ] Usar o player de áudio
6. [ ] Adicionar comentários no feedback
7. [ ] Ver e editar perfil
8. [ ] Baixar faixas (individual e ZIP)

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Porta 8000 em uso | Parar outros containers ou alterar `APP_PORT` no .env |
| Erro de conexão com DB | Verificar credenciais em .env (Docker: db/trashtalk/password) |
| CSS/JS não carrega | Conferir se o container `node` está rodando (Vite em dev) |
| Erro 500 | Ver logs: `docker compose -f docker-compose.dev.yml logs app` |
