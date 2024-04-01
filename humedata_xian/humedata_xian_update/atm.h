
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
  _data[17]=_year;
  _data[18]=_month;
  _data[19]=_day;
  _data[20]=_hour;
  _data[21]=_minutes;
  _data[22]=_seconds;
  delay(1000);
}

void get_gps_data(){
  // Se apagan los sensores Xi'An y se enciende el GPS
  digitalWrite(XIAN_SWITCH, LOW);
  digitalWrite(RS485_SWITCH, LOW);
  digitalWrite(EC_SWITCH, LOW);
  digitalWrite(GPS_SWITCH, HIGH);
  while(Serial1.available() > 0){
       result = Serial1.available(); // figure out why I'm getting values where thre is none 
           
    if(gps.encode(Serial1.read())){
      //if (gps.time.isUpdated()){ // figure out why I'm getting values where thre is none
      gps_latitude = gps.location.lat();
      gps_longitude = gps.location.lng();
      delay(1000);
    //  }
    }
  }
  _data[11] = gps_longitude;
  _data[10] = gps_latitude;
  // Se apaga el GPS
  digitalWrite(GPS_SWITCH, LOW);
}