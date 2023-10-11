import jwt, datetime
import os
from dotenv import load_dotenv

load_dotenv()
secret_key = os.getenv('secret_key')

def generate_jwt(payload, secret_key):
    expiration_time = datetime.datetime.utcnow()+ datetime.timedelta(days=7)
    payload['exp'] = expiration_time
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    print('成功產生token：', token)
    return token

def decode_token(token, secret_key = secret_key):
    print('解析以下token：', token)
    data = jwt.decode(token, secret_key, algorithms="HS256")
    return data