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
    current_user: models.User = Depends(
        role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor])
    ),
):
    return crud.get_projects(db)

@router.post("/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    return crud.create_project(db=db, project=project)

@router.get("/", response_model=List[schemas.Project])
def read_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    projects = crud.get_projects(db)
    return projects

@router.get("/search/", response_model=List[schemas.Project])
def search_projects(
    query: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor])
    ),
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