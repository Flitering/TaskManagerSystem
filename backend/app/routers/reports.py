from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import TaskStatus, Task
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
    current_user = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == TaskStatus.completed).count()
    in_progress_tasks = db.query(Task).filter(Task.status == TaskStatus.in_progress).count()
    new_tasks = db.query(Task).filter(Task.status == TaskStatus.new).count()

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "new_tasks": new_tasks,
    }