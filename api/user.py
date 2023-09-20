from flask import Blueprint, request, make_response, jsonify
from module import CRUD_user as crud
import json

user = Blueprint('user', __name__)

@user.route('/user', methods=['POST'])
def handle_register():
    user_register_data = request.get_json()
    result = crud.check_email_is_exist(user_register_data['email'], user_register_data['password'], user_register_data['name'])
    print(result)
    return json.dumps(result, ensure_ascii= False)

@user.route('/user/auth', methods=['GET', 'PUT'])
def check_login_status():
    result = None
    if(request.method == 'PUT'):
        user_login_data = request.get_json()
        result = crud.load(user_login_data['email'], user_login_data['password'])
    return json.dumps(result, ensure_ascii= False)