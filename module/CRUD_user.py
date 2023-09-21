from module.load_data import *

def check_email_is_exist(email, password, name):
    result = load_data('select email from user where email = %s', (email,), 'one')
    print(result)
    print(email, name, password)

    if(result == None):
        insert_data('insert into user (name, email, password) values (%s, %s, %s)', (name, email, password))
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