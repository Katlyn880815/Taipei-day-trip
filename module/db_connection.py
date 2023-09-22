import mysql.connector
import mysql.connector.pooling
import os
from dotenv import load_dotenv, dotenv_values

config = dotenv_values('.env')
print(config['DATABASE_KEY'])

db_config = {
    'user': 'root',
    'host': 'localhost',
    'password': '1234',
    'database': 'taipei_attractions'
}

connection_pool = mysql.connector.pooling.MySQLConnectionPool(pool_name= 'my_pool', pool_size= 5, **db_config)