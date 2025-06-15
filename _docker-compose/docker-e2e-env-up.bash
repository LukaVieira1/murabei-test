docker-compose rm -f
export COMPOSE_HTTP_TIMEOUT=200
docker compose -f docker-compose-e2e.yml up --force-recreate --remove-orphans > docker.log
