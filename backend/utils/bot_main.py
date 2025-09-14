import asyncio
from backend.settings.settings import settings
from aiogram import Bot, types, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from backend.utils.signing_bot import sign_router


BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
BOT_SERVICE_SECRET = settings.BOT_SERVICE_SECRET

bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)


async def main():
    storage = MemoryStorage()
    dp.include_router(sign_router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())