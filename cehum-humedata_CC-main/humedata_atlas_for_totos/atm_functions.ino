void get_atm_values(){
  bmp.begin(0x76);
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     /* Operating Mode. */
  Adafruit_BMP280::SAMPLING_X2,                     /* Temp. oversampling */
  Adafruit_BMP280::SAMPLING_X16,                    /* Pressure oversampling */
  Adafruit_BMP280::FILTER_X16,                      /* Filtering. */
  Adafruit_BMP280::STANDBY_MS_500);                 /* Standby time. */
  atm_pressure = bmp.readPressure()/1000;
  atm_temperature = bmp.readTemperature();
  
  //Serial.print("-- EXTERNAL PRESSURE: ");
  _data[8] = atm_pressure;
  // Serial.print("presure: ");
  // Serial.println(atm_pressure);
  
  
  // Serial.print("-- EXTERNAL TEMPERATURE: ");
  _data[9] = atm_temperature;
  // Serial.println(atm_temperature);


}

void set_real_time(){
  rtc.begin();
  if(! rtc.begin()){
  Serial.println("RTC not found");
  while(1);
  }
  rtc.adjust(DateTime(F(__DATE__),F(__TIME__)));
}

void get_real_time(){
  rtc.begin();
  DateTime now = rtc.now();
  _year = now.year();                                 // Se obtienen las variables de tiempo del RCT DS3231
  _month = now.month();
  _day = now.day();
  _hour = now.hour();
  _minutes = now.minute();
  _seconds = now.second();
  _data[22] = _year;                              //Se almacenan los datos en las variables para enviar por LORA
  _data[23] = _month;                        
  _data[24] = _day;
  _data[25] = _hour;
  _data[26] = _minutes;
  _data[27] = _seconds;
  delay(1000);
 }

void get_gps_data(){
  int total_cycle = time_cycle*60/5;
  cycle = 0;                                     
  Serial.println("GPS ON");                       //Se muestra en el monitor serial el estado del GPS
  Serial.println(total_cycle);
  on = 1;
  delay(500); 
  while (on == 1){
    float result = Serial1.available();    
    while(Serial1.available() > 0){   
      if((gps.encode(Serial1.read())) && (on == 1)  &&  (cycle<=total_cycle)){ //Condiciones para la lectura del GPS
        gps_latitude = gps.location.lat();           //Si se requiere un distinto tiempo de cold start modificar el numero de ciclo según la ec. 
        gps_longitude = gps.location.lng();           //ciclo=(min*60)/5
        Serial.println(cycle);                              
        delay(5000);                                         //Tiempo de duración del ciclo
        if(cycle<total_cycle){                                        //Actualizacion de ciclo actual
          cycle = cycle+1;
        }
        if(cycle==total_cycle){                                       // Se apaga el GPS
          Serial.println("GPS OFF");
          on = 0;   
          delay(500);     
        }
      }
    } 
  }
  
  _data[11] = gps_longitude;
  _data[10] = gps_latitude;

}
