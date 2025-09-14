from aiogram import Bot, Dispatcher, F
import asyncio
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import (Message, ReplyKeyboardMarkup, KeyboardButton)
from config import TELEGRAM_BOT_API
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.state import StatesGroup, State
import aiohttp
import json

bot = Bot(token=TELEGRAM_BOT_API)
dp = Dispatcher(bot, storage=MemoryStorage())

class RegisterForm():
    telegram_id = int
    email = str
    full_name = str

@dp.message(CommandStart)
async def reg_log(message: Message):
    keyboard = ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="Login")],
        [KeyboardButton(text="Register")]
    ], resize_keyboard=True)
    await message.answer(
        text=f"Привіт {message.from_user.username}, бажаєте зареєструватись ?\nЧи ви вже в нас не вперше:)",
        reply_markup=keyboard
        )


async def register(telegram_id, email, full_name, pa):
    if (telegram_id, email, full_name):
        payload = {
            "telegram_id": telegram_id,
            "email": email,
            "full_name": full_name
        }
        json_payload = json.dumps(payload)
        async with aiohttp.ClientSession() as session:
            async with session.post(url="http://127.0.0.1:8000/api/user/register", json=json_payload) as res:
                print(res.json())
            


@dp.message(F.text == "Register")
async def register(message: Message, state: FSMContext):
    await message.answer("Введіть вашу пошту; ")
    await state.set_state(RegisterForm.email)


@dp.message(RegisterForm.email)
async def process_email(message: Message, state: FSMContext):
    await state.update_data(email=message.text)
    await message.answer("Введіть ваше повне імя: ")
    await state.set_state(RegisterForm.full_name)

@dp.message(RegisterForm.full_name)
async def process_full_name(message: Message, state: FSMContext):
    await state.update_data(full_name=message.text)
    await message.answer("Регістрація виконана")
    
    

async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())