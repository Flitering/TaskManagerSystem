from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models import RoleEnum, TaskStatus, TaskPriority

class Role(BaseModel):
    id: int
    name: RoleEnum

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: RoleEnum

class User(UserBase):
    id: int
    role: Role

    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    description: str
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium
    estimated_time: float = 0.0  # В часах

class TaskCreate(TaskBase):
    project_id: int
    assigned_user_id: int

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    time_spent: Optional[float] = None

class Task(TaskBase):
    id: int
    status: TaskStatus
    assigned_user_id: Optional[int] = None
    assigned_user: Optional[User] = None
    creator_id: Optional[int] = None
    creator: Optional[User] = None
    project_id: Optional[int] = None
    project: Optional[Project] = None
    time_spent: float = 0.0

    class Config:
        orm_mode = True