from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.dependencies import role_required
from app.models import RoleEnum

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
)

@router.get("/", response_model=List[schemas.Project])
def get_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    return crud.get_projects(db)

@router.post("/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    db_project = crud.create_project(db=db, project=project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/search/", response_model=List[schemas.Project])
def search_projects(
    query: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    return crud.search_projects(db, query)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    db_project = crud.get_project(db, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Проект не найден")
    success = crud.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=400, detail="Не удалось удалить проект")
    return

@router.get("/{project_id}/detail", response_model=schemas.ProjectDetail)
def get_project_detail(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    project, tasks, participants = crud.get_project_with_details(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    project_data = {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "created_at": project.created_at,
        "leader": project.leader,  # будет None, если не назначен
        "tasks": tasks,
        "participants": participants
    }
    return project_data

@router.post("/{project_id}/participants")
def add_participant(
    project_id: int,
    participant_data: schemas.ParticipantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    project = crud.add_participant_to_project(db, project_id, participant_data.user_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Не удалось добавить участника. Проверьте проект и пользователя.")
    return {"message": "Участник успешно добавлен"}

@router.post("/{project_id}/leader", response_model=schemas.ProjectDetail)
def set_project_leader(
    project_id: int,
    data: schemas.AssignLeaderData,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    updated_project = crud.assign_leader(db, project_id, data.user_id)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Проект или пользователь не найдены")

    # Перезагружаем детализированные данные проекта
    project_obj, tasks, participants = crud.get_project_with_details(db, project_id)
    return schemas.ProjectDetail(
        id=project_obj.id,
        name=project_obj.name,
        description=project_obj.description,
        created_at=project_obj.created_at,
        tasks=tasks,
        participants=participants,
        leader=project_obj.leader
    )