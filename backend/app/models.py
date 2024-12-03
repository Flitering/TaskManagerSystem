from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Float
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    executor = "executor"

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(RoleEnum), unique=True, nullable=False)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    role = relationship("Role", back_populates="users")
    tasks_assigned = relationship("Task", back_populates="assigned_user", foreign_keys='Task.assigned_user_id')
    tasks_created = relationship("Task", back_populates="creator", foreign_keys='Task.creator_id')
    comments = relationship("Comment", back_populates="user")

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
    
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    user = relationship("User", back_populates="comments")
    task = relationship("Task", back_populates="comments")

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)

    task = relationship("Task", back_populates="attachments")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    details = Column(String, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.new)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assigned_user_id = Column(Integer, ForeignKey("users.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    due_date = Column(DateTime)
    estimated_time = Column(Float, default=0.0)
    time_spent = Column(Float, default=0.0)
    parent_task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="tasks_assigned", foreign_keys=[assigned_user_id])
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[creator_id])
    parent_task = relationship("Task", remote_side=[id], backref='subtasks')

    comments = relationship("Comment", back_populates="task")
    attachments = relationship("Attachment", back_populates="task")