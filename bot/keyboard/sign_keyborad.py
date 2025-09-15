from aiogram.types import (ReplyKeyboardMarkup, KeyboardButton)

def sign_keyborad():
    keyboard = ReplyKeyboardMarkup(keyboard=[
        [KeyboardButton(text="Login")],
        [KeyboardButton(text="Register")]
    ], resize_keyboard=True)
    return keyboard