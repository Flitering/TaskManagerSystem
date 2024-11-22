from typing import List
from fastapi import Depends, HTTPException, status
from app.auth import get_current_user
from app.models import User, RoleEnum

def role_required(allowed_roles: List[RoleEnum]):
    def wrapper(current_user: User = Depends(get_current_user)):
        user_role = current_user.role.name
        if user_role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для выполнения данного действия",
            )
        return current_user
    return Depends(wrapper)