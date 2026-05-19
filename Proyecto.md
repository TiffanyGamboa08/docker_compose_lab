# Sistema Demo — Gestor de Tareas por Equipo

> Documento de referencia interna para el laboratorio Docker Compose.  
> Cada integrante construye **un servicio**. Este archivo define la idea, las interfaces y los contratos entre servicios para que Copilot tenga contexto suficiente sin hacerlo todo solo.

---

## Idea general

Una mini-aplicación web donde un equipo puede registrar **proyectos** y agregarles **tareas**. Nada más. El objetivo no es el producto, es demostrar que tres servicios corren juntos, se comunican por red interna y los datos sobreviven un `docker compose down && up`.

---

## Páginas (SPA — 2 vistas)

### Vista 1 — Lista de proyectos (`/`)
- Muestra todos los proyectos en tarjetas.
- Cada tarjeta tiene: nombre, descripción corta y un botón **"Ver tareas"**.
- Botón **"+ Nuevo proyecto"** abre un formulario inline (mismo componente, sin ruta nueva).

### Vista 2 — Tareas de un proyecto (`/proyectos/:id`)
- Encabezado con nombre del proyecto.
- Lista de tareas con: título, estado (`pendiente` / `completada`) y botón para alternar estado.
- Formulario al fondo para agregar una tarea nueva.
- Botón **"← Volver"** regresa a la vista 1.

> No hay login, no hay roles, no hay paginación. Eso está fuera del alcance.

---

## Base de datos — 4 tablas (PostgreSQL)

```sql
-- Tabla 1
projects (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
)

-- Tabla 2
tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INT REFERENCES projects(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  status      VARCHAR(20) DEFAULT 'pendiente',  -- 'pendiente' | 'completada'
  created_at  TIMESTAMP DEFAULT NOW()
)

-- Tabla 3 (seed / datos de prueba para la demo)
members (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL
)

-- Tabla 4 (opcional para mostrar relación many-to-many)
task_assignments (
  task_id     INT REFERENCES tasks(id) ON DELETE CASCADE,
  member_id   INT REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, member_id)
)
```

> `members` y `task_assignments` no necesitan UI propia; sirven para que la DB tenga estructura real y el seed tenga sentido. Si hay tiempo se puede mostrar el asignado en la tarjeta de tarea.

---

## Servicios y responsabilidades

| Servicio | Tecnología sugerida | Puerto externo | Integrante |
|----------|--------------------|----|---|
| **frontend** | React + Vite (o HTML/JS puro) | `3000` | Integrante A |
| **api** | Node.js + Express (o FastAPI) | `4000` | Integrante B |
| **db** | PostgreSQL 16 | `5432` (solo interno) | Integrante C |

---

## Endpoints que la API debe exponer

El frontend solo habla con la API. La API habla con la DB. La DB no es accesible desde fuera.

```
GET    /api/projects            → lista todos los proyectos
POST   /api/projects            → crea un proyecto { name, description }

GET    /api/projects/:id/tasks  → lista tareas de un proyecto
POST   /api/projects/:id/tasks  → crea una tarea { title }
PATCH  /api/tasks/:id/status    → alterna status { status: 'completada' | 'pendiente' }
```

> La API debe responder JSON. Incluir un `GET /api/health` que devuelva `{ status: "ok" }` — sirve para validar en la demo que el servicio levantó.

---

## Comunicación entre servicios (red interna de Docker)

```
Browser
  │  HTTP :3000
  ▼
[frontend]  ──────── fetch("http://api:4000/api/...") ────────▶  [api]
                                                                    │
                                                          postgres://db:5432
                                                                    ▼
                                                                  [db]
```

- El frontend hace requests a `http://api:4000` **desde el navegador**, así que en producción dev hay que configurar un proxy en Vite (`/api → http://api:4000`) o usar la URL completa con CORS habilitado en la API.
- La API se conecta a la DB con la variable de entorno `DATABASE_URL=postgres://user:pass@db:5432/taskdb`.
- **`db` no expone puerto al host** (o si lo expone es solo para desarrollo).

---

## Variables de entorno esperadas

### api
```env
DATABASE_URL=postgres://taskuser:taskpass@db:5432/taskdb
PORT=4000
```

### db
```env
POSTGRES_USER=taskuser
POSTGRES_PASSWORD=taskpass
POSTGRES_DB=taskdb
```

### frontend
```env
VITE_API_URL=http://localhost:4000   # solo si NO se usa proxy
```

---

## Versiones objetivo (para Docker)

- **frontend**: pnpm `11.1.2`
- **api**: Python `3.14.3` (con `venv`)
- **db**: PostgreSQL `16`

---

## Persistencia (lo que hay que demostrar)

La DB usa un **named volume** en `docker-compose.yml`:

```yaml
volumes:
  pgdata:

services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data
```

**Guión de la demo:**
1. `docker compose up` — levantar todo.
2. Crear un proyecto y una tarea desde el navegador.
3. `docker compose down` — tumbar todo.
4. `docker compose up` — volver a levantar.
5. Abrir el navegador → el proyecto y la tarea siguen ahí. ✅

---

## Seed de datos (para no llegar con la DB vacía a la demo)

El servicio `db` puede incluir un archivo `init.sql` montado en `/docker-entrypoint-initdb.d/` que inserte:
- 2 proyectos de ejemplo.
- 3–4 tareas por proyecto.
- 2–3 miembros.

Esto solo corre la **primera vez** que el volumen se crea (comportamiento por defecto de la imagen oficial de Postgres).

---

## Lo que NO está en scope

- Autenticación / sesiones.
- Editar o eliminar proyectos/tareas desde la UI.
- Estilos elaborados (basta con que se vea limpio).
- Tests automatizados.
- CI/CD.

---

## Estructura de repo sugerida

```
/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   └── src/
├── api/
│   ├── Dockerfile
│   └── src/
├── db/
│   └── init.sql
└── SISTEMA.md   ← este archivo
```

Cada integrante trabaja en su carpeta. El `docker-compose.yml` lo arman juntos al final (o lo va construyendo el integrante como parte de la responsabilidad de DB/infra).