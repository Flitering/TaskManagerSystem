from fastapi import FastAPI
from app import models
from app.database import engine, get_db
from app.routers import users, tasks
from sqlalchemy.orm import Session
from app.models import RoleEnum, Role

app = FastAPI()

models.Base.metadata.create_all(bind=engine)

# Создание начальных ролей
def create_roles():
    db = SessionLocal()
    try:
        existing_roles = db.query(Role).all()
        if not existing_roles:
            for role_name in RoleEnum:
                role = Role(name=role_name)
                db.add(role)
            db.commit()
    finally:
        db.close()

create_roles()

app.include_router(users.router)
app.include_router(tasks.router)