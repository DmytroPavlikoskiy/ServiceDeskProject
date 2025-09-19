from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List

from backend.database.models import User
from backend.database.dependencies import get_db, get_current_user
from backend.schemas.user import UserCreate, User as UserSchema, UserLogin, RegisterResponse
from backend.settings.settings import settings

auth_router = APIRouter(prefix="/api/user", tags=["Auth"])

# JWT конфіг
SECRET_KEY = settings.JWT_SECRET_KEY  # перенеси в settings
ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 24  # 1 день

# Хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_bot_token(x_bot_token: str = Header(None)):
    if x_bot_token is None:
        return "frontend"  # якщо заголовку немає → фронт
    if x_bot_token != settings.BOT_SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Invalid bot token")
    return "bot"


@auth_router.get("/get_masters", response_model=List[UserSchema])
def get_masters(db: Session = Depends(get_db),
                source: str = Depends(verify_bot_token)):
    if source != "bot":
        raise HTTPException(status_code=403, detail="Forbidden")
    masters = db.query(User).filter_by(role="master").all()
    if not masters:
        raise HTTPException(status_code=404, detail="Masters not found")
    return masters


@auth_router.get("/get_master/{telegram_id}", response_model=UserSchema)
def get_master(
    telegram_id: int,
    db: Session = Depends(get_db),
    source: str = Depends(verify_bot_token)
):
    if source != "bot":
        raise HTTPException(status_code=403, detail="Forbidden")
    master = db.query(User).filter_by(telegram_id=telegram_id, role="master").first()
    if not master:
        raise HTTPException(status_code=404, detail="Master not found")
    return UserSchema.model_validate(master, from_attributes=True)


# === Register ===
@auth_router.post("/register", response_model=RegisterResponse)
def register(user_data: UserCreate,
             db: Session = Depends(get_db),
             source: str = Depends(verify_bot_token)):
    telegram_id = None
    if source == "bot":
        telegram_id = user_data.telegram_id
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Користувач з таким email вже існує")
    
    new_user = User(
        telegram_id=telegram_id,
        email=user_data.email,
        full_name=user_data.full_name,
        password=get_password_hash(user_data.password),
        role="client"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "Успішна реєстрація",
        "status_code": 200,
        "user": User.model_validate(new_user)
    }

def user_add_tg_id(db: Session, telegram_id: int, user_id: int) -> User | None:
    user = db.query(User).get(user_id)
    if user:
        user.telegram_id = telegram_id
        db.commit()
        db.refresh(user)
        return user
    return None


# === Login ===
@auth_router.post("/auth")
def login(
    response: Response,
    user_data: UserLogin,
    db: Session = Depends(get_db),
    source: str = Depends(verify_bot_token)
):
    email = user_data.email
    password = user_data.password

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Невірний email або пароль")

    # якщо логін через бота і в базі ще нема telegram_id
    if source == "bot" and user.telegram_id is None and user_data.telegram_id:
        user = user_add_tg_id(db=db, user_id=user.id, telegram_id=user_data.telegram_id)

    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="Lax",
        secure=False,
        path="/"
    )

    return {
        "message": "Успішний вхід",
        "status_code": 200,
        "access_token": access_token,   # 👈 тут бот його зможе забрати
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "telegram_id": user.telegram_id
        }
    }


# === Get current user ===
@auth_router.get("/auth/user", response_model=UserSchema)
def get_user(current_user: User = Depends(get_current_user)):
    return current_user


# === Logout ===
@auth_router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Вихід виконано успішно"}