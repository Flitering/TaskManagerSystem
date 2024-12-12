from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.dependencies import get_current_user, role_required
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
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Имя пользователя уже зарегистрировано")
    return crud.create_user(db=db, user=user)

@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin]))
):
    users = crud.get_users(db)
    return users

@router.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role.name != RoleEnum.admin.value:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id and current_user.role.name != RoleEnum.admin.value:
        raise HTTPException(status_code=403, detail="Недостаточно прав для выполнения операции")
    # Если редактируется роль, только администратор может это делать
    if user_update.role is not None and current_user.role.name != RoleEnum.admin.value:
        raise HTTPException(status_code=403, detail="Только администратор может изменять роль пользователя")
    user = crud.update_user(db, user_id, user_update)
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin]))
):
    db_user = crud.get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Не удалось удалить пользователя")
    return