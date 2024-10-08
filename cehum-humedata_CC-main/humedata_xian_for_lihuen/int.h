void env_pressure()
{
  ENV.begin();
  internal_pressure = ENV.readPressure();
  _data[7] = internal_pressure;
  internal_temperature = ENV.readTemperature();
  _data[12] = internal_temperature;

  internal_humidity = ENV.readHumidity();
  _data[13] = internal_humidity;

  ENV.end();
}

void read_battery_level()
{
  delay(1000);
  batt_analog = analogRead(A1); // batt_analog comes straight from the Analog to digital converter.
  batt_voltage = 0.01569447*batt_analog + 0.02719791;  // Empirical equation from experiment run in march 2023 by CC.  
  _data[14] = batt_voltage;
  _data[23] = batt_analog;
}

void write_to_sd(float data0, float data1,float data2,float data3,float data4,
                float data5, float data6, float data7, float data8, float data9,
                float data10, float data11, float data12, float data13, float data14,
                float data15, float data16, int data17, int data18, int data19,
                int data20, int data21, int data22, int data23) 
{
  SPI.begin();
  delay(100);
  SD.begin(SD_CS_PIN);
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
  dataFile.println(data23);              // Ultima variable guardada en el SD debe ir con un println para que el .csv no guarde de manera incorrecta los datos.
  
  dataFile.close();
  delay(1000);
  SPI.end();
}

// Función para transformar un número flotante en sus bytes componentes
void float2Bytes(float val,byte* bytes_array)
{
  union {
    float float_variable;
    byte temp_array[4];
  } u;
  u.float_variable = val;
  memcpy(bytes_array, u.temp_array, 4);
}

// Función para transformar un arreglo de bytes en su correspondiente número flotante
float bytes2Float(byte byte_0, byte byte_1, byte byte_2, byte byte_3)
{
  long x = (long)byte_3<<24|(long)byte_2<<16|byte_1<<8|byte_0;
  union
  {
    long y;
    float z;
  }data;
  data.y = x;
  return data.z;
}

void store_sd_data()
{
  Serial.println("FLOAT DATA:");
  Serial.print("[");
  for (int i = 0; i < _data_size ; i++) {
    Serial.print(_data[i]);
    if (i < _data_size -1) {
      Serial.print(", ");
    }
  }
  Serial.println("]");
  Serial.print(F("Result=")); Serial.println(result); // figure out why I'm getting values where thre is none
  

  write_to_sd(_data[0],_data[1],_data[2],_data[3],_data[4],_data[5],_data[6],_data[7],_data[8],
  _data[9],_data[10],_data[11],_data[12],_data[13],_data[14],_data[15],_data[16],_data[17],
  _data[18],_data[19],_data[20],_data[21],_data[22],_data[23]);
}

