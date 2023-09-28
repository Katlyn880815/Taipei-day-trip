import jwt, datetime
from dotenv import dotenv_values

config = dotenv_values('.env')
secret_key = config['secret_key']

def generate_jwt(payload, secret_key):
    expiration_time = datetime.datetime.utcnow()+ datetime.timedelta(days=7)
    payload['exp'] = expiration_time
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token

def decode_token(token, secret_key):
    data = jwt.decode(token, secret_key, algorithms="HS256")
    return data