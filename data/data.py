import mysql.connector
import mysql.connector.pooling
import json

db_config = {
    'user': 'root',
    'host': 'localhost',
    'password': '1234',
    'database': 'taipei_attractions'
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name= 'my_pool', pool_size= 5, **db_config)

#function load_data
def crud_data(sql, params = ''):
    con = connection_pool.get_connection()
    try:
       cursor = con.cursor(dictionary = True)
       if(params == ''):
           cursor.execute(sql)
       else:
           cursor.execute(sql, (params))
           con.commit()
    except:
        print(params)
        print('插入資料失敗')
    finally:
        con.close()

# function load_data
def load_data (sql, params = ''):
    con = connection_pool.get_connection()
    cursor = con.cursor(dictionary = True)
    if(params == ''):
        cursor.execute(sql)
        result = cursor.fetchall()
    else:
        cursor.execute(sql, (params))
        result = cursor.fetchone()
        if(result == None):
            result = {
                'id': 0
            }
    con.close()

    return result

# Filter Images
def handle_images(str):
    img_url = []
    result = str.split('http')[1:]
    for url in result:
        if('jpg' or 'JPG' or 'png') in url.lower():
            url = 'http' + url
            img_url.append(url)
    return img_url
    

# Write in database
with open("taipei-attractions.json", mode = "r") as file:
    file = json.load(file)
    file = file['result']['results']
    mrt_list = []
    for attraction in file:
        mrt_list.append(attraction['MRT'])
    mrt_list = set(mrt_list)
    for mrt in mrt_list:
        if(mrt == None):
            crud_data("INSERT INTO mrt_list (id, mrt) VALUES (0, \'無\')")
            continue
        else:
            crud_data('insert into mrt_list (mrt) values (%s)', (mrt,))
    for attraction in file:
        mrt_id = load_data('select id from mrt_list where mrt = %s', (attraction['MRT'],))
        crud_data('insert into attractions_details (id, name, category, description, address, transport, lat, lng, mrt_id) values (%s, %s, %s, %s, %s, %s, %s, %s, %s)', (attraction['_id'], attraction['name'], attraction['CAT'], attraction['description'], attraction['address'], attraction['direction'], attraction['latitude'], attraction['longitude'], mrt_id['id'],))

        img_list = handle_images(attraction['file'])
        for img_url in img_list:
            crud_data('insert into images (attraction_id, img_url) values (%s, %s)', (attraction['_id'], img_url,))