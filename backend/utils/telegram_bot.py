import asyncio
from typing import List
from backend.database.dependencies import get_db
from backend.settings.settings import settings
from backend.database.models import Ticket, FileModel, User
from aiogram import Bot, types
from aiogram.types import InputMediaPhoto, InlineKeyboardButton, InlineKeyboardMarkup

BOT_TOKEN = settings.TELEGRAM_BOT_TOKEN
# MASTER_GROUP_CHAT_ID = int(os.getenv('MASTER_GROUP_CHAT_ID', '0'))
BOT_SERVICE_SECRET = settings.BOT_SERVICE_SECRET

bot = Bot(token=BOT_TOKEN)

# Enqueue function (you can replace with Celery job)
    # async def enqueue_send_ticket_to_masters(ticket_id: int):
    #     # simple pattern: call in-process (BackgroundTasks) - ensure bot loop is running
    #     await send_ticket_to_masters(ticket_id)


    # async def send_ticket_to_masters(ticket_id: int):
    #     db = next(get_db())
    #     ticket = db.query(Ticket).get(ticket_id)
    #     if not ticket:
    #         return
    #     # files = db.query(FileModel).filter(FileModel.ticket_id == ticket_id).all()
    #     # file_urls = [f.url for f in files]

    #     # формуємо текст заявки
    #     text = f"🔧 *Нова заявка*\n\n*{ticket.title}*\n{ticket.description}\n\n#ticket_{ticket.id}"
    #     keyboard = InlineKeyboardMarkup(inline_keyboard=[
    #         [InlineKeyboardButton(text='Взяти в ремонт', callback_data=f'assign:{ticket.id}')]
    #     ])

    #     # дістаємо всіх майстрів з БД
    #     masters = db.query(User).filter(User.role == 'master', User.telegram_id.isnot(None)).all()

    #     # media = [InputMediaPhoto(media=f.url) for f in files]

    #     for master in masters:
    #         try:
    #         #     if media:
    #         #         await bot.send_media_group(chat_id=master.telegram_id, media=media)

    #             await bot.send_message(
    #                 chat_id=master.telegram_id,
    #                 text=text,
    #                 reply_markup=keyboard,
    #                 parse_mode='Markdown'
    #             )
    #         except Exception as e:
    #             print(f"❌ Не вдалося надіслати {master.full_name} ({master.telegram_id}):", e)

    # # Bot handlers (if running bot in same process - optional)
    # from aiogram import Dispatcher

    # async def register_bot_handlers(dp: Dispatcher):
    #     @dp.callback_query_handler(lambda c: c.data and c.data.startswith('assign:'))
    #     async def process_assign_callback(callback_query: types.CallbackQuery):
    #         data = callback_query.data
    #         _, ticket_id_str = data.split(':')
    #         ticket_id = int(ticket_id_str)
    #         tg_user_id = callback_query.from_user.id

    #         # map telegram user to master
    #         db = next(get_db())
    #         master = db.query(User).filter(User.telegram_id == tg_user_id, User.role == 'master').first()
    #         if not master:
    #             await callback_query.answer('Ви не зареєстровані як майстер', show_alert=True)
    #             return

    #         # call backend assign endpoint
    #         import requests
    #         BACKEND_URL = os.getenv('BACKEND_PUBLIC_URL', 'http://localhost:8000')
    #         resp = requests.post(f"{BACKEND_URL}/api/tickets/{ticket_id}/assign", json={'master_id': master.id}, headers={'X-BOT-TOKEN': BOT_SERVICE_SECRET})
    #         if resp.status_code == 200:
    #             await callback_query.answer('Заявка взята в роботу')
    #             # edit message to remove buttons
    #             try:
    #                 await bot.edit_message_reply_markup(chat_id=callback_query.message.chat.id, message_id=callback_query.message.message_id, reply_markup=None)
    #                 await bot.send_message(chat_id=callback_query.message.chat.id, text=f"✅ Взято в роботу майстром: {master.full_name}")
    #             except Exception:
    #                 pass
    #         else:
    #             await callback_query.answer('Не вдалося прийняти заявку', show_alert=True)