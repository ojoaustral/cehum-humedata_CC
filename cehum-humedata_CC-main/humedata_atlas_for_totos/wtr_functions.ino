//Función de lectura del sensor de Oxigeno Disuelto
void do_wire_transmission(){
  Wire.beginTransmission(do_address);   //Se inicia la comunicación I2C con el sensor de DO
  Wire.write("r");                      //Se escribe en I2C el comando de lectura
  Wire.endTransmission();               //Se termina la comunicación I2C y se envia el comando de lectura al sensor
  delay(do_time);                       //Se espera la respuesta del sensor
  Wire.requestFrom(do_address, 20, 1);  //Se solicitan 20 bytes al sensor y se envia un byte de parada
  do_code = Wire.read();                //Se lee el primer byte, que muestra el codigo de estado
  while(Wire.available()){              //Se lee continuamente los bytes enviados por el sensor  
    do_in_char = Wire.read();           //Se lee byte por byte la informacion enviada por sensor
    do_data[do_i] = do_in_char;         //Se guarda el byte leido en un arreglo
    do_i++;                             //Variable de incremento del arreglo
    if(do_in_char == 0){                //Se comprueba el byte nulo de termino de mensaje
      do_i = 0;                         //Se resetea el valor de la variable de incremento
      break;                            //Se sale del ciclo "While"
    }
  }
  do_i = 0;                             //Se resetea el valor de la variable de incremento  

  DO = strtok(do_data, ",");            //Se extrae el valor del DO como string 
  sat = strtok(NULL, ",");              //Se extrae el valor de Saturación como string

  _data[0] = (float)atof(DO);           //Se almacena el valor en float de DO en la posición "0" del arreglo
  _data[16] = (float)atof(sat);         //Se almacena el valor en float de Saturación en la posición "16" del arreglo 
}
//Función de lectura del sensor de Oxigeno Disuelto con compensación de temperatura
void do_temp_wire_transmission(){
  Wire.beginTransmission(do_address);   //Se inicia la comunicación I2C con el sensor de DO
  Wire.write("t,");                     //Se escribe el comando de compensacion de temperatura
  Wire.write(inst_temp.c_str());        //Se escribe el valor obtenido de temperatuda del RTD
  Wire.endTransmission();               //Se termina la comunicación I2C y se envia el comando de lectura al sensor
  delay(do_time);                       //Se espera el tiempo de respuesta del sensor
  Wire.beginTransmission(do_address);   //Se inicia la comunicación I2C con el sensor de DO
  Wire.write("r");                      //Se escribe en I2C el comando de lectura
  Wire.endTransmission();               //Se termina la comunicación I2C y se envia el comando de lectura al sensor
  delay(do_time);                       //Se espera la respuesta del sensor
  Wire.requestFrom(do_address, 20, 1);  //Se solicitan 20 bytes al sensor y se envia un byte de parada
  do_code = Wire.read();                //Se lee el primer byte, que muestra el codigo de estado
  while(Wire.available()){              //Se lee continuamente los bytes enviados por el sensor  
    do_in_char = Wire.read();           //Se lee byte por byte la informacion enviada por sensor
    do_data[do_i] = do_in_char;         //Se guarda el byte leido en un arreglo
    do_i++;                             //Variable de incremento del arreglo
    if(do_in_char == 0){                //Se comprueba el byte nulo de termino de mensaje
      do_i = 0;                         //Se resetea el valor de la variable de incremento
      break;                            //Se sale del ciclo "While"
    }
  }
  Wire.beginTransmission(do_address);   //Se inicia la comunicación I2C con el sensor de DO
  Wire.write("t,25.0");                 //Se escribe el comando de compensacion de temperatura a 25°C (Valor por defecto)
  Wire.endTransmission();               //Se termina la comunicación I2C y se envia el comando de lectura al sensor

  do_i = 0;                             //Se resetea el valor de la variable de incremento  

  DO_temp = strtok(do_data, ",");       //Se extrae el valor del DO compensado con la temperatura como string 
  sat_temp = strtok(NULL, ",");         //Se extrae el valor de Saturación compensado con la tempertatura como string

  _data[17] = (float)atof(DO_temp);     //Se almacena el valor en float de Do compensado con la temperatura en la posición "17" del arreglo
  _data[18] = (float)atof(sat_temp);    //Se almacena el valor en float de Saturación compensado con la temperatura en la posición "18" del arreglo
}

