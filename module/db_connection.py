import mysql.connector
import mysql.connector.pooling

db_config = {
    'user': 'root',
    'host': 'localhost',
    'password': '1234',
    'database': 'taipei_attractions'
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name= 'my_pool', pool_size= 5, **db_config)