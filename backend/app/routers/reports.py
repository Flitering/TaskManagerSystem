from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TaskStatus, Task
from app import models
from typing import List
from app.dependencies import role_required
from app.models import RoleEnum

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)

@router.get("/task-stats")
def get_task_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager])),
    project_id: int = Query(None, description="ID проекта для фильтрации задач")
):
    query = db.query(Task)
    if project_id is not None:
        query = query.filter(Task.project_id == project_id)

    total_tasks = query.count()
    completed_tasks = query.filter(Task.status == TaskStatus.completed).count()
    in_progress_tasks = query.filter(Task.status == TaskStatus.in_progress).count()
    new_tasks = query.filter(Task.status == TaskStatus.new).count()

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "new_tasks": new_tasks,
    }