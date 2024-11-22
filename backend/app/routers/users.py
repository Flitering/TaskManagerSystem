from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.dependencies import role_required
from app.models import RoleEnum

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin]))
):
    # Только администратор может создавать пользователей
    return crud.create_user(db=db, user=user)

@router.get("/", response_model=List[schemas.Task])
def read_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    if current_user.role.name == RoleEnum.executor.value:
        # Исполнитель видит только свои задачи
        tasks = db.query(models.Task).filter(models.Task.assigned_user_id == current_user.id).offset(skip).limit(limit).all()
    else:
        # Администратор и менеджер видят все задачи
        tasks = db.query(models.Task).offset(skip).limit(limit).all()
    return tasks