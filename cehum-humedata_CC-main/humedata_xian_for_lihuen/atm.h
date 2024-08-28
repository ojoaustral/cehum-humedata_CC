void get_atm_values(){
  // Se cambia la dirección por defecto del BMP280 (0x77) por (0x76)
  bmp.begin(0x76);
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,   
  Adafruit_BMP280::SAMPLING_X2,                    
  Adafruit_BMP280::SAMPLING_X16,                    
  Adafruit_BMP280::FILTER_X16,                    
  Adafruit_BMP280::STANDBY_MS_500);               
  atm_pressure = bmp.readPressure()/1000;   // Se obtiene la presión atmosférica
  atm_temperature = bmp.readTemperature();  // Se obtiene la temperatura atmosférica
  
  _data[8] = atm_pressure;                  //Se almacenan los datos en atmosféricos
  _data[9] = atm_temperature;
}

void set_real_time(){                       // Esta función establece el tiempo del computador al modulo RTC
  if(! rtc.begin()){
    Serial.println("RTC not found");        // Confirmacion de comuncicacion con el RTC
  while(1);
  }
  rtc.adjust(DateTime(__DATE__,__TIME__));
}

void get_real_time(){
  DateTime now = rtc.now();
  _year = now.year();                             // Se obtienen las variables de tiempo del RCT DS3231
  _month = now.month();
  _day = now.day();
  _hour = now.hour();
  _minutes = now.minute();
  _seconds = now.second();
  _data[17] = _year;                              //Se almacenan los datos en las variables para enviar por LORA
  _data[18] = _month;                        
  _data[19] = _day;
  _data[20] = _hour;
  _data[21] = _minutes;
  _data[22] = _seconds;
}


void get_gps_data(){
  int total_cycle = time_cycle*60/5;
  cycle = 0;                                      //Variable de número de muestras de posicion del GPS 
  digitalWrite(XIAN_SWITCH, LOW);                 // Se apagan los sensores Xi'An y se enciende el GPS
  digitalWrite(RS485_SWITCH, LOW);
  digitalWrite(EC_SWITCH, LOW);
  digitalWrite(GPS_SWITCH, HIGH);
  digitalWrite(GPS_MOSFET, HIGH);
  Serial.println("GPS ON");                       //Se muestra en el monitor serial el estado del GPS
  on = 1;
  delay(2000); 
  while (on == 1){
    while(Serial1.available() > 0){
      result = Serial1.available();        
      if((gps.encode(Serial1.read())) && (digitalRead(GPS_MOSFET) == HIGH)  &&  (cycle<=total_cycle)){ //Condiciones para la lectura del GPS
        gps_latitude = gps.location.lat();           //Si se requiere un distinto tiempo de cold start modificar el numero de ciclo según la ec. 
        gps_longitude = gps.location.lng();           //ciclo=(min*60)/5                                                
        delay(5000);                                                                        //Tiempo de duración de cada ciclo
        if(cycle<total_cycle){                                                              //Actualizacion de ciclo actual
          cycle=cycle+1;
        }
        if(cycle==total_cycle){                                                             // Se apaga el GPS luego de llegar al ultimo ciclo
          digitalWrite(GPS_MOSFET,LOW);
          digitalWrite(GPS_SWITCH, LOW);
          Serial.println("GPS OFF");
          on = 0;   
          delay(500);     
        }
      }
    } 
  }
  
  _data[11] = gps_longitude;
  _data[10] = gps_latitude;
  digitalWrite(GPS_MOSFET,LOW);
  digitalWrite(GPS_SWITCH, LOW);
  delay(2000);
}