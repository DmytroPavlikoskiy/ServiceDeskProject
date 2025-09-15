from aiogram import Bot, Dispatcher, F, Router
import asyncio
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import (Message, ReplyKeyboardMarkup, KeyboardButton)
from bot.config import TELEGRAM_BOT_API, BOT_SERVICE_SECRET
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.state import StatesGroup, State
import aiohttp
import json
from typing import Dict
from bot.redis.redis_proccess import save_user_data


login_router = Router(name="login")

async def login_request(user_data: Dict):
    if user_data:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url="http://127.0.0.1:8000/api/user/auth",
                json=user_data, 
                headers={"X-BOT-TOKEN": BOT_SERVICE_SECRET}
            ) as res:
                response = await res.json()
                if res.status == 401:
                    return {"status_code": 401, "message": response.get("detail", "Невірний email або пароль")}
                if res.status != 200 and res.status != 401:
                    return {"status_code": res.status, "message": response.get("detail", "Помилка")}
                if response.get("status_code") == 200:
                    user = response.get("user")
                    save_user_data(access_token=response.get("access_token"),
                                   telegram_id=user.get("telegram_id"), role=user.get("role"))
                    return {"status_code": 200, "message": "Успішний вхід", "user": user}


class LoginForm(StatesGroup):
    email = State()
    password = State()

@login_router.message(F.text == "Login")
async def login(message: Message, state: FSMContext):
    await message.answer("Введіть пошту: ")
    await state.set_state(LoginForm.email)


@login_router.message(LoginForm.email)
async def process_email(message: Message, state: FSMContext):
    await message.answer("Введіть пароль: ")
    await state.update_data(email=message.text)
    await state.set_state(LoginForm.password)


@login_router.message(LoginForm.password)
async def process_password(message: Message, state: FSMContext):
    await state.update_data(password=message.text)
    data = await state.get_data()
    data["telegram_id"] = message.from_user.id
    resp = await login_request(data)
    status_code = resp.get("status_code")
    user = resp.get("user")
    if status_code == 401:
        await message.answer(f"{resp.get('message')}")
        await state.set_state(LoginForm.email)
        await message.answer("Введіть email:")
    if status_code == 200:
        await message.answer(f"Вітаю {user.get('full_name')} {resp.get('message')}")
        await state.clear()