import MySQLdb

try:
    # 2026: real password removed; value kept in credentials/Humedata_credentials_private.env (MYSQL_ROOT_PASSWORD)
    db = MySQLdb.connect('127.0.0.1','root','<MYSQL_ROOT_PASSWORD>','mqtt')
    print('Conectado')
except:
    print('Error')

new_id = input("Ingrese el nuevo dev_eui del humedata: ")

try:
    query = """INSERT INTO `Humedata_devices` (`dev_eui`) VALUES (%s);""" 
    cursor = db.cursor()
    cursor.execute(query, (new_id,))
    db.commit()
    print("Dispositivo agregado correctamente")
    cursor2 = db.cursor()
    query2 = """SELECT `id` FROM `Humedata_devices` WHERE `dev_eui` = %s"""
    cursor2.execute(query2, (new_id,))
    data = cursor2.fetchone()
    id = data[0]
    print("La id para el dispositivo agregado es ", id)
except:
    db.rollback()
    print("Error al agregar dispositivo")
