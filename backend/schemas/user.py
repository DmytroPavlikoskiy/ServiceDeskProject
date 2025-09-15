from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from typing import Optional

class UserType(str, Enum):
    ADMIN = "admin"
    MASTER = "master"
    CLIENT = "client"


# --- Базова схема користувача ---
class UserBase(BaseModel):
    id: int = Field(..., ge=1, description="Унікальний ID користувача")
    telegram_id: Optional[int] = None
    email: EmailStr = Field(..., description="Електронна пошта")
    full_name: str = Field(..., min_length=2, max_length=100, description="Повне ім'я")
    role: UserType = Field(..., description="Роль користувача")

    class Config:
        from_attributes = True


# --- Схема для відповіді API про користувача ---
class User(UserBase):
    class Config:
        from_attributes = True


# --- Схема для створення нового користувача (реєстрація) ---
class UserCreate(BaseModel):
    telegram_id: Optional[int] = None
    email: EmailStr = Field(..., description="Електронна пошта")
    full_name: str = Field(..., min_length=2, max_length=100, description="Повне ім'я")
    password: str = Field(..., min_length=6, description="Пароль користувача")
    # role не передаємо — завжди client
    # backend буде ставити role = client автоматично.


# --- Схема для логіну (через JSON) ---
class UserLogin(BaseModel):
    telegram_id: Optional[int] = None
    email: EmailStr = Field(..., description="Електронна пошта")
    password: str = Field(..., min_length=6, description="Пароль користувача")


class RegisterResponse(BaseModel):
    message: str
    status_code: int
    user: User


# --- Схеми для оновлення користувача ---
class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100, description="Повне ім'я")
    email: Optional[EmailStr] = Field(None, description="Електронна пошта")

    class Config:
        from_attributes = True

class AdminUserUpdate(UserUpdate):
    role: Optional[UserType] = Field(None, description="Роль користувача")

    class Config:
        from_attributes = True