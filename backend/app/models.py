from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Float
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
    tasks_assigned = relationship("Task", back_populates="assigned_user", foreign_keys='Task.assigned_user_id')
    tasks_created = relationship("Task", back_populates="creator", foreign_keys='Task.creator_id')

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)

    tasks = relationship("Task", back_populates="project")

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
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    due_date = Column(DateTime)
    estimated_time = Column(Float, default=0.0)  # Оценочное время в часах
    time_spent = Column(Float, default=0.0)      # Потраченное время в часах

    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks_assigned", foreign_keys=[assigned_user_id])
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[creator_id])