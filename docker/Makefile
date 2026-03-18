.PHONY: help build up down restart logs shell composer npm migrate seed test

help: ## Mostra esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Constrói as imagens Docker
	docker compose -f docker-compose.dev.yml build

up: ## Inicia os containers
	docker compose -f docker-compose.dev.yml up -d

down: ## Para os containers
	docker compose -f docker-compose.dev.yml down

restart: ## Reinicia os containers
	docker compose -f docker-compose.dev.yml restart

logs: ## Mostra os logs dos containers
	docker compose -f docker-compose.dev.yml logs -f

shell: ## Abre shell no container da aplicação
	docker compose -f docker-compose.dev.yml exec app sh

composer: ## Executa composer install
	docker compose -f docker-compose.dev.yml exec app composer install

npm-install: ## Instala dependências npm
	docker compose -f docker-compose.dev.yml exec node npm install

npm-build: ## Build dos assets
	docker compose -f docker-compose.dev.yml exec node npm run build

migrate: ## Executa migrations
	docker compose -f docker-compose.dev.yml exec app php artisan migrate

migrate-fresh: ## Reseta e executa migrations
	docker compose -f docker-compose.dev.yml exec app php artisan migrate:fresh

seed: ## Executa seeders
	docker compose -f docker-compose.dev.yml exec app php artisan db:seed

test: ## Executa testes
	docker compose -f docker-compose.dev.yml exec app php artisan test

setup: ## Setup inicial completo
	@echo "Configurando ambiente Docker..."
	@if [ ! -f .env ]; then cp .env.docker.example .env; fi
	docker compose -f docker-compose.dev.yml up -d --build
	docker compose -f docker-compose.dev.yml exec app composer install
	docker compose -f docker-compose.dev.yml exec app php artisan key:generate
	docker compose -f docker-compose.dev.yml exec app php artisan migrate
	@echo "Setup completo! Acesse http://localhost:8000"

clean: ## Remove containers e volumes
	docker compose -f docker-compose.dev.yml down -v

clean-all: ## Remove tudo (containers, volumes, imagens e networks)
	docker compose -f docker-compose.dev.yml down -v --rmi all
	docker volume prune -f --filter "label=com.trashtalk.project=trashtalk-records"
	docker network prune -f --filter "label=com.trashtalk.project=trashtalk-records"

ps: ## Lista containers em execução
	docker compose -f docker-compose.dev.yml ps

stats: ## Mostra estatísticas de uso dos containers
	docker stats --filter "name=trashtalk-"

inspect: ## Inspeciona a configuração dos containers
	docker compose -f docker-compose.dev.yml config
