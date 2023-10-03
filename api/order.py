from flask import Blueprint, request, make_response, jsonify
from module import CRUD_user as crud
from module import load_data as load

orders = Blueprint('orders', __name__)
parner_key = 'partner_CV79MTYhJKhO3oin15R5gmOAr9O01u3RHHpDupgHnKLIITmBT3Wl3M3l'

@orders.route('/orders', methods=['POST'])
def handle_payment():
    return