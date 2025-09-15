from aiogram import Bot, Dispatcher, F
import asyncio
from aiogram.filters import CommandStart
from aiogram.types import (Message, ReplyKeyboardMarkup, KeyboardButton)
from bot.config import TELEGRAM_BOT_API, BOT_SERVICE_SECRET
from aiogram.fsm.storage.memory import MemoryStorage
import aiohttp
import json
from typing import Dict
from bot.routers import register_routers, login_router, main_router
from bot.redis.redis_proccess import r
from bot.tasks.listen_new_ticket_task import listen_new_tickets
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.FileHandler("bot.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("bot_logger")


bot = Bot(token=TELEGRAM_BOT_API)
dp = Dispatcher(storage=MemoryStorage())



async def main():
    dp.include_router(register_routers.register_router)
    dp.include_router(login_router.login_router)
    dp.include_router(main_router.main_router)
    asyncio.create_task(listen_new_tickets(bot))
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())