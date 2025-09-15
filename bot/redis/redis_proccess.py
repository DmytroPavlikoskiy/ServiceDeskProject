import redis

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

def save_user_data(telegram_id: int, access_token: str, role: str):
    key = f"user:{telegram_id}"
    if r.exists(key):
        print(f"Користувач {telegram_id} вже є в Redis")
        return False  
    r.hset(key, mapping={
        "telegram_id": telegram_id,
        "access_token": access_token,
        "role": role
    })
    print(f"Користувач {telegram_id} збережений у Redis")
    return True

def get_user_data(telegram_id: int):
    key = f"user:{telegram_id}"
    return r.hgetall(key)


