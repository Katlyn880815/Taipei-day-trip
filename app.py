from flask import *
from module import get_data
import json
app=Flask(__name__)

app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")


############ API #################
@app.route('/api/attractions')
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
    response = make_response(json.dumps(result_attractions, ensure_ascii=False))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    try:
        error = result_attractions['error']
        if(result_attractions['message'] == '找不到符合關鍵字的資料' or result_attractions['message'] == '這個關鍵字已經沒有更多資料' or result_attractions['message'] == '頁碼輸入錯誤，請輸入數字'):
            response.status_code = 404
        else:
            response.status_code = 500
    except:
        response.status_code = 200
    finally:
        return response

@app.route('/api/attraction/<attractionId>')
def handle_attractions_api_by_id(attractionId):
    try:
        attractionId = int(attractionId)
    except:
        response = make_response(json.dumps({
             'error': True,
             'message': '編號輸入錯誤，請輸入數字'
		}, ensure_ascii=False))
        response.status_code = 400
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response
    result = get_data.get_attraction_by_id(attractionId)
    response = make_response(json.dumps(result, ensure_ascii=False))
    try:
        error = result['error']
        if(result['message'] == '無此編碼，請重新輸入'):
             response.status_code = 404
        else:
            response.status_code = 500
    except:
        response.status_code = 200
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response

@app.route('/api/mrts')
def handle_attractions_api_mrt():
    result = get_data.get_attractions_by_mrt()
    response = make_response(json.dumps(result, ensure_ascii=False))
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    try:
        error = result['error']
        response.status_code = 500
    except:
        response.status_code = 200
    finally:
        return response


app.run(host="0.0.0.0", port=3000)