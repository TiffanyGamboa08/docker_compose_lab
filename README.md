# docker_compose_lab

Instrucciones para reproducir el proyecto localmente usando Docker y Docker Compose.

## Resumen

Este repositorio contiene una pequeña aplicación con tres servicios creados con `docker-compose`:
- `frontend` (app de cliente)
- `api` (backend)
- `db` (PostgreSQL)

Los scripts SQL en la carpeta `db/` son montados en el contenedor de Postgres y se ejecutan automáticamente durante la inicialización.

## Requisitos

- Docker (Desktop) instalado
- Conexión a internet para descargar imágenes la primera vez

Compruebe la instalación:

```bash
docker --version
docker compose version
```

## Configuración de variables de entorno

El `docker-compose.yml` usa un archivo `.env` en la raíz para inyectar variables. Cree un archivo `.env` en la raíz del proyecto con al menos las siguientes variables (valores de ejemplo):

```env
# Puertos
FRONTEND_PORT=5173
API_PORT=4000

# URL que usará el frontend para comunicarse con la API
VITE_API_URL=http://localhost:4000

```

Ajuste los valores según sus necesidades (puertos libres, contraseñas, versiones de imagen, etc.).

## Ejecutar la aplicación

En la raíz del proyecto ejecute:

```bash
docker compose up --build
```

Para ejecutar en segundo plano:

```bash
docker compose up -d --build
```

El primer arranque descargará/compilará imágenes; espere a que el servicio `db` pase su `healthcheck` antes de usar la aplicación.

## Acceder a los servicios

- Frontend: http://localhost:${FRONTEND_PORT} (valor según su `.env`).
- API: http://localhost:${API_PORT} — si el backend es FastAPI, la documentación interactiva estará en `/docs`.

## Reaplicar los scripts de inicialización de la base de datos

Los archivos dentro de `db/` se montan en `/docker-entrypoint-initdb.d` del contenedor Postgres y se ejecutan solo cuando el volumen de datos es nuevo. Para volver a aplicar los scripts:

```bash
docker compose down --volumes
docker compose up --build
```

Aviso: esto borrará los datos persistidos en el volumen `db_data`.

## Comandos útiles

- Ver logs en tiempo real:

```bash
docker compose logs -f
```

- Ver estado de contenedores:

```bash
docker compose ps
```

- Parar y eliminar contenedores (mantener volumen):

```bash
docker compose down
```

- Eliminar volúmenes también (borra datos):

```bash
docker compose down --volumes --remove-orphans
```

- Forzar reconstrucción de imágenes:

```bash
docker compose build --no-cache
```

## Notas y resolución de problemas

- Si un puerto ya está en uso, cambie `FRONTEND_PORT`, `API_PORT` o `POSTGRES_PORT` en su `.env`.
- Si la inicialización de Postgres falla, revise los logs del servicio `db` para ver errores de permisos/contraseña:

```bash
docker compose logs db
```

- Asegúrese de que el archivo `.env` esté en la raíz del repositorio y que Docker tenga permisos para leerlo.

## Estructura relevante

- [api](api/) — código del backend y `Dockerfile`.
- [frontend](frontend/) — código del frontend y `Dockerfile`.
- [db](db/) — scripts SQL de inicialización (`01_init.sql`, `02_seed.sql`).
- [docker-compose.yml](docker-compose.yml) — orquestador de servicios.
