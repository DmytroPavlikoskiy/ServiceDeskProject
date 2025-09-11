from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

from backend.database.models import User
from backend.database.dependencies import get_db
from backend.schemas.user import UserCreate, User as UserSchema, UserLogin
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


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


def get_current_user(db: Session = Depends(get_db), token: str | None = None):
    if not token:
        return None
    email = decode_access_token(token)
    if email is None:
        return None
    return db.query(User).filter(User.email == email).first()


# === Register ===
@auth_router.post("/register", response_model=UserSchema)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Користувач з таким email вже існує")

    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        password=get_password_hash(user_data.password),
        role="client"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# === Login ===
@auth_router.post("/auth")
def login(response: Response, user_data: UserLogin, db: Session = Depends(get_db)):
    email = user_data.email
    password = user_data.password
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Невірний email або пароль")

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

    return {"message": "Успішний вхід", "user": {
        "id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role
    }}


# === Get current user ===
@auth_router.get("/auth/user", response_model=UserSchema)
def get_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Не авторизований")

    email = decode_access_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Недійсний токен")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Користувач не знайдений")

    return user


# === Logout ===
@auth_router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Вихід виконано успішно"}