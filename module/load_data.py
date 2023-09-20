from module import db_connection as db

def load_data(sql, params = '', data_count = 'various'):
    con = db.connection_pool.get_connection()
    cursor = con.cursor(dictionary = True)
    if(params == ''):
        cursor.execute(sql)
    else:
        cursor.execute(sql, (params))
    if(data_count == 'various'):
        result = cursor.fetchall()
    else:
        result = cursor.fetchone()
    con.close()
    return result

def insert_data(sql, params):
    con = db.connection_pool.get_connection()
    cursor = con.cursor(dictionary = True)
    cursor.execute(sql, (params))
    con.commit()
    con.close()
    return
