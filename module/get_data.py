import mysql.connector
import mysql.connector.pooling

db_config = {
    'user': 'root',
    'host': 'localhost',
    'password': '1234',
    'database': 'taipei_attractions'
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name= 'my_pool', pool_size= 5, **db_config)

def load_data(sql, params = ''):
    con = connection_pool.get_connection()
    cursor = con.cursor(dictionary = True)
    if(params == ''):
        cursor.execute(sql)
    else:
        cursor.execute(sql, (params))
    result = cursor.fetchall()
    con.close()
    return result

#GETTING IMAGES URL OF EACH ATTRACTIONS
def get_images_url(attraction_id):
    result = load_data('select attractions_details.id, images.img_url from images inner join attractions_details on images.attraction_id = attractions_details.id where attraction_id = %s', (attraction_id,))
    return result

def handle_attractions_images(result):
    if(isinstance(result, list)):
        for item in result:
            item['images'] = []
            result_image_url = get_images_url(item['id'])
            for image_obj in result_image_url:
                item['images'].append(image_obj['img_url'])
    else:
        result['images'] = []
        result_image_url = get_images_url(result['id'])
        for image_obj in result_image_url:
            result['images'].append(image_obj['img_url'])
    return result


#GETTING ATTRACTIONS BY PAGES
def get_attractions(page):
    limit = 12
    offset = page * limit
    result = load_data('SELECT attractions_details.id, attractions_details.name, attractions_details.category, attractions_details.description, attractions_details.address, attractions_details.transport, attractions_details.lat, attractions_details.lng, mrt_list.mrt FROM attractions_details INNER JOIN mrt_list ON attractions_details.mrt_id = mrt_list.id ORDER BY attractions_details.id ASC LIMIT %s OFFSET %s', (limit, offset,))
    if(result == []):
        return {
            'error': True,
            'message': 'No more attractions'
        }
    else:
        result = handle_attractions_images(result)
        final_result = {
            'nextPage': page + 1 if offset + limit < 60 else None,
            'data': result
        }
    return final_result

#GETTING ATTRACTIONS BY KEYWORD
def get_attraction_by_keyword(keyword, page=0):
    keyword = '%' + keyword + '%'
    con = connection_pool.get_connection()
    cursor = con.cursor(dictionary=True)
    cursor.execute('select count(*) from attractions_details inner join mrt_list on attractions_details.mrt_id = mrt_list.id where attractions_details.name like %s or mrt_list.mrt like %s', (keyword, keyword,))
    count = cursor.fetchone()['count(*)']
    con.close()
    limit = 12
    offset = page * limit
    if count == 0:
        return {
            'error': True,
            'message': '找不到符合關鍵字的資料'
        }
    else:
        result = load_data('SELECT attractions_details.id, attractions_details.name, attractions_details.category, attractions_details.description, attractions_details.address, attractions_details.transport, attractions_details.lat, attractions_details.lng, mrt_list.mrt FROM attractions_details INNER JOIN mrt_list ON attractions_details.mrt_id = mrt_list.id WHERE attractions_details.name LIKE %s OR mrt_list.mrt LIKE %s ORDER BY attractions_details.id ASC LIMIT %s OFFSET %s', (keyword, keyword, limit, offset,))
        result = handle_attractions_images(result)
        if(result == []):
            return {
                'error': True,
                'message': '這個關鍵字已經沒有更多資料'
            }
        return {
            'nextPage': page + 1 if offset + limit < count else None,
            'data': result
        }
    
#GETTING ATTRACTIONS BY ID
def get_attraction_by_id(id):
    try:
        con = connection_pool.get_connection()
        cursor = con.cursor(dictionary = True)
        cursor.execute('SELECT attractions_details.id, attractions_details.name, attractions_details.category, attractions_details.description, attractions_details.address, attractions_details.transport, attractions_details.lat, attractions_details.lng, mrt_list.mrt FROM attractions_details INNER JOIN mrt_list ON attractions_details.mrt_id = mrt_list.id WHERE attractions_details.id = %s', (id,))
        result = cursor.fetchone()
        con.close()
    except:
        return {
            'error': True,
            'message': '資料獲取失敗，伺服器出錯'
        }
    if(result == None):
        return {
            'error': True,
            'message': '無此編碼，請重新輸入'
        }
    result = handle_attractions_images(result)
    return{
        'data': result
    }

#GETTING DATA OF ATTRACTIONS BY MRT
def get_attractions_by_mrt():
    try:
        result_mrts = load_data('select * from mrt_list')
        for mrt in result_mrts:
            count = load_data('select count(*) from attractions_details where mrt_id = %s', (mrt['id'],))
            count = count[0]['count(*)']
            mrt['count'] = count
        result_mrts = sorted(result_mrts, key = lambda x: x['count'], reverse= False)
        data = {
            'data': []
        }
        for item in result_mrts:
            if(item['mrt'] == '無'):
                continue
            data['data'].append(item['mrt'])
    except:
        data = {
            'error': True,
            'message': '資料獲取失敗，伺服器出錯'
        }
    finally:
        return data

