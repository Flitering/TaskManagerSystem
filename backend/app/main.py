from fastapi import FastAPI
from app import models
from app.database import engine, SessionLocal
from app.routers import users, tasks, auth
from app.models import RoleEnum, Role
from app.auth import get_password_hash
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Создание первоначального администратора
def create_initial_admin():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.username == "admin").first()
        if not user:
            hashed_password = get_password_hash("admin123")
            admin_role = db.query(Role).filter(Role.name == RoleEnum.admin).first()
            admin_user = models.User(
                username="admin",
                hashed_password=hashed_password,
                role=admin_role
            )
            db.add(admin_user)
            db.commit()
            print("Создан первоначальный администратор с именем пользователя 'admin' и паролем 'admin123'")
    finally:
        db.close()

create_initial_admin()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)