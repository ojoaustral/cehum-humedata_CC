import MySQLdb

try:
    # 2026: real password removed; value kept in credentials/Humedata_credentials_private.env (MYSQL_ROOT_PASSWORD)
    db = MySQLdb.connect('127.0.0.1','root','<MYSQL_ROOT_PASSWORD>','mqtt')
    print('Conectado')
except:
    print('Error')
    
query = """SELECT id FROM Humedata_devices WHERE dev_eui = 'A8610A3237267200'"""
cursor = db.cursor()
cursor.execute(query)
data = cursor.fetchone()
data2 = data[0]
print(data2)