void send_lorawan_data()
{
  float2Bytes(gps_latitude,&gps_latitude_float_bytes[0]);
  float2Bytes(gps_longitude,&gps_longitude_float_bytes[0]);
  float2Bytes(tds,&tds_float_bytes[0]);
  
  //_data_lorawan[0]  = do_readings[11];                              // DO-LSB
  _data_lorawan[0]  = do_readings[12];                              // DO 
  _data_lorawan[1]  = do_readings[13];                              // DO 
  _data_lorawan[2]  = do_readings[14];                              // DO-MSB
    
  _data_lorawan[3]  = uint8_t  ((_data[1]) * 255/14.0);              // pH   
                       
  //_data_lorawan[4]  =   ec_readings[3];                             // Electrical Conductivity-LSB
  _data_lorawan[4]  =   ec_readings[4];                             // Electrical Conductivity
  _data_lorawan[5]  =   ec_readings[5];                             // Electrical Conductivity
  _data_lorawan[6]  =   ec_readings[6];                             // Electrical Conductivity-MSB
  
  //_data_lorawan[9]   =   tds_float_bytes[0];                      // Total Dissolved Solids-LSB 
  _data_lorawan[7]  =   tds_float_bytes[1];                        // Total Dissolved Solids    
  _data_lorawan[8]  =   tds_float_bytes[2];                        // Total Dissolved Solids    
  _data_lorawan[9]  =   tds_float_bytes[3];                        // Total Dissolved Solids-MSB  
   
  _data_lorawan[10]  = uint8_t  (_data[4]  * 255/42.0);             // Salinity  
     
  _data_lorawan[11]  = uint8_t  ((_data[5] - 1) * 255/0.3);         // Relative Density   
   
  _data_lorawan[12]  = uint8_t  (_data[6]  * 255/60.0);             // Water Temperature 
  
  _data_lorawan[13]  = uint8_t  ((_data[7] - 85) * 255/60);      // Internal Pressure
    
  _data_lorawan[14]  = uint8_t  ((_data[8] - 85) * 255/19);      // Atmospheric Pressure 
   
  _data_lorawan[15]  = uint8_t  ((_data[9] + 20) * 255/80.0);       // Atmospheric Temperature   
  
  _data_lorawan[16] =   gps_longitude_float_bytes[0];               // GPS Longitude-LSB    
  _data_lorawan[17] =   gps_longitude_float_bytes[1];               // GPS Longitude  
  _data_lorawan[18] =   gps_longitude_float_bytes[2];               // GPS Longitude   
  _data_lorawan[19] =   gps_longitude_float_bytes[3];               // GPS Longitude-MSB
  
  _data_lorawan[20] =   gps_latitude_float_bytes[0];                // GPS Latitude-LSB
  _data_lorawan[21] =   gps_latitude_float_bytes[1];                // GPS Latitude 
  _data_lorawan[22] =   gps_latitude_float_bytes[2];                // GPS Latitude 
  _data_lorawan[23] =   gps_latitude_float_bytes[3];                // GPS Latitude-MSB
 
  _data_lorawan[24] = uint8_t  ((_data[12] + 20) * 255/80.0);       // Internal Temperature
  
  _data_lorawan[25] = uint8_t  (_data[13] * 255/120.0);             // Internal Humidity 
  
  _data_lorawan[26] = uint8_t  (batt_voltage * 255/15.0);           // Battery voltage
  
  //_data_lorawan[30] =   orp_readings[3];                            // ORP-LSB
  //_data_lorawan[31] =   orp_readings[4];                            // ORP
  _data_lorawan[27] =   orp_readings[5];                            // ORP
  _data_lorawan[28] =   orp_readings[6];                            // ORP-MSB
  
  _data_lorawan[29] = uint8_t (sat_f * 255/150);                    // SAT

  _data_lorawan[44] = uint8_t (_data[17]-2000);             // Year
  _data_lorawan[45] = uint8_t (_data[18]);                  // Month
  _data_lorawan[46] = uint8_t (_data[19]);                  // Day

  _data_lorawan[47] = uint8_t (_data[20]);                  // Hour
  _data_lorawan[48] = uint8_t (_data[21]);                  // Minutes
  _data_lorawan[49] = uint8_t (_data[22]);                  // Seconds
  
  Serial.println("LORAWAN HEX DATA: ");
  
  for(int a = 0; a < sizeof(_data_lorawan); a++)
  {
    Serial.print("0x");
    Serial.print(_data_lorawan[a], HEX);
    Serial.print(" ");
  }

  Serial.println();

  int err;
  modem.beginPacket();
  modem.write(_data_lorawan[0]);
  modem.write(_data_lorawan[1]);
  modem.write(_data_lorawan[2]);
  modem.write(_data_lorawan[3]);
  modem.write(_data_lorawan[4]);
  modem.write(_data_lorawan[5]);
  modem.write(_data_lorawan[6]);
  modem.write(_data_lorawan[7]);
  modem.write(_data_lorawan[8]);
  modem.write(_data_lorawan[9]);
  modem.write(_data_lorawan[10]);
  modem.write(_data_lorawan[11]);
  modem.write(_data_lorawan[12]);
  modem.write(_data_lorawan[13]);
  modem.write(_data_lorawan[14]);
  modem.write(_data_lorawan[15]);
  modem.write(_data_lorawan[16]);
  modem.write(_data_lorawan[17]);
  modem.write(_data_lorawan[18]);
  modem.write(_data_lorawan[19]);
  modem.write(_data_lorawan[20]);
  modem.write(_data_lorawan[21]);
  modem.write(_data_lorawan[22]);
  modem.write(_data_lorawan[23]);
  modem.write(_data_lorawan[24]);
  modem.write(_data_lorawan[25]);
  modem.write(_data_lorawan[26]);
  modem.write(_data_lorawan[27]);
  modem.write(_data_lorawan[28]);
  modem.write(_data_lorawan[29]);
  modem.write(_data_lorawan[30]);
  modem.write(_data_lorawan[31]);
  modem.write(_data_lorawan[32]);
  modem.write(_data_lorawan[33]);
  modem.write(_data_lorawan[34]);
  modem.write(_data_lorawan[35]);
  modem.write(_data_lorawan[36]);
  modem.write(_data_lorawan[37]);
  modem.write(_data_lorawan[38]);
  modem.write(_data_lorawan[39]);
  modem.write(_data_lorawan[40]);
  modem.write(_data_lorawan[41]);
  modem.write(_data_lorawan[42]);
  modem.write(_data_lorawan[43]);
  modem.write(_data_lorawan[44]);
  modem.write(_data_lorawan[45]);
  modem.write(_data_lorawan[46]);
  modem.write(_data_lorawan[47]);
  modem.write(_data_lorawan[48]);
  modem.write(_data_lorawan[49]);
  modem.write(_data_lorawan[50]);  
  
  err = modem.endPacket(true);

  if (err > 0) {
    Serial.println("-- MENSAJE ENVIADO CORRECTAMENTE A TRAVÉS DE LORAWAN --");
  } else {
    Serial.println("-- ERROR ENVIANDO EL MENSAJE A TRAVÉS DE LORAWAN --");
  }
}

