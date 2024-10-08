// Variables LoRaWAN
LoRaModem modem;
//  String devEUI = "A8610A3233298409";                  // --> ALPHA 
//  String devEUI = "A8610A3237277009";                  // --> ATLAS 

//  String appEui = "A8610A3237267209";                     // --> BP
//  String devEUI = "A8610A343633830F";                     // --> BP
//  String appKey = "EF09882529BA1054A2062ACDFBDB30EC";     // --> BP

// String appEui = "70B3D57ED0042E7E";                     // --> ATLAS
// String appKey = "5ED7E15D4D31804F8E2A8C447CAE76CC";     // --> ATLAS

String devEUI = "A8610A343633830F";                     // --> TOTO 
String appEui = "70B3D57ED0042E7E";                     // --> TOTO
String appKey = "2EF50415D773062BF21AE6B2234C486A";     // --> TOTO



uint8_t _data_lorawan[49];

// RTC DS3231
RTC_DS3231 rtc;
int _year, _month, _day, _hour, _minutes, _seconds, _rday;

// Sensor de presión y temperatura BMP280
Adafruit_BMP280 bmp;
float atm_pressure;
float atm_temperature;

// Sensor de temperatura RTD de Atlas Scientific
const int rtd_address = 102;
byte rtd_code         = 0;                  
char rtd_data[20];          
byte rtd_in_char      = 0;            
byte rtd_i            = 0;                    
int rtd_time_         = 600;              
float rtd_tmp_float;       
String inst_temp      = "25.0";       

// Sensor de pH de Atlas Scientific
const int ph_address = 99;
byte ph_code         = 0;
char ph_data[20];
char ph_data_temp[20];
byte ph_in_char      = 0;
byte ph_i            = 0;
int ph_time          = 1000;

// Sensor de ORP de Atlas Scientific
const int orp_address = 98;
byte orp_code         = 0;
char orp_data[20];
byte orp_in_char      = 0;
byte orp_i            = 0;
int orp_time          = 815; 
byte orp_float_bytes[4];

// Sensor de conductividad eléctrica de Atlas Scientific
const int ec_address  = 100;
byte ec_code          = 0;
char ec_data[32];
byte ec_in_char       = 0;
byte ec_i             = 0;
int ec_time           = 1000;
char *ec;
char *ec_temp;
char *tds;
char *sal;
char *sg;
byte tds_float_bytes[4];
byte ec_float_bytes[4];
byte ec_temp_float_bytes[4];

// Sensor de oxígeno disuelto de Atlas Scientific
const int do_address  = 97;
char *DO;
char *DO_temp;
char *DO_15;
char *sat;
char *sat_temp;
char *sat_15;
byte do_code          = 0;
char do_data[20];
byte do_in_char       = 0;
byte do_i             = 0;
int do_time           = 575;
byte do_float_bytes[4];
byte sat_float_bytes[4];
byte do_temp_float_bytes[4];
byte sat_temp_float_bytes[4];
byte do_15_float_bytes[4];

// Sensores y módulos del Shield MKR ENV
float internal_pressure     = 0;
float internal_temperature  = 0;
float internal_humidity     = 0;

const int sd_cs_pin = 4;
File dataFile;
float sd_data[22];

// Módulo GPS
char gps_data[128];
byte gps_code        = 0;
byte gps_in_char     = 0; 
byte gps_i           = 0;
int  cycle           = 0;
float time_cycle     = 4;
int  on              = 0;
float gps_latitude   = 0;
float gps_longitude  = 0;
byte gps_latitude_float_bytes[4];
byte gps_longitude_float_bytes[4];

// Voltaje de la batería
int batt_analog     = 0;
float batt_voltage  = 0;

// Variables generales
const int rtd_off_pin     = 0;
const int ph_off_pin      = 21;
const int orp_off_pin     = 18;
const int ec_off_pin      = 20;
const int do_off_pin      = 19;
const int gps_switch_pin  = 2;
const int reset_on_pin    = 3;

const int _data_size      = 29;
float _data[_data_size];
