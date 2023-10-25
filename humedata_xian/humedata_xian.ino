/*  TITLE: CEHUM - HUMEDAT@ XI'AN
    AUTHOR: CHRISTIAN SANTIBÁÑEZ SOTO
    COMPANY: LEUFÜLAB
    DATE: 11/07/2022
    VERSION: 1.0 */
    
#include "libs.h"

// Se declaran los tiempos de lectura y adquisición de GPS para el dispositivo
const int sleep_time = 5; 
const int gps_first_fix_time = 10;
const int gps_fix_time = 2;

void setup() 
{
  // Se inicia la comunicación Serial a través de USB para debugging
  Serial.begin(115200);
  // Se inicia la comunicación Serial con los módulos externos
  Serial1.begin(9600);
  // Se declaran los pines, se inicia el módulo LoRaWAN, la tarjeta SD y los módulos I2C
  declare_pins();
  lorawan_begin();
  sd_begin();
  Wire.begin();
  delay(1000);

  // Se leen los valores internos y los atmosféricos 
  env_pressure();
  get_atm_values();
  read_battery_level();
  // Se leen los valores de los sensores acuáticos
  delay(1000);
  read_xian_ec();
  delay(1000);
  read_xian_sensors();
  delay(1000);
  digitalWrite(GPS_SWITCH, HIGH);
  delay(gps_first_fix_time*60*1000);
  get_gps_data();
  // Se almacenan los datos en la memoria SD y se envían a través de LoRaWAN
  store_sd_data();
  send_lorawan_data();
  LowPower.sleep((sleep_time - gps_fix_time)*60*1000);
}

void loop() 
{
  // Se leen los valores internos y los atmosféricos 
  env_pressure();
  get_atm_values();
  read_battery_level();
  // Se leen los valores de los sensores acuáticos
  delay(1000);
  read_xian_sensors();
  delay(1000);
  read_xian_ec();
  digitalWrite(GPS_SWITCH, HIGH);
  delay(gps_fix_time*60*1000);
  // HERE, experimentally silenced line below
  // LowPower.sleep(gps_fix_time*60*1000); // later test if GPS accisition still works with this on
  get_gps_data();
  // Se almacenan los datos en la memoria SD y se envían a través de LoRaWAN
  store_sd_data();
  send_lorawan_data();
  LowPower.sleep((sleep_time - gps_fix_time)*60*1000);
}
