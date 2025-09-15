import asyncio
import json
import aiohttp
from aiogram import Bot
from bot.redis.redis_proccess import r
from bot.config import BOT_SERVICE_SECRET
import logging
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

logger = logging.getLogger("listen_new_tickets")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
ch.setFormatter(formatter)
logger.addHandler(ch)

def inline_btn(ticket_id):
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Взяти в ремонт", callback_data=f"ticketID_{ticket_id}")]
        ]
    )

async def listen_new_tickets(bot_instance: Bot):
    pubsub = r.pubsub()
    pubsub.subscribe("new_ticket_channel")
    logger.info("✅ Started listening to new_ticket_channel")

    while True:
        try:
            message = pubsub.get_message()
            if message and message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    ticket_id = data["ticket_id"]
                    title = data["title"]
                    description = data["description"]
                    client_id = data["client_id"]
                    logger.info(f"📨 New ticket received: {ticket_id} from client {client_id}")

                    # Отримуємо список майстрів з бекенду
                    async with aiohttp.ClientSession() as session:
                        async with session.get(
                            url="http://127.0.0.1:8000/api/user/get_masters",
                            headers={"X-BOT-TOKEN": BOT_SERVICE_SECRET}
                        ) as res:
                            try:
                                response = await res.json()
                            except Exception as e:
                                logger.error(f"❌ Failed to parse JSON from /get_masters: {e}")
                                response = []

                            if res.status == 404:
                                logger.warning("⚠️ Masters not found")
                                response = []
                            elif res.status != 200:
                                logger.error(f"❌ Something went wrong! Status: {res.status}")
                                response = []

                    # Відправка повідомлення кожному майстру
                    for master in response:
                        logger.info(response)
                        try:
                            if master.get("telegram_id"):
                                await bot_instance.send_message(
                                    chat_id= int(master.get("telegram_id")),
                                    text=f"Нова заявка від клієнта {client_id}:\n"
                                         f"📝 {title}\n"
                                         f"{description[:200]}...\n",
                                    reply_markup=inline_btn(ticket_id=ticket_id)
                                )
                                logger.info(f"✅ Ticket {ticket_id} sent to master {master.get('telegram_id')}")
                        except Exception as e:
                            logger.error(f"❌ Failed to send message to master {master.get('telegram_id')}: {e}")

                except Exception as e:
                    logger.error(f"❌ Failed to process ticket message: {e}")

            await asyncio.sleep(0.1)

        except Exception as e:
            logger.error(f"❌ Redis pubsub error: {e}")
            await asyncio.sleep(1)  # пауза, щоб не спамити при критичній помилці