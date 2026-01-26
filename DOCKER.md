# 🐳 Docker Setup - Guia Rápido

## 🚀 Início Rápido

### 1. Configurar ambiente

```bash
cp .env.docker.example .env
```

### 2. Iniciar containers

```bash
# Usando Makefile (recomendado)
make -f docker/Makefile setup

# Ou manualmente
docker-compose -f docker-compose.dev.yml up -d --build
```

### 3. Acessar aplicação

- **Aplicação**: http://localhost:8000
- **Vite Dev**: http://localhost:5173

## 📝 Comandos Principais

```bash
# Ver ajuda
make -f docker/Makefile help

# Iniciar
make -f docker/Makefile up

# Parar
make -f docker/Makefile down

# Ver logs
make -f docker/Makefile logs

# Executar migrations
make -f docker/Makefile migrate

# Abrir shell
make -f docker/Makefile shell
```

## 🏗️ Serviços

- **app**: Laravel (PHP 8.2-FPM)
- **nginx**: Servidor web
- **db**: PostgreSQL 16
- **redis**: Redis 7
- **node**: Node.js 20 (Vite)

## 📚 Documentação Completa

Veja `docker/README.md` para documentação detalhada.