void lorawan_begin()
{
  // Se inicia el módulo LoRaWAN con el estándar de Australia y 915 MHz
  if (!modem.begin(AU915)) {
    Serial.println("-- NO SE HA PODIDO INICIAR EL MÓDULO LORAWAN --");
    while (1) {}
  };
  
  Serial.print("-- LA VERSIÓN DE TU MÓDULO ES: ");
  Serial.print(modem.version());
  Serial.println(" --");
  
  Serial.print("-- EL EUI DE TU DISPOSITIVO ES: ");
  Serial.print(modem.deviceEUI());
  Serial.println(" --");

  // Esta línea de código establece las frecuencias utilizadas por TTN y descarta las que no usa TTN
  Serial.println(modem.sendMask("ff000001f000ffff00020000"));
  // Se conecta el módulo LoRaWAN a la red a través de OTAA (Over the air activation)
  int connected = modem.joinOTAA(appEui, appKey);

  Serial.print("-- CONNECTED STATUS: ");
  Serial.print(connected);
  Serial.println(" --");
}

void sd_begin()
{
  SPI.begin();
  delay(100);
  SD.begin(SD_CS_PIN);
  dataFile = SD.open("log-0000.csv", FILE_WRITE);
  delay(1000);
  // Se almacena la cabecera de los datos a almacenar (colnames, column names)
  dataFile.println("DissolvedOxygen,pH,ElectricalConductivity,TotalDissolvedSolids,Salinity,RelativeDensity,WaterTemperature,InternalPressure,AtmosphericPressure,AtmosphericTemperature,Latitude,Longitude,InternalTemperature,InternalHumidity,Batt_Voltage,ORP,Saturation,Year,Month,Day,Hour,Minutes,Seconds, Batt_analog");
  dataFile.close();
  delay(100);
  SPI.end();
}
