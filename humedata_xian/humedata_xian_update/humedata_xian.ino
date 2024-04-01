/*  TITLE: CEHUM - HUMEDAT@ XI'AN
    AUTHOR: CHRISTIAN SANTIBÁÑEZ SOTO
    COMPANY: LEUFÜLAB
    DATE: 11/07/2022
    VERSION: 1.0 */
    
#include "libs.h"

// Se declaran los tiempos de lectura y adquisición de GPS para el dispositivo
const int sleep_time = 1; 
const int gps_fix_time = 0;

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
  
  delay(500);

  digitalWrite(GPS_SWITCH, HIGH);
  get_gps_data();
  delay(500);
  
  //Se establece la fecha  y hora actual en el modulo RTC DS3231 
  set_real_time();
  
  //Se obtiene el valor de tiempo real
  get_real_time();
  delay(500);

  // Se leen los valores internos y los atmosféricos 
  env_pressure();
  get_atm_values();
  read_battery_level();
  // Se leen los valores de los sensores acuáticos
  delay(500);
  read_xian_ec();
  delay(500);
  read_xian_sensors();
  delay(500);
  // Se almacenan los datos en la memoria SD y se envían a través de LoRaWAN
  store_sd_data();
  send_lorawan_data();
  //delay((sleep_time - gps_fix_time)*60*1000);
  LowPower.sleep((sleep_time - gps_fix_time)*60*1000);
}

void loop() 
{
  digitalWrite(GPS_SWITCH, HIGH);
  delay(gps_fix_time*60*1000);

  //Se obtiene el valor de tiempo real 
  get_real_time();
  delay(500);
  //Se obtienen los datos del GPS
  get_gps_data();
  delay(500);
  // Se leen los valores internos y los atmosféricos 
  env_pressure();
  get_atm_values();
  read_battery_level();
  // Se leen los valores de los sensores acuáticos
  delay(500);
  read_xian_sensors();
  delay(500);
  read_xian_ec();
  delay(500);
  // Se almacenan los datos en la memoria SD y se envían a través de LoRaWAN
  store_sd_data();
  send_lorawan_data();
  //delay((sleep_time - gps_fix_time)*60*1000);
  LowPower.sleep((sleep_time - gps_fix_time)*60*1000);
}