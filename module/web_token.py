import jwt, datetime

secret_key = 'katlyn1234'

def generate_jwt(payload, secret_key):
    expiration_time = datetime.datetime.utcnow()+ datetime.timedelta(days=7)
    payload['exp'] = expiration_time
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token

def decode_token(token, secret_key):
    data = jwt.decode(token, secret_key, algorithms="HS256")
    return data