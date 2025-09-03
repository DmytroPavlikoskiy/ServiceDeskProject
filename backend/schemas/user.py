from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from typing import Optional



class UserType(str, Enum):
    ADMIN = "admin"
    CLIENT = "client"

class UserBase(BaseModel):                                                            
    id: int = Field(..., ge=1, description="Унікальний ID користувача")           
    email: EmailStr = Field(..., description="Електронна пошта")                   
    full_name: str = Field(..., min_length=2, max_length=100, description="Повне ім'я")
    type: UserType = Field(..., description="Тип користувача")

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    pass


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Повне ім'я")
    email: Optional[EmailStr] = Field(None, description="Електронна пошта")

    class Config:
        orm_mode = True


class User(UserBase):
    id: int

    class Config:
        orm_mode = True

