from flask import Blueprint, request, make_response, jsonify
from module import CRUD_user as crud
from module import load_data as load
from dotenv import dotenv_values
from module import web_token

config = dotenv_values('.env')
secret_key = config['secret_key']
booking = Blueprint('booking', __name__)

def get_uncomfirmed_order(user_id):
    order_newest_id = get_newest_order_id(user_id)
    order = load.load_data('select * from trolley where id = %s and user_id = %s', (order_newest_id, user_id,))
    print(order)
    if(order == []):
        return None
    attraction_data = load.load_data('select id, name, address from attractions_details where id = %s', (order[0]['attraction_id'],))
    attraction_image = load.load_data('select img_url from images where attraction_id = %s', (attraction_data[0]['id'],))
    date = order[0]['date'].strftime('%Y/%m/%d')

    result = {
        'data': {
            'attraction': {
                'id': attraction_data[0]['id'],
                'name': attraction_data[0]['name'],
                'address': attraction_data[0]['address'],
                'image': attraction_image[0]['img_url']
            },
            'date': date,
            'time': order[0]['time'],
            'price': order[0]['price']
        }
    }
    print(result)
    return result

def get_newest_order_id(user_id):
     order_newest_id = load.load_data('select MAX(id) from trolley where user_id = %s', (user_id,))
     order_newest_id = order_newest_id[0]['MAX(id)']
     return order_newest_id

def delete_old_order(user_id):
    print(user_id)
    search_old_order = load.load_data('select count(*) from trolley where user_id = %s', (user_id, ))
    print(search_old_order)
    old_order_count = search_old_order[0]['count(*)']
    print(old_order_count)
    if(old_order_count != 0):
        try:
            crud.cud_data('delete from trolley where user_id = %s', (user_id, ))
            return True
        except:
            print("Delete denied")
            return False
    return False


@booking.route('/booking', methods=["GET", "POST", "DELETE"])
def handle_booking():
    isLogin = crud.check_login_state()
    if(isLogin == False):
        result = {
            'error': True,
            'message': '使用者尚未登入或登入資訊錯誤'
        }
        return jsonify(result), 403
    if(request.method == 'GET'):
       data =  get_uncomfirmed_order(isLogin['id'])
       return jsonify(data), 200
    elif(request.method == 'POST'):
        try:
            booking_info = request.get_json()
            load.cud_data('insert into trolley (attraction_id, user_id, price, date, time) values (%s, %s, %s, %s, %s)', (booking_info['attractionId'], booking_info['userId'], booking_info['price'], booking_info['date'], booking_info['time'] ))
            result = {
                'ok': True
            }
            return jsonify(result), 200
        except:
            result = {
                'error': True,
                'message': '資料尚未填入，資料庫出錯'
            }
            return jsonify(result), 400
    if(request.method == 'DELETE'):
        user_id = request.get_json()
        user_id = user_id['userId']
        try:
            delete_old_order(user_id)
            result = {
                'ok': True
            }
            return jsonify(result), 200
        except:
            result = {
                'error': True,
                'message': '刪除資料失敗'
            }
            print('刪除失敗')
            return jsonify(result), 500