void do_15_wire_transmission(){ //podria irse
  Wire.beginTransmission(do_address);
  Wire.write("rt,15.0");
  Wire.endTransmission();
  delay(do_time);
  Wire.requestFrom(do_address, 20, 1);
  do_code = Wire.read();
  while(Wire.available()){
    do_in_char = Wire.read();
    do_data[do_i] = do_in_char;
    do_i++;
    if(do_in_char == 0){
      do_i = 0;
      break;
    }
  }
  do_i = 0;
  
  DO_15 = strtok(do_data, ",");
  sat_15 = strtok(NULL, ","); 

  _data[21] = (float)atof(DO_15);
}
//Función de lectura del sensor de PH
void ph_wire_transmission(){
  Wire.beginTransmission(ph_address);
  Wire.write('r');
  Wire.endTransmission();
  delay(ph_time);
  Wire.requestFrom(ph_address, 20, 1);
  ph_code = Wire.read();

  while(Wire.available()){
    ph_in_char = Wire.read();
    ph_data[ph_i] = ph_in_char;
    ph_i++;
    if(ph_in_char == 0){
      ph_i = 0;
      break;
    }
  }
  ph_i = 0;
  
  _data[1] = (float)atof(ph_data);
}

void ph_temp_wire_transmission(){
  Wire.beginTransmission(ph_address);
  Wire.write("t,");
  Wire.write(inst_temp.c_str());
  Wire.endTransmission();
  delay(ph_time);
  Wire.beginTransmission(ph_address);
  Wire.write("r");
  Wire.endTransmission();
  delay(ph_time);
  Wire.requestFrom(ph_address, 20, 1);
  ph_code = Wire.read();

  while(Wire.available()){
    ph_in_char = Wire.read();
    ph_data_temp[ph_i] = ph_in_char;
    ph_i++;
    if(ph_in_char == 0){
      ph_i = 0;
      break;
    }
  }
  Wire.beginTransmission(ph_address);
  Wire.write("t,25.0");
  Wire.endTransmission();
  delay(ph_time);
  ph_i = 0;
  
  _data[20] = (float)atof(ph_data_temp);
}

void ec_wire_transmission(){
  Wire.beginTransmission(ec_address);
  Wire.write('r');
  Wire.endTransmission();
  delay(ec_time);
  Wire.requestFrom(ec_address, 32, 1);
  ec_code = Wire.read();
  while(Wire.available()){
    ec_in_char = Wire.read();
    ec_data[ec_i] = ec_in_char;
    ec_i++;
    if(ec_in_char == 0){
      ec_i = 0;
      break;
    }
  }
  ec_i = 0;
  ec = strtok(ec_data, ",");
  tds = strtok(NULL, ",");
  sal = strtok(NULL, ",");
  sg = strtok(NULL, ",");

  _data[2] = (float)atof(ec);
  _data[3] = (float)atof(tds);
  _data[4] = (float)atof(sal);
  _data[5] = (float)atof(sg);
}

void ec_temp_wire_transmission(){
  Wire.beginTransmission(ec_address);
  Wire.write("t,");
  Wire.write(inst_temp.c_str());
  Wire.endTransmission();
  delay(ec_time);
  Wire.beginTransmission(ec_address);
  Wire.write("r");
  Wire.endTransmission();
  delay(ec_time);
  Wire.requestFrom(ec_address, 32, 1);
  ec_code = Wire.read();
  while(Wire.available()){
    ec_in_char = Wire.read();
    ec_data[ec_i] = ec_in_char;
    ec_i++;
    if(ec_in_char == 0){
      ec_i = 0;
      break;
    }
  }
  ec_i = 0;
  Wire.beginTransmission(ec_address);
  Wire.write("t,25.0");
  Wire.endTransmission();
  delay(ec_time);

  ec_temp = strtok(ec_data, ",");
  tds = strtok(NULL, ",");
  sal = strtok(NULL, ",");
  sg = strtok(NULL, ",");

  _data[19] = (float)atof(ec_temp);
}

void rtd_wire_transmission(){
  Wire.beginTransmission(rtd_address);
  Wire.write('r');
  Wire.endTransmission();
  delay(rtd_time_);
  Wire.requestFrom(rtd_address, 20, 1);
  rtd_code = Wire.read();
  while(Wire.available()){
    rtd_in_char = Wire.read();
    rtd_data[rtd_i] = rtd_in_char;
    rtd_i++;
    if(rtd_in_char == 0){
      rtd_i = 0;
      break;
    }
  }
  _data[6] = (float)atof(rtd_data);
}

void orp_wire_transmission(){
  Wire.beginTransmission(orp_address);
  Wire.write("r");
  Wire.endTransmission();
  delay(orp_time);
  Wire.requestFrom(orp_address, 20, 1);
  orp_code = Wire.read();
  while(Wire.available()){
    orp_in_char = Wire.read();
    orp_data[orp_i] = orp_in_char;
    orp_i++;
    if(orp_in_char == 0){
      orp_i = 0;
      break;
    }
  }  
  _data[15] = (float)atof(orp_data);
}
