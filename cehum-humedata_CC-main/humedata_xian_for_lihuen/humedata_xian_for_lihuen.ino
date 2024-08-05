/*  TITLE: CEHUM - HUMEDAT@ XI'AN
    AUTHOR: CHRISTIAN SANTIBÁÑEZ SOTO
    COMPANY: LEUFÜLAB
    DATE: 11/07/2022
    VERSION: 1.0 
    
    UPDATE 
    TITLE: CEHUM - HUMEDAT@ XI'AN
    AUTHOR: IAN ZAMORA GUERRA
    DATE: 05/04/2024
    */

    
#include "libs.h"

// Se declaran los tiempos de lectura y adquisición de GPS para el dispositivo
const int sleep_time = 25; 
const int gps_fix_time = 0;

void setup() 
{
  // Se inicia la comunicación Serial a través de USB para debugging
  Serial.begin(115200);
  // Se inicia la comunicación Serial con los módulos externos
  Serial1.begin(9600);
  // Se inicia el modulo RTC DS3231
  rtc.begin();
  //Se establece la fecha  y hora actual en el modulo RTC DS3231
  //set_real_time();            //Descomentar si se requiere actualizar la hora y volvera cargar comentandolo luego para que no haya una desincronización
  // Se declaran los pines, se inicia el módulo LoRaWAN, la tarjeta SD y los módulos I2C
  declare_pins();
  lorawan_begin();
  sd_begin();
  Wire.begin();
  Wire.setClock(100000); // Funcion necesaria para usar el arduino mkr wan 1310 en ves del 1300, ademas de seleccionar la placa como arduino mkr 1300 en ambos casos.
  delay(1000); //1seg
  // Se leen los valores internos y los atmosféricos 
  env_pressure();
  get_atm_values();
  // Se leen los valores de los sensores acuáticos
  delay(1000); //1seg
  read_xian_ec();
  delay(1000); //1seg
  read_xian_sensors();
  delay(1000); //1seg
  // Se obtiene el valor de tiempo real
  get_real_time();
  delay(1000); //1seg
  // Se establece el valor de la variable de reseteo del sistema
  _rday = day();
  // Se lee el valor de la bateria
  read_battery_level();
  //Se obtienen los datos del GPS
  get_gps_data();
  delay(1000);
  // Se almacenan los datos en la memoria SD y se envían a través de LoRaWAN
  store_sd_data();
  send_lorawan_data();
  LowPower.sleep((((sleep_time - gps_fix_time)*60)+10)*1000);
}

void loop() 
{
  delay(gps_fix_time*60*1000);
  // Se leen los valores internos y los atmosféricos 
  env_pressure();
  get_atm_values();
  // Se leen los valores de los sensores acuáticos
  delay(1000); //1seg
  read_xian_sensors();
  delay(1000); //1seg      
  read_xian_ec();
  delay(1000); //1seg
  // Se obtiene el valor de tiempo real
  get_real_time();
  delay(1000); //1seg
  // Se lee el valor de la bateria
  read_battery_level();
  // Se verifica las condiciones para el reset automatico del sistema
  if(_day != _rday){
    digitalWrite(RESET_SWITCH,HIGH);
  }
  // Se obtienen los datos del GPS
  get_gps_data();
  delay(1000); //1seg
  // Se almacenan los datos en la memoria SD y se envían a través de LoRaWAN
  store_sd_data();
  send_lorawan_data();
  //delay((sleep_time - gps_fix_time)*60*1000);
  LowPower.sleep((((sleep_time - gps_fix_time)*60)+10)*1000);
}