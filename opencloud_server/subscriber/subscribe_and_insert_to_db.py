#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import paho.mqtt.client as mqtt
import sys
import MySQLdb
import json


#Check arguments
if len(sys.argv) != 2:
    print(f'USO: {sys.argv[0]} humedata-xxxx, algunas posibles opciones: atlas,bp,xian')
    sys.exit()

#Posibles valores: humedata-atlas -- humedata-bp --humedata-xian    
boya = sys.argv[1]

# Abrir conexión con bases de datos, cambiar valores de db segun corresponda
try:
    f = open("/home/log_in", 'r')
    line = f.readline()
    db_inf = line.strip().split(',')
    f.close()
    db = MySQLdb.connect(db_inf[0],db_inf[1],db_inf[2],db_inf[3])
except:
    print("No se pudo conectar con la base de datos")
    print("Cerrando...")
    sys.exit()

# Preparando cursor
cursor = db.cursor()
cursor2 = db.cursor()   

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    print("Conectado - Codigo de resultado: "+str(rc))

    # Subscribing in on_connect() means that if we lose the connection and
    # reconnect then subscriptions will be renewed.
    client.subscribe("v3/cehum-humedata@ttn/devices/{}/up".format(boya))

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
#    print(msg.topic+" "+str(msg.payload))
#    print(msg.topic)
    response = json.loads(msg.payload.decode("utf-8"))
    dev_eui = response['end_device_ids']['dev_eui']
    response = response['uplink_message']['decoded_payload']
    print(response)
    print(dev_eui)
    lista = msg.topic.split("/")

    #sql = """INSERT INTO `mqtt`.`logs` (`ap`, `at`, `bl`, `do`, `ec`, `ih`, `ip`, `it`, `lat`, `long`, `orp`, `ph`, `rd`, `sal`, `tds`, `wt`) VALUES (""" + response['ap'] + """, """ + response['at'] + """, """ + response['bl'] + """, """ + response['do'] + """, """ + response['ec'] + """, """ + response['ih'] + """, """ + response['ip'] + """, """ + response['it'] + """, """ + response['lat'] + """, """ + response['lon'] + """, """ + response['orp'] + """, """ + response['ph'] + """, """ + response['rd'] + """, """ + response['sal'] + """, """ + response['tds'] + """, """ + response['wt'] + """);"""
    query = """SELECT id FROM Humedata_devices WHERE dev_eui = %s"""
    cursor2.execute(query, (dev_eui,))
    data2 = cursor2.fetchone()
    data3 = data2[0]
    
    
    sql = """INSERT INTO `mqtt`.`logs` (`atmospheric_pressure`, `atmospheric_temperature`, `battery_level`, `dissolved_oxygen`, `electrical_conductivity`, `internal_humidity`, `internal_pressure`, `internal_temperature`, `latitude`, `longitude`, `oxide_reduction_potential`, `ph`, `relative_density`, `salinity`, `total_dissolved_solids`, `water_temperature`, `dev_id`, `do_15`, `do_temp`, `ec_temp`, `sat_temp`, `sat`, `ph_temp`) VALUES (""" + str(response['ap']) + """, """ + str(response['at']) + """, """ + str(response['bl']) + """, """ + str(response['do']) + """, """ + str(response['ec']) + """, """ + str(response['ih']) + """, """ + str(response['ip']) + """, """ + str(response['it']) + """, """ + str(response['lat']) + """, """ + str(response['lon']) + """, """ + str(response['orp']) + """, """ + str(response['ph']) + """, """ + str(response['rd']) + """, """ + str(response['sal']) + """, """ + str(response['tds']) + """, """ + str(response['wt']) + """, """ + str(data3) + """, """ + str(response['do15']) + """, """ + str(response['do_temp']) + """, """ + str(response['ec_temp']) + """, """ + str(response['sat_temp']) + """, """ + str(response['sat']) + """, """ + str(response['ph_temp']) + """);"""

    try:
        # Ejecutar un comando SQL
        cursor.execute(sql)
        db.commit()
        print("Guardando en base de datos...OK")
    except:
        db.rollback()
        print("Guardando en base de datos...Falló")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# 2026: real TTN API key removed (was public, must be revoked); value kept in credentials/ (TTN_API_KEY)
client.username_pw_set("cehum-humedata@ttn", "<TTN_API_KEY>")
try:
    client.connect("au1.cloud.thethings.network", 1883, 60)
except:
    print("No se pudo conectar con el MQTT Broker...")
    print("Cerrando...")
    db.close()
    sys.exit()   
    

try:
    client.loop_forever()
except KeyboardInterrupt:  #precionar Crtl + C para salir
    print("Cerrando...")
    db.close()
