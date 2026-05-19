from typing import Literal, Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TaskCreate(BaseModel):
    title: str


class StatusUpdate(BaseModel):
    status: Literal["pendiente", "completada"]
