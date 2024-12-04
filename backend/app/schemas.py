from __future__ import annotations  # Позволяет использовать аннотации типов как строки
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models import RoleEnum, TaskStatus, TaskPriority


# ====== Роль ======
class RoleBase(BaseModel):
    id: int
    name: RoleEnum

    class Config:
        orm_mode = True


# ====== Пользователь ======
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


class UserRead(UserBase):
    role: RoleBase
    assigned_tasks: Optional[List[TaskSummary]] = None  # Используем TaskSummary для предотвращения рекурсии

    class Config:
        orm_mode = True


# Создание алиаса для UserRead
User = UserRead


# ====== Проект ======
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


class ProjectRead(ProjectBase):
    # Можно добавить дополнительные поля, например, список задач
    pass


# Создание алиаса для ProjectRead
Project = ProjectRead


# ====== Комментарий ======
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
    user: UserRead  # Используем UserRead, который не содержит полей, вызывающих рекурсию

    class Config:
        orm_mode = True


# Создание алиаса для CommentRead
Comment = CommentRead


# ====== Вложение ======
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
    # Можно добавить дополнительные поля, если необходимо
    pass


# Создание алиаса для AttachmentRead
Attachment = AttachmentRead


# ====== Задача ======
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
    assigned_user_id: int
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
    assigned_user: Optional[UserRead] = None  # Используем UserRead без поля assigned_tasks
    creator: Optional[UserRead] = None
    project_id: Optional[int] = None
    project: Optional[ProjectRead] = None
    time_spent: float = 0.0
    comments: Optional[List[CommentRead]] = None
    attachments: Optional[List[AttachmentRead]] = None
    subtasks: Optional[List[TaskSummary]] = None  # Используем TaskSummary для предотвращения рекурсии
    parent_task_id: Optional[int] = None

    class Config:
        orm_mode = True


# Создание алиаса для TaskRead
Task = TaskRead


# ====== Токен ======
class Token(BaseModel):
    access_token: str
    token_type: str

    class Config:
        orm_mode = True


# Создание алиаса для Token (опционально, если хотите использовать schemas.Token)
# TokenSchema = Token


# ====== Обновление Forward References ======
UserRead.update_forward_refs()
TaskRead.update_forward_refs()
CommentRead.update_forward_refs()
AttachmentRead.update_forward_refs()
ProjectRead.update_forward_refs()
