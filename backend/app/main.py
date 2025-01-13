import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine, SessionLocal
from app.auth import get_password_hash
from app.models import RoleEnum, Role, User
from app.routers import (
    auth,
    users,
    tasks,
    projects,
    reports,
    register,
    dashboard,
    team
)

app = FastAPI(
    title="Task Manager System",
    description="API для управления задачами, проектами и пользователями.",
    version="1.0.0",
)

UPLOADS_DIR = "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

def create_roles():
    db = SessionLocal()
    try:
        existing = db.query(Role).all()
        if not existing:
            for role_name in RoleEnum:
                db.add(Role(name=role_name))
            db.commit()
    finally:
        db.close()

create_roles()

def create_initial_admin():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            hashed_password = get_password_hash("admin123")
            admin_role = db.query(Role).filter(Role.name == RoleEnum.admin).first()
            admin_user = User(
                username="admin",
                hashed_password=hashed_password,
                role=admin_role
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()

create_initial_admin()

# Подключаем роутеры
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(reports.router)
app.include_router(projects.router)
app.include_router(register.router)
app.include_router(dashboard.router)
app.include_router(team.router)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
