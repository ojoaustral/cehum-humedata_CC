void get_atm_values(){
  // Se cambia la dirección por defecto del BMP280 (0x77) por (0x76)
  bmp.begin(0x76);
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,   
  Adafruit_BMP280::SAMPLING_X2,                    
  Adafruit_BMP280::SAMPLING_X16,                    
  Adafruit_BMP280::FILTER_X16,                    
  Adafruit_BMP280::STANDBY_MS_500);               
  atm_pressure = bmp.readPressure()/1000;
  atm_temperature = bmp.readTemperature();
  
  _data[8] = atm_pressure;  
  _data[9] = atm_temperature;
}

void set_real_time(){

  myRTC.begin();                                    // Se activa el modulo RTC DS3231
  setSyncProvider(myRTC.get);                       // Se establece el tiempo actual en el RCT DS3231
  if(timeStatus() != timeSet)                         
    Serial.println("Unable to sync with the RTC");
  else
    Serial.println("RTC has set the system time");
}
void get_real_time(){
  _year = year();                                 // Se obtienen las variables de tiempo del RCT DS3231
  _month = month();
  _day = day();
  _hour = hour();
  _minutes = minute();
  _seconds = second();
  _data[17] = _year;                              //Se almacenan los datos en las variables para enviar por LORA
  _data[18] = _month;                        
  _data[19] = _day;
  _data[20] = _hour;
  _data[21] = _minutes;
  _data[22] = _seconds;
  delay(1000);
}

void get_gps_data(){
  ciclo = 0;                                        //Variable de número de muestras de posicion del GPS 
  digitalWrite(XIAN_SWITCH, LOW);                 // Se apagan los sensores Xi'An y se enciende el GPS
  digitalWrite(RS485_SWITCH, LOW);
  digitalWrite(EC_SWITCH, LOW);
  digitalWrite(GPS_MOSFET, HIGH);
  Serial.println("GPS ON");                       //Se muestra en el monitor serial el estado del GPS
  on = 1;
  delay(2000); 
  if (on == 1){
    while(Serial1.available() > 0){
      result = Serial1.available();        
      if((gps.encode(Serial1.read())) && (digitalRead(GPS_MOSFET) == HIGH)  &&  (ciclo<=49)){ //Condiciones para la lectura del GPS
        gps_latitude = gps.location.lat();           //Si se requiere un distinto tiempo de cold start modificar el numero de ciclo según la ec. 
        gps_longitude = gps.location.lng();           //ciclo=((min*60)/5)+1                                                
        //Serial.print("Ciclo: "); Serial.println(ciclo);
        // Serial.print("Lon: "); Serial.println(gps_longitude);
        // Serial.print("Lat: "); Serial.println(gps_latitude);
        delay(5000);                                                                        //Tiempo de duración del ciclo
        if(ciclo<48){                                                                       //Actualizacion de ciclo actual
          ciclo=ciclo+1;
        }
        if(ciclo==48){                                                                      // Se apaga el GPS
          digitalWrite(GPS_MOSFET,LOW);
          Serial.println("GPS OFF");
          on = 0;
        }
      }
    } 
  }
  _data[11] = gps_longitude;
  _data[10] = gps_latitude;
  digitalWrite(GPS_MOSFET,LOW);
  on = 0;
  delay(2000);
}