from module.load_data import *
from module import web_token
from flask import request

def check_email_is_exist(email, password, name):
    result = load_data('select email from user where email = %s', (email,), 'one')
    print('確認註冊電子郵件是否已存在於資料庫：', result)

    if(result == None):
        print('無人使用過，電子郵件可以被註冊')
        cud_data('insert into user (name, email, password) values (%s, %s, %s)', (name, email, password))
        response_obj = {
            'ok': True
        }
    else:
        print('電子郵件已經被使用過，無法註冊')
        response_obj = {
            'error': True,
            'message': '此信箱已被註冊過'
        }
    return response_obj

def login(email, password):
    result = load_data('select * from user where email = %s and password = %s', (email, password,))
    print('使用者登入資訊：', result)
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
        auth = request.headers.get("Authorization")
        if 'Authorization' in request.headers:
            auth_header = request.headers.get("Authorization", None)
            token = auth_header.split(' ')[1]
            print('使用者token:',token)
            if(token is not None):
                result = web_token.decode_token(token)
                print(result)
                print('使用者token解析後資訊：', result)
            data = {
                'id': result['id'],
                'name': result['name'],
                'email': result['email']
            }
            return data
        else:
            return False
    except:
        return False