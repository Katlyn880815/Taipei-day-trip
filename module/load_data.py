from module import db_connection as db
import mysql.connector

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
    try:
        cursor.execute(sql, (params))
        con.commit()
    except mysql.connector.Error as e:
        print(f"資料操作錯誤原因：{e}")
        con.rollback()
    finally:
        if(con.is_connected()):
            cursor.close()
            con.close()
    return
