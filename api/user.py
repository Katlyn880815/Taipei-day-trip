from flask import Blueprint, request, make_response, jsonify
from module import CRUD_user as crud
from module import web_token
import json, jwt, datetime, re
from dotenv import load_dotenv, dotenv_values

config = dotenv_values('.env')
user = Blueprint('user', __name__)

def check_email_validity(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if(re.match(email_regex, email)):
        print('符合格式')
    else:
        return False

@user.route('/user', methods=['POST'])
def handle_register():
    user_register_data = request.get_json()
    email_vadility = check_email_validity(user_register_data['email'])
    if(email_vadility == False):
        response = {
            'error': True,
            'message': '電子信箱格式不符合'
        }
        return jsonify(response), 404
    result = crud.check_email_is_exist(user_register_data['email'], user_register_data['password'], user_register_data['name'])
    try:
        error_message = result['error']
        return jsonify(result), 400
    except:
        return jsonify(result)

@user.route('/user/auth', methods=['GET', 'PUT'])
def check_login():
    load_dotenv()
    secret_key = config['secret_key']
    if(request.method == 'GET'):
        if 'Authorization' in request.headers:
            data = crud.check_login_state()
            return jsonify(data)
        else:
            data = None
            return json.dumps(data), 404
    if(request.method == 'PUT'):
        user_login_data = request.get_json()
        result = crud.login(user_login_data['email'], user_login_data['password'])
        print(result)
        try:
            payload = {
                'id': result[0]['id'],
                'name': result[0]['name'],
                'email': result[0]['email'],
            }
            token = web_token.generate_jwt(payload, secret_key)
            response = {
                'ok': True,
                'token': token
            }
            return json.dumps(response)
        except:
            response = result
            return jsonify(response), 400