from module import db_connection as db

def load_data(sql, params = '', data_count = 'various'):
    con = db.connection_pool.get_connection()
    # cursor = con.cursor(dictionary = True)
    if(params == ''):
        cursor = con.cursor(dictionary = True)
        cursor.execute(sql)
    else:
        cursor = con.cursor(dictionary = True)
        cursor.execute(sql, (params))
    if(data_count == 'various'):
        result = cursor.fetchall()
    elif(data_count == 'one'):
        result = cursor.fetchone()
        print(result)
    con.close()
    return result

def cud_data(sql, params):
    con = db.connection_pool.get_connection()
    cursor = con.cursor(dictionary = True)
    cursor.execute(sql, (params))
    con.commit()
    con.close()
    return
