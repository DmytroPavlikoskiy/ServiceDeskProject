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
from bot.keyboard.sign_keyborad import sign_keyborad


register_router = Router(name="register")

async def register_request(user_data: Dict):
    if user_data:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url="http://127.0.0.1:8000/api/user/register",
                json=user_data, 
                headers={"X-BOT-TOKEN": BOT_SERVICE_SECRET}
            ) as res:
                response = await res.json()
                if res.status == 400:
                    return {"status_code": 400, "message": response.get("detail", "Користувач з таким email вже існує")}
                if res.status != 200 and res.status != 400:
                    return {"status_code": res.status, "message": response.get("detail", "Помилка")}
                if response.get("status_code") == 200:
                    user = response.get("user")
                    save_user_data(access_token=response.get("access_token"),
                                   telegram_id=user.get("telegram_id"), role=user.get("role"))
                    return {"status_code": 200, "message": "Успішна реєстрація", "user": user}



class RegisterForm(StatesGroup):
    full_name = State()
    email = State()
    password = State()
    confirm_password = State()

@register_router.message(F.text == "Register")
async def register(message: Message, state: FSMContext):
    await message.answer("Введіть ваше повне ім'я: ")
    await state.set_state(RegisterForm.full_name)


@register_router.message(RegisterForm.full_name)
async def process_full_name(message: Message, state: FSMContext):
    await state.update_data(full_name=message.text)
    await message.answer("Введіть вашу пошту: ")
    await state.set_state(RegisterForm.email)


@register_router.message(RegisterForm.email)
async def process_email(message: Message, state: FSMContext):
    await message.answer("Введіть пароль: ")
    await state.update_data(email=message.text)
    await state.set_state(RegisterForm.password)


@register_router.message(RegisterForm.password)
async def process_password(message: Message, state: FSMContext):
    await state.update_data(password=message.text)
    await message.answer("Підтвердіть пароль: ")
    await state.set_state(RegisterForm.confirm_password)


@register_router.message(RegisterForm.confirm_password)
async def process_confirm_password_and_reg(message: Message, state: FSMContext):
    data = await state.get_data()
    confirm_password = message.text
    if data.get("password") != confirm_password:
        await message.answer("Упс 🤔 паролі не співпали !!!")
        await message.answer("Введіть пароль: ")
        await state.set_state(RegisterForm.password)
    else:
        data["telegram_id"] = message.from_user.id
        resp = await register_request(data)
        status_code = resp.get("status_code")
        user = resp.get("user")
        if status_code == 400:
            await message.answer(f"{resp.get('message')}, спробуйте ще раз !")
            await message.answer("Введіть ваше повне ім'я: ")
            await state.set_state(RegisterForm.full_name)
        if status_code == 200:
            await message.answer(f"Вітаю {user.get('full_name')} {resp.get('message')}", reply_markup=sign_keyborad())
            await state.clear()