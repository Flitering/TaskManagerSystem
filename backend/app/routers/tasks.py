from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.dependencies import role_required
from app.models import RoleEnum

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
)

@router.post("/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    # Логика создания задачи
    return crud.create_task(db=db, task=task)