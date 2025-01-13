from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, RoleEnum, Task, Project, RecentView, Favorite
from app import models

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

def log_view(db: Session, user_id: int, project_id: Optional[int] = None, task_id: Optional[int] = None):
    """Запись факта просмотра проекта/задачи конкретным user_id."""
    rv = RecentView(
        user_id=user_id,
        project_id=project_id,
        task_id=task_id,
        viewed_at=datetime.utcnow()
    )
    db.add(rv)
    db.commit()

@router.get("/recent-projects")
def get_recent_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """3 последних проекта, где пользователь участвует, по created_at desc."""
    recent_projects = (
        db.query(Project)
          .join(Project.participants)
          .filter(User.id == current_user.id)
          .order_by(Project.created_at.desc())
          .limit(3)
          .all()
    )
    return recent_projects

@router.get("/recent-tasks")
def get_recent_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Последние 5 задач, где user=assigned_user OR creator, по created_at desc."""
    tasks = (
        db.query(Task)
          .filter((Task.assigned_user_id == current_user.id) | (Task.creator_id == current_user.id))
          .order_by(Task.created_at.desc())
          .limit(5)
          .all()
    )
    return tasks

@router.get("/viewed")
def get_recently_viewed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Последние 10 просмотренных (RecentView). Убираем дубли."""
    views = (
        db.query(RecentView)
          .filter(RecentView.user_id == current_user.id)
          .order_by(RecentView.viewed_at.desc())
          .limit(10)
          .all()
    )
    tasks = []
    projects = []
    seen_tasks = set()
    seen_projects = set()

    for rv in views:
        if rv.task and rv.task_id not in seen_tasks:
            tasks.append(rv.task)
            seen_tasks.add(rv.task_id)
        elif rv.project and rv.project_id not in seen_projects:
            projects.append(rv.project)
            seen_projects.add(rv.project_id)

    return {"tasks": tasks, "projects": projects}

@router.get("/assigned-to-me")
def get_assigned_to_me(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Все задачи, назначенные пользователю."""
    tasks = (
        db.query(Task)
          .filter(Task.assigned_user_id == current_user.id)
          .order_by(Task.created_at.desc())
          .all()
    )
    return tasks

@router.get("/favorites")
def get_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Все избранные задачи/проекты текущего пользователя."""
    favs = (
        db.query(Favorite)
          .filter(Favorite.user_id == current_user.id)
          .all()
    )
    tasks = []
    projects = []
    seen_t = set()
    seen_p = set()

    for f in favs:
        if f.task and f.task_id not in seen_t:
            tasks.append(f.task)
            seen_t.add(f.task_id)
        elif f.project and f.project_id not in seen_p:
            projects.append(f.project)
            seen_p.add(f.project_id)

    return {"tasks": tasks, "projects": projects}

# Добавление в избранное
@router.post("/favorites/add")
def add_to_favorites(
    task_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not task_id and not project_id:
        raise HTTPException(400, detail="Нужен либо task_id, либо project_id")

    existing = db.query(Favorite).filter_by(
        user_id=current_user.id,
        task_id=task_id,
        project_id=project_id
    ).first()
    if existing:
        return {"detail": "Уже в избранном"}

    fav = Favorite(
        user_id=current_user.id,
        task_id=task_id,
        project_id=project_id
    )
    db.add(fav)
    db.commit()
    return {"detail": "Добавлено в избранное"}

# Удаление из избранного
@router.delete("/favorites/remove", status_code=204)
def remove_from_favorites(
    task_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not task_id and not project_id:
        raise HTTPException(400, detail="Нужен либо task_id, либо project_id")

    fav = db.query(Favorite).filter_by(
        user_id=current_user.id,
        task_id=task_id,
        project_id=project_id
    ).first()
    if not fav:
        raise HTTPException(404, detail="Не найдено в избранном")

    db.delete(fav)
    db.commit()
    return
