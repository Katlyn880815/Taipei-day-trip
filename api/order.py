from flask import Blueprint, request, make_response, jsonify
import requests, json, time, random, re
from module import CRUD_user as crud
from module import load_data as load

orders = Blueprint('orders', __name__)
partner_key = 'partner_CV79MTYhJKhO3oin15R5gmOAr9O01u3RHHpDupgHnKLIITmBT3Wl3M3l'
merchant_id = 'merchantA'
test_url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime'

headers = {
    'Content-Type': 'application/json',
    'x-api-key' : partner_key,
}


@orders.route('/orders', methods=['POST'])
def handle_payment():
    user_is_login = crud.check_login_state()
    if(user_is_login == False):
        return jsonify({'error': True, 'message': '使用者尚未登入'}), 403
    order_infos = request.get_json()
    check_user_infos = check_infos_validity(order_infos['contact']['email'], order_infos['contact']['name'], order_infos['contact']['phone'])
    if(check_user_infos == False):
        payment_result = {
            'error': True,
            'message': '使用者電子信箱或手機號碼填寫錯誤，或姓名未填寫'
        }
        return jsonify(payment_result), 400
    order_number = generate_order_number()
    create_order = create_order_in_database(order_infos, order_number)
    req_obj = generate_request_obj(order_infos, order_number)
    req_obj = json.dumps(req_obj)
    try:
        payment_status = pay(req_obj)
        if(payment_status is not False):
            if(payment_status == 0):
                switch_payment_status_to_paid(order_number)
            data = {
                'data': {
                    'number': order_number,
                    'payment': {
                        'status': payment_status,
                        'message': 'Payment Failed' if payment_status != 0 else 'Payment Successful'
                    }
                }
            }
            return jsonify(data), 200
        else:
            return jsonify({'error': True, 'message': '資料更動錯誤'}), 500
    except:
        #回應前端訂單失敗
        return jsonify({'error': True, 'message': '訂單處理失敗'}), 500




def generate_request_obj(orderInfos, order_number):
    req_obj = {
        "prime": orderInfos['prime'],
        "partner_key": partner_key,
        "merchant_id": "Katlyn_CTBC",
        "details": "TapPay Test",
        "amount": orderInfos['order']['price'],
        "cardholder": {
            "phone_number": orderInfos['contact']['phone'],
            "name": orderInfos['contact']['name'],
            "email": orderInfos['contact']['email']
    },
        "remember": True,
        "order_number": order_number
    }
    return req_obj

def pay(req_obj):
    response = requests.post(test_url, data = req_obj, headers = headers)
    if response.status_code == 200:
        try:
            data = response.json()
            print(data)
            return data['status']
        except:
            return False
    else:
        return False
    
def generate_order_number():
    timestamp = int(time.time())
    random_number = random.randint(1000, 9999)
    order_number = f"{timestamp}{random_number}"
    return int(order_number)

def check_infos_validity(email, name, phone):
    email_re = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    phone_re = r'^\+886\d{9}$'
    status = False
    if(re.match(email_re, email) and re.match(phone_re, phone) and name != '' and name != None):
        status = True
    return status

def create_order_in_database(order_infos, order_number):
    try:
        data = load.cud_data('Insert into orders (order_number, attraction_id, date, time, contact_email, contact_phone, contact_name) values (%s, %s, %s, %s, %s, %s, %s)', (order_number, order_infos['order']['trip']['attraction']['id'], order_infos['order']['trip']['date'], order_infos['order']['trip']['time'], order_infos['contact']['email'], order_infos['contact']['phone'], order_infos['contact']['name'],))
        return True
    except:
        return False
    
def switch_payment_status_to_paid(order_number):
    try:
        data = load.cud_data('update orders set payment_status = "paid" where order_number = %s', (order_number,))
        return True
    except:
        return False
