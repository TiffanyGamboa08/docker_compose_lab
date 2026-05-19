from fastapi import APIRouter, HTTPException

from src.db import get_cursor
from src.schemas import StatusUpdate

router = APIRouter()


@router.patch("/api/tasks/{task_id}/status")
def update_task_status(task_id: int, payload: StatusUpdate):
    with get_cursor() as cur:
        cur.execute(
            """
            UPDATE tasks
            SET status = %s
            WHERE id = %s
            RETURNING id, project_id, title, status, created_at
            """,
            (payload.status, task_id),
        )
        task = cur.fetchone()
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
