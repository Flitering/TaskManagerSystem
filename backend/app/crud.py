from sqlalchemy.orm import Session
from app import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Пользователи

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session):
    return db.query(models.User).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    role = db.query(models.Role).filter(models.Role.name == user.role).first()
    if not role:
        raise ValueError("Указанная роль не существует")
    db_user = models.User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        hashed_password=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    user = get_user(db, user_id)
    if user:
        if user_update.full_name is not None:
            user.full_name = user_update.full_name
        if user_update.email is not None:
            user.email = user_update.email
        if user_update.password is not None:
            user.hashed_password = pwd_context.hash(user_update.password)
        if user_update.role is not None:
            role = db.query(models.Role).filter(models.Role.name == user_update.role).first()
            if role:
                user.role = role
        db.commit()
        db.refresh(user)
    return user

# Проекты

def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()

def get_projects(db: Session):
    return db.query(models.Project).all()

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# Задачи

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(db: Session):
    return db.query(models.Task).all()

def create_task(db: Session, task: schemas.TaskCreate, creator_id: int):
    db_task = models.Task(
        description=task.description,
        details=task.details,
        due_date=task.due_date,
        priority=task.priority,
        estimated_time=task.estimated_time,
        project_id=task.project_id,
        assigned_user_id=task.assigned_user_id,
        creator_id=creator_id,
        parent_task_id=task.parent_task_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task: models.Task, task_update: schemas.TaskUpdate):
    for key, value in task_update.dict(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

# Комментарии

def create_comment(db: Session, comment: schemas.CommentCreate, user_id: int, task_id: int):
    db_comment = models.Comment(content=comment.content, user_id=user_id, task_id=task_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments_by_task(db: Session, task_id: int):
    return db.query(models.Comment).filter(models.Comment.task_id == task_id).all()

# Вложения

def create_attachment(db: Session, attachment: schemas.AttachmentCreate, task_id: int, file_url: str):
    db_attachment = models.Attachment(
        filename=attachment.filename,
        file_url=file_url,
        task_id=task_id
    )
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_attachments_by_task(db: Session, task_id: int):
    return db.query(models.Attachment).filter(models.Attachment.task_id == task_id).all()

# Подзадачи

def create_subtask(db: Session, task: schemas.TaskCreate, creator_id: int):
    return create_task(db, task, creator_id)

# Поиск по сайту

def search_tasks(db: Session, query: str):
    return (
        db.query(models.Task)
        .filter(models.Task.description.ilike(f"%{query}%"))
        .all()
    )
    
def search_projects(db: Session, query: str):
    return (
        db.query(models.Project)
        .filter(models.Project.name.ilike(f"%{query}%"))
        .all()
    )