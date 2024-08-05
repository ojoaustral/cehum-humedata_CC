void env_pressure(){
  ENV.begin();
  internal_pressure = ENV.readPressure();
  _data[7] = internal_pressure;

  internal_temperature = ENV.readTemperature();
  _data[12] = internal_temperature;

  internal_humidity = ENV.readHumidity();
  _data[13] = internal_humidity;

  ENV.end();
}

// Calculate Volts from empirical eq. derived from expe. in march 2023, CC.
void read_battery_level(){
  batt_analog = analogRead(A1);
  batt_voltage = -38336.9243*exp(-0.0139*batt_analog)+13.0683;  
  _data[14] = batt_analog;
  _data[28] = batt_voltage; 
}

void write_to_sd(float data0, float data1,float data2,float data3,float data4, float data5, float data6, float data7, float data8, float data9, 
                  float data10, float data11, float data12, float data13, float data14, float data15, float data16, float data17, float data18, float data19,
                  float data20, float data21, int data22, int data23, int data24, int data25, int data26, int data27, float data28) 
  {
  SPI.begin();
  delay(100);
  SD.begin(sd_cs_pin);
  dataFile = SD.open("log-0000.csv", FILE_WRITE);
  delay(1000);
  
  dataFile.print(data0);
  dataFile.print(",");
  dataFile.print(data1);
  dataFile.print(",");
  dataFile.print(data2);
  dataFile.print(",");
  dataFile.print(data3);
  dataFile.print(",");
  dataFile.print(data4);
  dataFile.print(",");
  dataFile.print(data5);
  dataFile.print(",");
  dataFile.print(data6);
  dataFile.print(",");
  dataFile.print(data7);
  dataFile.print(",");
  dataFile.print(data8);
  dataFile.print(",");
  dataFile.print(data9);
  dataFile.print(",");
  dataFile.print(data10);
  dataFile.print(",");
  dataFile.print(data11);
  dataFile.print(",");
  dataFile.print(data12);
  dataFile.print(",");
  dataFile.print(data13);
  dataFile.print(",");
  dataFile.print(data14);
  dataFile.print(",");
  dataFile.print(data15);
  dataFile.print(",");
  dataFile.print(data16);
  dataFile.print(",");
  dataFile.print(data17);
  dataFile.print(",");
  dataFile.print(data18);
  dataFile.print(",");
  dataFile.print(data19);
  dataFile.print(",");
  dataFile.print(data20);
  dataFile.print(",");
  dataFile.print(data21);
  dataFile.print(",");
  dataFile.print(data22);
  dataFile.print(",");
  dataFile.print(data23);
  dataFile.print(",");
  dataFile.print(data24);
  dataFile.print(",");
  dataFile.print(data25);
  dataFile.print(",");
  dataFile.print(data26);
  dataFile.print(",");
  dataFile.print(data27);
  dataFile.print(",");
  dataFile.println(data28);

  
  dataFile.close();
  delay(1000);
  SPI.end();
}

void sleep_sensors(int address){
  Wire.begin();
  Wire.beginTransmission(address);
  Wire.write("sleep");
  Wire.endTransmission();
}
