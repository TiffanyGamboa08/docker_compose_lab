from fastapi import APIRouter, HTTPException

from src.db import get_cursor
from src.schemas import ProjectCreate, TaskCreate

router = APIRouter()


@router.get("/api/projects")
def list_projects():
    with get_cursor() as cur:
        cur.execute(
            "SELECT id, name, description, created_at FROM projects ORDER BY id"
        )
        return cur.fetchall()


@router.post("/api/projects", status_code=201)
def create_project(payload: ProjectCreate):
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO projects (name, description)
            VALUES (%s, %s)
            RETURNING id, name, description, created_at
            """,
            (payload.name, payload.description),
        )
        return cur.fetchone()


@router.get("/api/projects/{project_id}/tasks")
def list_tasks(project_id: int):
    with get_cursor() as cur:
        cur.execute("SELECT 1 FROM projects WHERE id = %s", (project_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Project not found")
        cur.execute(
            """
            SELECT id, project_id, title, status, created_at
            FROM tasks
            WHERE project_id = %s
            ORDER BY id
            """,
            (project_id,),
        )
        return cur.fetchall()


@router.post("/api/projects/{project_id}/tasks", status_code=201)
def create_task(project_id: int, payload: TaskCreate):
    with get_cursor() as cur:
        cur.execute("SELECT 1 FROM projects WHERE id = %s", (project_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Project not found")
        cur.execute(
            """
            INSERT INTO tasks (project_id, title)
            VALUES (%s, %s)
            RETURNING id, project_id, title, status, created_at
            """,
            (project_id, payload.title),
        )
        return cur.fetchone()
