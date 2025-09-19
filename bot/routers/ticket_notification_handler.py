from aiogram import Router, F
from aiogram.filters import CommandStart
from aiogram.types import (Message, CallbackQuery)
from bot.keyboard.sign_keyborad import sign_keyborad
from bot.redis.redis_proccess import update_chat_info, get_chat_info_data
from bot.config import BOT_SERVICE_SECRET
import logging
import aiohttp
from typing import Dict


logger = logging.getLogger("notification_create_chat")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
ch.setFormatter(formatter)
logger.addHandler(ch)

notif_router = Router(name="main")


async def get_master_request(telegram_id: int) -> Dict:
    async with aiohttp.ClientSession() as session:
        async with session.get(
            url=f"http://127.0.0.1:8000/api/user/get_master/{telegram_id}",
            headers={"X-BOT-TOKEN": BOT_SERVICE_SECRET}
        ) as res:
            try:
                master = await res.json()
            except Exception as e:
                logger.error(f"❌ Failed to parse JSON from /get_masters: {e}")
                master = {}
            return master


async def create_chat_request(ticket_id):
    chat_info = get_chat_info_data(ticket_id)
    payload = {
        "ticket_id": ticket_id,
        "client_id": chat_info.get("client_id"),
        "master_id": chat_info.get("master_id")
    }
    async with aiohttp.ClientSession() as session:
        async with session.post(
            url=f"http://127.0.0.1:8000/api/chats/create_chat",
            json=payload,
            headers={"X-BOT-TOKEN": BOT_SERVICE_SECRET}
        ) as res:
            if res.status == 200:
                return True       
            try:
                resp = res.json()
            except Exception as e:
                logger.error(f"❌ Failed to parse JSON from /get_masters: {e}")
                return False
                

@notif_router.callback_query(F.data.startswith("ticketID_"))
async def notification_create_chat(callback: CallbackQuery):
    _, ticket_id = callback.data.split("_")
    master_tg_id = callback.from_user.id
    master = await get_master_request(telegram_id=master_tg_id)
    is_update = update_chat_info(ticket_id=int(ticket_id), master_id=int(master.get('id')))
    if is_update:
        logger.info(f"✅ Chat Info {ticket_id} update in Redis")
    else:
        logger.info(f"❌ Chat Info {ticket_id} not update !!!")
    is_create = await create_chat_request(ticket_id=ticket_id)
    if is_create:
        logger.info(f"✅ Chat created !!!")
        callback.message.answer(text=f"✅ Чат успішно створений !")
    else:
        logger.info(f"❌ Chat not create !!!")
        callback.message.answer(text=f"❌ Чат чат не створився, зверніться до DEV !!!")
    
