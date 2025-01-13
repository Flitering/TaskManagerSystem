from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import role_required, get_current_user
from app.models import RoleEnum, Team, User, Project
from app import schemas, models

router = APIRouter(
    prefix="/teams",
    tags=["teams"],
)

@router.post("/", response_model=schemas.TeamRead)
def create_team(
    data: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    # Проверка, что проект существует
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    team = Team(name=data.name, project_id=data.project_id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team

@router.get("/{team_id}", response_model=schemas.TeamRead)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")
    return team

@router.put("/{team_id}", response_model=schemas.TeamRead)
def update_team(
    team_id: int,
    data: schemas.TeamUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")

    if data.name is not None:
        team.name = data.name
    db.commit()
    db.refresh(team)
    return team

@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")

    db.delete(team)
    db.commit()
    return

@router.post("/{team_id}/add-member", response_model=schemas.TeamRead)
def add_member_to_team(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user not in team.members:
        team.members.append(user)
        db.commit()
        db.refresh(team)

    return team

@router.delete("/{team_id}/remove-member", response_model=schemas.TeamRead)
def remove_member_from_team(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Команда не найдена")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    if user in team.members:
        team.members.remove(user)
        db.commit()
        db.refresh(team)

    return team
