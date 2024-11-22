from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class RoleEnum(str, enum.Enum):
    admin = "Администратор"
    manager = "Менеджер"
    executor = "Исполнитель"

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(RoleEnum), unique=True, nullable=False)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    role = relationship("Role", back_populates="users")
    tasks = relationship("Task", back_populates="assigned_user")

class TaskStatus(str, enum.Enum):
    new = "Новая"
    in_progress = "В процессе"
    completed = "Завершена"

class TaskPriority(str, enum.Enum):
    low = "Низкий"
    medium = "Средний"
    high = "Высокий"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.new)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    due_date = Column(DateTime)

    assigned_user = relationship("User", back_populates="tasks")