from flask import Blueprint, request, make_response
from module import get_data
import json

attractions = Blueprint('attractions', __name__)

def setting_response(result):
    result_json = json.dumps(result, ensure_ascii= False)
    response = make_response(result_json)
    response.headers['Content-Type'] = 'application/getjson; charset=utf-8'
    setting_status_code_for_error_client_side = ['找不到符合關鍵字的資料', '這個關鍵字已經沒有更多資料', '頁碼輸入錯誤，請輸入數字', 'No more attractions', '編號輸入錯誤，請輸入數字', '無此編碼，請重新輸入']
    try:
        error_message = result['message']
        for message in setting_status_code_for_error_client_side:
            if(error_message == message):
                response.status_code = 404
                return response
        response.status_code = 500
    except:
        response.status_code = 200
    finally:
        return response
        

@attractions.route('/attractions')
def handle_attractions_api():
    page = request.args.get('page', 0)
    keyword = request.args.get('keyword', None)
    try:
        page = int(page)
        if keyword is not None:
            result_attractions = get_data.get_attraction_by_keyword(keyword, page)
        else:
            result_attractions = get_data.get_attractions(page)
    except:
        result_attractions = {
            'error': True,
            'message': '頁碼輸入錯誤，請輸入數字'
        }
    response = setting_response(result_attractions)
    return response
    
@attractions.route('/attraction/<attractionId>')
def handle_attractions_api_by_id(attractionId):
    try:
        attractionId = int(attractionId)
    except:
        result = {
            'error': True,
            'message': '編號輸入錯誤，請輸入數字'
        }
        response = setting_response(result)
        return response
    result = get_data.get_attraction_by_id(attractionId)
    response = setting_response(result)
    return response

@attractions.route('/mrts')
def handle_attractions_api_mrt():
    result = get_data.get_attractions_by_mrt()
    response = setting_response(result)
    return response