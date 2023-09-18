from flask import Blueprint, request, make_response
from module import get_user
import json

user = Blueprint('user', __name__)

@user.route('/user', methods=['POST'])
def handle_register():
    return

@user.route('/user/auth', methods=['GET'])
def check_login_status():
    return

@user.route('/user/auth', methods=['PUT'])
def handle_login():
    return