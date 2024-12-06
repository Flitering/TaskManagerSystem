from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models import RoleEnum, TaskStatus, TaskPriority

class AssignLeaderData(BaseModel):
    user_id: int
    class Config:
        orm_mode = True

class RoleBase(BaseModel):
    id: int
    name: RoleEnum
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: str
    role: RoleEnum
    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[RoleEnum] = None
    class Config:
        orm_mode = True

class TaskSummary(BaseModel):
    id: int
    description: str
    status: TaskStatus
    class Config:
        orm_mode = True

class Role(BaseModel):
    id: int
    name: RoleEnum
    class Config:
        orm_mode = True

class UserRead(UserBase):
    role: Role
    assigned_tasks: Optional[List[TaskSummary]] = None
    class Config:
        orm_mode = True

User = UserRead

class ProjectBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    class Config:
        orm_mode = True

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    class Config:
        orm_mode = True

class ParticipantCreate(BaseModel):
    user_id: int
    class Config:
        orm_mode = True

class CommentBase(BaseModel):
    id: int
    content: str
    created_at: datetime
    user_id: int
    class Config:
        orm_mode = True

class CommentCreate(BaseModel):
    content: str
    class Config:
        orm_mode = True

class CommentRead(CommentBase):
    user: User
    class Config:
        orm_mode = True

Comment = CommentRead

class AttachmentBase(BaseModel):
    id: int
    filename: str
    file_url: str
    task_id: int
    class Config:
        orm_mode = True

class AttachmentCreate(BaseModel):
    filename: str
    class Config:
        orm_mode = True

class AttachmentRead(AttachmentBase):
    pass

Attachment = AttachmentRead

class TaskBase(BaseModel):
    description: str
    details: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.medium
    estimated_time: float = 0.0
    class Config:
        orm_mode = True

class TaskCreate(TaskBase):
    project_id: int
    assigned_user_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    class Config:
        orm_mode = True

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    time_spent: Optional[float] = None
    description: Optional[str] = None
    details: Optional[str] = None
    estimated_time: Optional[float] = None
    class Config:
        orm_mode = True

class TaskRead(TaskBase):
    id: int
    status: TaskStatus
    assigned_user: Optional[User] = None
    creator: Optional[User] = None
    project_id: Optional[int] = None
    project: Optional["Project"] = None
    time_spent: float = 0.0
    comments: Optional[List[Comment]] = None
    attachments: Optional[List[Attachment]] = None
    subtasks: Optional[List[TaskSummary]] = None
    parent_task_id: Optional[int] = None
    assignment_date: Optional[datetime] = None
    created_at: datetime
    class Config:
        orm_mode = True

Task = TaskRead

class ProjectDetail(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    leader: Optional[User] = None
    tasks: List[Task] = []
    participants: List[User] = []
    class Config:
        orm_mode = True

class ProjectRead(ProjectBase):
    pass

Project = ProjectRead

class Token(BaseModel):
    access_token: str
    token_type: str
    class Config:
        orm_mode = True

# Обновление forward references
ProjectDetail.update_forward_refs()
UserRead.update_forward_refs()
TaskRead.update_forward_refs()
CommentRead.update_forward_refs()
AttachmentRead.update_forward_refs()
ProjectRead.update_forward_refs()
