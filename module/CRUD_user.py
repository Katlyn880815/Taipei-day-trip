from module.load_data import *
from module import web_token
from dotenv import dotenv_values
from flask import request

config = dotenv_values('.env')
secret_key = config['secret_key']



def check_email_is_exist(email, password, name):
    result = load_data('select email from user where email = %s', (email,), 'one')
    print(result)
    print(email, name, password)

    if(result == None):
        cud_data('insert into user (name, email, password) values (%s, %s, %s)', (name, email, password))
        response_obj = {
            'ok': True
        }
    else:
        response_obj = {
            'error': True,
            'message': '此信箱已被註冊過'
        }
    return response_obj

def login(email, password):
    result = load_data('select * from user where email = %s and password = %s', (email, password,))
    print(result)
    if(result != []):
        res = result
    else:
        res = {
            'error': True,
            'message': '信箱或密碼錯誤'
        }
    return res

def check_login_state():
    try:
        request.headers.get("Authorization")
        print(request.headers.get("Authorization"))
        if 'Authorization' in request.headers:
            auth_header = request.headers.get("Authorization", None)
            token = auth_header.split(' ')[1]
            print('使用者token:',token)
            if(token is not None):
                result = web_token.decode_token(token, secret_key)
            data = {
                'id': result['id'],
                'name': result['name'],
                'email': result['email']
            }
            return data
    except:
        return False