from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.models import RoleEnum

router = APIRouter(
    prefix="/register",
    tags=["auth"],
)

@router.post("/", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Имя пользователя уже зарегистрировано")

    user.role = RoleEnum.executor

    new_user = crud.create_user(db=db, user=user)
    return new_user
