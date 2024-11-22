from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models import RoleEnum, TaskStatus, TaskPriority

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: RoleEnum

class User(UserBase):
    id: int
    role: RoleEnum

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    description: str
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium

class TaskCreate(TaskBase):
    assigned_user_id: int

class Task(TaskBase):
    id: int
    status: TaskStatus
    assigned_user_id: Optional[int] = None

    class Config:
        orm_mode = True