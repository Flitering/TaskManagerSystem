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
    details: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium
    estimated_time: float = 0.0
    
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    created_at: datetime
    user_id: int
    user: User

    class Config:
        orm_mode = True

class AttachmentBase(BaseModel):
    filename: str
    file_url: str

class AttachmentCreate(BaseModel):
    filename: str

class Attachment(AttachmentBase):
    id: int
    task_id: int

    class Config:
        orm_mode = True

class TaskCreate(TaskBase):
    project_id: int
    assigned_user_id: int
    parent_task_id: Optional[int] = None

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    time_spent: Optional[float] = None
    description: Optional[str] = None
    details: Optional[str] = None  # Добавлено поле details
    estimated_time: Optional[float] = None

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
    comments: Optional[List[Comment]] = None
    attachments: Optional[List[Attachment]] = None
    subtasks: Optional[List['Task']] = None
    parent_task_id: Optional[int] = None

    class Config:
        orm_mode = True