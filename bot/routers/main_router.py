from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import (Message)
from bot.keyboard.sign_keyborad import sign_keyborad

main_router = Router(name="main")


@main_router.message(CommandStart)
async def reg_log(message: Message):
    await message.answer(
        text=f"Привіт {message.from_user.username}, бажаєте зареєструватись ?\nЧи ви вже в нас не вперше 😇",
        reply_markup=sign_keyborad()
        )