# 🐳 Docker Setup - Trashtalk Records

Este projeto está dockerizado e pronto para desenvolvimento e produção.

## 📋 Pré-requisitos

- Docker Desktop (recomendado) ou Docker Engine + Docker Compose
- Mínimo 4GB de RAM disponível
- 10GB de espaço em disco

## 🚀 Início Rápido

### 1. Configurar variáveis de ambiente

```bash
cp .env.docker.example .env
```

Edite o arquivo `.env` com suas configurações.

### 2. Iniciar os containers

```bash
# Usando Makefile (recomendado)
make -f docker/Makefile setup

# Ou manualmente
docker-compose -f docker-compose.dev.yml up -d --build
```

### 3. Instalar dependências

```bash
# PHP
docker-compose -f docker-compose.dev.yml exec app composer install

# Node
docker-compose -f docker-compose.dev.yml exec node npm install
```

### 4. Configurar aplicação

```bash
# Gerar chave da aplicação
docker-compose -f docker-compose.dev.yml exec app php artisan key:generate

# Executar migrations
docker-compose -f docker-compose.dev.yml exec app php artisan migrate

# (Opcional) Executar seeders
docker-compose -f docker-compose.dev.yml exec app php artisan db:seed
```

### 5. Acessar aplicação

- **Aplicação**: http://localhost:8000
- **Vite Dev Server**: http://localhost:5173

## 📝 Comandos Úteis

### Usando Makefile

```bash
make -f docker/Makefile help          # Ver todos os comandos
make -f docker/Makefile up            # Iniciar containers
make -f docker/Makefile down          # Parar containers
make -f docker/Makefile logs          # Ver logs
make -f docker/Makefile shell         # Abrir shell no container
make -f docker/Makefile migrate       # Executar migrations
make -f docker/Makefile test          # Executar testes
make -f docker/Makefile ps            # Listar containers
make -f docker/Makefile stats         # Estatísticas de uso
make -f docker/Makefile clean          # Limpar containers e volumes
make -f docker/Makefile clean-all     # Limpar tudo (incluindo imagens)
```

### Usando Docker Compose diretamente

```bash
# Iniciar containers
docker-compose -f docker-compose.dev.yml up -d

# Parar containers
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Executar comandos Artisan
docker-compose -f docker-compose.dev.yml exec app php artisan [comando]

# Executar comandos Composer
docker-compose -f docker-compose.dev.yml exec app composer [comando]

# Executar comandos NPM
docker-compose -f docker-compose.dev.yml exec node npm [comando]
```

## 🏗️ Estrutura dos Containers

### Containers de Desenvolvimento

- **trashtalk-app-dev**: Aplicação Laravel (PHP 8.4-FPM)
- **trashtalk-nginx-dev**: Servidor web Nginx
- **trashtalk-db-dev**: PostgreSQL 16
- **trashtalk-redis-dev**: Redis 7 (cache e sessões)
- **trashtalk-node-dev**: Node.js 20 (Vite dev server)

### Containers de Produção

- **trashtalk-app-prod**: Aplicação Laravel otimizada
- **trashtalk-nginx-prod**: Servidor web Nginx
- **trashtalk-db-prod**: PostgreSQL 16
- **trashtalk-redis-prod**: Redis 7

## 🏷️ Organização no Docker Desktop

Todos os recursos estão organizados com labels para fácil identificação:

- **Project**: `trashtalk-records`
- **Environment**: `development` ou `production`
- **Service**: `app`, `nginx`, `database`, `cache`, `frontend`

### Visualização no Docker Desktop

No Docker Desktop, você verá:

**Containers:**
- Agrupados por projeto (`trashtalk-records`)
- Nomes descritivos com ambiente (dev/prod)
- Status de saúde (healthchecks)

**Volumes:**
- `trashtalk-db-data` - Dados do PostgreSQL
- `trashtalk-redis-data` - Dados do Redis
- `trashtalk-vendor` - Dependências PHP (cache)
- `trashtalk-node-modules` - Dependências Node (cache)

**Networks:**
- `trashtalk-network` - Rede isolada do projeto

**Images:**
- `trashtalk-records:app-dev` - Imagem de desenvolvimento
- `trashtalk-records:app-prod` - Imagem de produção

## 🔧 Configuração

### Portas

- `8000`: Nginx (aplicação)
- `5173`: Vite Dev Server
- `5432`: PostgreSQL
- `6379`: Redis

### Volumes

- `./:/var/www/html`: Código da aplicação (bind mount)
- `trashtalk-db-data`: Dados do PostgreSQL (named volume)
- `trashtalk-redis-data`: Dados do Redis (named volume)
- `trashtalk-vendor`: Cache de dependências PHP (named volume)
- `trashtalk-node-modules`: Cache de dependências Node (named volume)

### Healthchecks

Todos os serviços críticos têm healthchecks configurados:
- **PostgreSQL**: Verifica se está pronto para conexões
- **Redis**: Verifica se responde a ping

## 🐛 Troubleshooting

### Erro de permissões

```bash
docker-compose -f docker-compose.dev.yml exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose -f docker-compose.dev.yml exec app chmod -R 775 storage bootstrap/cache
```

### Limpar tudo e recomeçar

```bash
make -f docker/Makefile clean-all
make -f docker/Makefile setup
```

### Rebuild completo

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Ver logs de um serviço específico

```bash
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f nginx
docker-compose -f docker-compose.dev.yml logs -f db
```

### Verificar saúde dos serviços

```bash
docker-compose -f docker-compose.dev.yml ps
```

## 📦 Produção

Para produção, use `docker-compose.yml` (sem `.dev`):

```bash
docker-compose up -d --build
```

O Dockerfile de produção otimiza a build e inclui assets compilados.

## 🎯 Dicas

1. **Use named volumes** para dependências (vendor, node_modules) para melhor performance
2. **Healthchecks** garantem que serviços estão prontos antes de iniciar dependências
3. **Labels** facilitam organização e filtragem no Docker Desktop
4. **Separate networks** isolam o projeto de outros containers
5. **Project name** agrupa todos os recursos relacionados

## 📚 Recursos Adicionais

- [Docker Desktop Documentation](https://docs.docker.com/desktop/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Sail Documentation](https://laravel.com/docs/sail)
