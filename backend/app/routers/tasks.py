from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.database import get_db
from app.dependencies import role_required, get_current_user
from app.models import RoleEnum, Attachment
from datetime import datetime
import os
import shutil

router = APIRouter(
    prefix="/tasks",
    tags=["tasks"],
    dependencies=[Depends(get_current_user)],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Task])
def read_tasks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    if current_user.role.name == RoleEnum.executor.value:
        tasks = db.query(models.Task).filter(models.Task.assigned_user_id == current_user.id).all()
    else:
        tasks = crud.get_tasks(db)
    return tasks

@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = models.Task(
        description=task.description,
        details=task.details,
        project_id=task.project_id,
        assigned_user_id=task.assigned_user_id,
        creator_id=current_user.id,
        estimated_time=task.estimated_time,
        assignment_date=datetime.utcnow() if task.assigned_user_id else None
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    if current_user.role.name == RoleEnum.executor.value and task.assigned_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Нет прав на изменение этой задачи")
    return crud.update_task(db, task, task_update)

@router.get("/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor])),
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    return task

@router.post("/{task_id}/comments", response_model=schemas.Comment)
def add_comment(
    task_id: int,
    comment: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    return crud.create_comment(db, comment, current_user.id, task_id)

@router.post("/{task_id}/attachments", response_model=schemas.Attachment)
def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")

    upload_directory = "uploads"
    os.makedirs(upload_directory, exist_ok=True)
    file_location = os.path.join(upload_directory, file.filename)
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = schemas.AttachmentCreate(filename=file.filename)
    return crud.create_attachment(db, attachment, task_id, file_url=file_location)

@router.post("/{task_id}/subtasks", response_model=schemas.Task)
def create_subtask(
    task_id: int,
    subtask_data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager])),
):
    parent_task = crud.get_task(db, task_id)
    if not parent_task:
        raise HTTPException(status_code=404, detail="Родительская задача не найдена")

    subtask_data.parent_task_id = task_id
    return crud.create_subtask(db, subtask_data, current_user.id)

@router.get("/search/", response_model=List[schemas.Task])
def search_tasks(
    query: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager, RoleEnum.executor]))
):
    return crud.search_tasks(db, query)

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    db_task = crud.get_task(db, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    success = crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=400, detail="Не удалось удалить задачу")
    return

@router.delete("/{task_id}/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    task_id: int,
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(role_required([RoleEnum.admin, RoleEnum.manager]))
):
    # Получаем задачу
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")

    # Проверяем, что вложение относится к этой задаче
    attachment = db.query(Attachment).filter(Attachment.id == attachment_id, Attachment.task_id == task_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Вложение не найдено или не относится к этой задаче")

    db.delete(attachment)
    db.commit()

    return