from sqlalchemy import (
    Column, Integer, String, ForeignKey, Enum, DateTime, Float, Table, Boolean
)
from sqlalchemy.orm import relationship, backref
from app.database import Base
from datetime import datetime
import enum

#
# --------------------------- Роли пользователей ---------------------------
#
class RoleEnum(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    executor = "executor"

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Enum(RoleEnum), unique=True, nullable=False)

    users = relationship("User", back_populates="role")


#
# --------------------------- Тип задачи ---------------------------
#
class IssueTypeEnum(str, enum.Enum):
    task = "Задача"
    bug = "Ошибка"
    epic = "Эпик"

#
# --------------------------- Ассоциация watchers (задача ↔ пользователи) ---------------------------
#
task_watchers = Table(
    "task_watchers",
    Base.metadata,
    Column("task_id", Integer, ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

#
# --------------------------- Ассоциация project_participants (проект ↔ пользователи) ---------------------------
#
project_participants = Table(
    "project_participants",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

#
# --------------------------- Ассоциация team_participants (команда ↔ пользователи) ---------------------------
#
team_participants = Table(
    "team_participants",
    Base.metadata,
    Column("team_id", Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

#
# --------------------------- Модель пользователя ---------------------------
#
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)

    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    role = relationship("Role", back_populates="users")

    assigned_tasks = relationship("Task", back_populates="assigned_user", foreign_keys='Task.assigned_user_id')
    tasks_created = relationship("Task", back_populates="creator", foreign_keys='Task.creator_id')
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")

    participated_projects = relationship(
        "Project",
        secondary=project_participants,
        back_populates="participants",
    )

    # команды, где пользователь — участник
    teams = relationship(
        "Team",
        secondary=team_participants,
        back_populates="members",
        overlaps="members",
    )

    # Просмотры
    recent_views = relationship(
        "RecentView",
        back_populates="user",
        cascade="all, delete-orphan",
        overlaps="user",
    )

    # Избранное
    favorites = relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan",
        overlaps="user",
    )

#
# --------------------------- Модель команды ---------------------------
#
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # может быть связь 1:many с проектом
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    project = relationship("Project", backref="teams")

    members = relationship(
        "User",
        secondary=team_participants,
        back_populates="teams",
        overlaps="teams",
    )

#
# --------------------------- Модель проекта ---------------------------
#
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    leader_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    leader = relationship("User", foreign_keys=[leader_id])

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    participants = relationship(
        "User",
        secondary=project_participants,
        back_populates="participated_projects",
    )

    recent_views = relationship(
        "RecentView",
        back_populates="project",
        overlaps="project",
    )
    favorites = relationship(
        "Favorite",
        back_populates="project",
        overlaps="project",
    )

#
# --------------------------- Статус задачи ---------------------------
#
class TaskStatus(str, enum.Enum):
    new = "Новая"
    in_progress = "В процессе"
    completed = "Завершена"

#
# --------------------------- Приоритет задачи ---------------------------
#
class TaskPriority(str, enum.Enum):
    low = "Низкий"
    medium = "Средний"
    high = "Высокий"

#
# --------------------------- Комментарии ---------------------------
#
class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="comments")
    task = relationship("Task", back_populates="comments")

#
# --------------------------- Вложения ---------------------------
#
class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)

    task = relationship("Task", back_populates="attachments")

#
# --------------------------- Модель задачи ---------------------------
#
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    details = Column(String, nullable=True)

    issue_type = Column(Enum(IssueTypeEnum), default=IssueTypeEnum.task, nullable=False)
    status = Column(Enum(TaskStatus), default=TaskStatus.new, nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.medium, nullable=False

    )
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    parent_task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)

    labels = Column(String, nullable=True, default="")
    flagged = Column(Boolean, default=False)
    team = Column(String, nullable=True)  # либо team_id = Column(Integer, ...)
    only_for_roles = Column(String, nullable=True)

    due_date = Column(DateTime, nullable=True)
    estimated_time = Column(Float, default=0.0)
    time_spent = Column(Float, default=0.0)

    assignment_date = Column(DateTime, default=datetime.utcnow, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    last_updated_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    last_updated_by = relationship("User", foreign_keys=[last_updated_by_id])

    project = relationship("Project", back_populates="tasks")
    assigned_user = relationship("User", back_populates="assigned_tasks", foreign_keys=[assigned_user_id])
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[creator_id])

    watchers = relationship(
        "User",
        secondary=task_watchers,
        backref="watched_tasks"
    )
    parent_task = relationship(
        "Task",
        remote_side=[id],
        backref=backref("subtasks", cascade="all, delete-orphan")
    )
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="task", cascade="all, delete-orphan")

    recent_views = relationship("RecentView", back_populates="task", overlaps="task")
    favorites = relationship("Favorite", back_populates="task", overlaps="task")

#
# --------------------------- Просмотры (RecentView) ---------------------------
#
class RecentView(Base):
    __tablename__ = "recent_views"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)
    viewed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recent_views", overlaps="user")
    project = relationship("Project", back_populates="recent_views", overlaps="project")
    task = relationship("Task", back_populates="recent_views", overlaps="task")

#
# --------------------------- Избранное (Favorite) ---------------------------
#
class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True)

    user = relationship("User", back_populates="favorites", overlaps="user")
    project = relationship("Project", back_populates="favorites", overlaps="project")
    task = relationship("Task", back_populates="favorites", overlaps="task")
