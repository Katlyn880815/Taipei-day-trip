import jwt, datetime
from dotenv import dotenv_values

# config = dotenv_values('.env')
secret_key = 'katlyn1234'
print(secret_key)

def decode_token(token, secret_key):
    data = jwt.decode(token, secret_key, algorithms="HS256")
    print(data)
    return data