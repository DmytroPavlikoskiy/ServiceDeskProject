import redis
import logging

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


logger = logging.getLogger("redis_procceses")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
ch.setFormatter(formatter)
logger.addHandler(ch)


def save_user_data(id: int, telegram_id: int, access_token: str, role: str):
    key = f"user:{telegram_id}"
    if r.exists(key):
        logger.info(f"Користувач {telegram_id} вже є в Redis")
        return False  
    r.hset(key, mapping={
        "telegram_id": telegram_id,
        "access_token": access_token,
        "role": role
    })
    logger.info(f"Користувач {telegram_id} збережений у Redis")
    return True


def get_user_data(telegram_id: int):
    key = f"user:{telegram_id}"
    data = r.hgetall(key)
    return data


def save_chat_info(ticket_id: int, client_id: int, master_id: int = None):
    key = f"chat:{ticket_id}"
    if r.exists(key):
        logger.info(f"Чат з клєнтом ID: {client_id} і майстром ID: {master_id} вже існує в Redis")
        return False
    r.hset(key, mapping={
        "ticket_id": ticket_id,
        "client_id": client_id,
        "master_id": master_id if master_id is not None else ""
    })
    logger.info(f"Інформацію про чат між клєнтом ID: {client_id} і майстром ID: {master_id} збережено у Redis")
    return True

def update_chat_info(ticket_id: int, client_id: int = None, master_id: int = None):
    key = f"chat:{ticket_id}"
    chat_info = get_chat_info_data(ticket_id)

    if not chat_info:
        logger.warning(f"⚠️ Чат для ticket_id={ticket_id} не знайдено в Redis")
        return False

    updates = {}
    if client_id is not None:
        updates["client_id"] = client_id
    if master_id is not None:
        updates["master_id"] = master_id

    if updates:
        r.hset(key, mapping=updates)
        logger.info(f"✅ Чат {ticket_id} оновлений у Redis: {updates}")
        return True

    logger.info(f"ℹ️ Немає полів для оновлення у чаті {ticket_id}")
    return False


def get_chat_info_data(ticket_id: int):
    key = f"chat:{ticket_id}"
    data = r.hgetall(key)
    return data