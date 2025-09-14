from aiogram import Router, F
from aiogram.types import Message, ReplyKeyboardMarkup, KeyboardButton
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from backend.utils.bot_main import BOT_SERVICE_SECRET
import json
import aiohttp
from typing import Dict

sign_router = Router()


class RegisterForm(StatesGroup):
    full_name = State()
    email = State()
    password = State()
    confirm_password = State()


sign_keyborad = keyboard = ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="Login")],
        [KeyboardButton(text="Register")]
    ], resize_keyboard=True)

@sign_router.message(CommandStart)
async def reg_log(message: Message):
    keyboard = sign_keyborad
    await message.answer(
        text=f"Привіт {message.from_user.username}, бажаєте зареєструватись ?\nЧи ви вже в нас не вперше:)",
        reply_markup=keyboard
        )


async def register(user_data: Dict):
    json_payload = json.dumps(user_data)
    async with aiohttp.ClientSession() as session:
        async with session.post(url="http://127.0.0.1:8000/api/user/register", json=json_payload, headers={'X-BOT-TOKEN': BOT_SERVICE_SECRET}) as res:
            print(res.json())
            


@dp.message(F.text == "Register")
async def register(message: Message, state: FSMContext):
    await message.answer("Введіть повне імя; ")
    await state.set_state(RegisterForm.full_name)


@dp.message(RegisterForm.full_name)
async def process_email(message: Message, state: FSMContext):
    await state.update_data(full_name=message.text)
    await message.answer("Введіть пошту: ")
    await state.set_state(RegisterForm.email)

@dp.message(RegisterForm.email)
async def process_email(message: Message, state: FSMContext):
    data = await state.get_data()
    if not data.get("email"):
        await state.update_data(email=message.text)
    await message.answer("Введіть пароль: ")
    await state.set_state(RegisterForm.password)

@dp.message(RegisterForm.password)
async def process_full_name(message: Message, state: FSMContext):
    await state.update_data(password=message.text)
    await message.answer("Підтверіть пароль; ")
    await state.set_state(RegisterForm.confirm_password)


@dp.message(RegisterForm.confirm_password)
async def process_full_name(message: Message, state: FSMContext):
    data = await state.get_data()
    confirm_password = message.text
    if data.get("password") != confirm_password:
        await state.set_state(RegisterForm.email)
    data["telegram_id"] = message.from_user.id



