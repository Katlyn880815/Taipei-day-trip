from flask import Blueprint, request, make_response, jsonify
from module import CRUD_user as crud
import json, jwt, datetime, re
from dotenv import load_dotenv, dotenv_values

config = dotenv_values('.env')
booking = Blueprint('booking', __name__)

@booking.route('/booking', methods=["GET", "POST", "DELETE"])
def handle_booking():
    return