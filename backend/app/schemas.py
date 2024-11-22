from pydantic import BaseModel
from typing import Optional
from app.models import RoleEnum

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: RoleEnum

class User(UserBase):
    id: int
    role: RoleEnum

    class Config:
        orm_mode = True