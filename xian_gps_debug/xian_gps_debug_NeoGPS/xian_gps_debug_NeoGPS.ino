#include <NMEAGPS.h>

// good documentation here https://github.com/SlashDevin/NeoGPS/blob/master/README.md

/*

NEO-6M GPS Module with Arduino:
https://randomnerdtutorials.com/guide-to-neo-6m-gps-module-with-arduino/

Position Fix LED Indicator
There is an LED on the NEO-6M GPS module that indicates the status of the ‘Position Fix’. It will blink at different rates depending on which state it is in:

No blinking – it is searching for satellites.
Blink every 1s – Position Fix is found (the module can see enough satellites).
*/

// Set up the syste to read the GPS module using the Arduino of the Humedata Lihuen V.1.0. 

const int XIAN_SWITCH = A4;
const int GPS_SWITCH = A5;
const int RS485_SWITCH = A6;
const int MAX_3485_EN = 3;

// Define GPS port
#define gpsPort Serial1
#define GPS_PORT_NAME "Serial1"
#define DEBUG_PORT Serial


void setup()
{
  pinMode(XIAN_SWITCH, OUTPUT);
  pinMode(GPS_SWITCH, OUTPUT);
  pinMode(RS485_SWITCH, OUTPUT);
  pinMode(MAX_3485_EN, OUTPUT);

  digitalWrite(GPS_SWITCH, HIGH);
  digitalWrite(XIAN_SWITCH, LOW);
  digitalWrite(RS485_SWITCH, LOW);
  digitalWrite(MAX_3485_EN, LOW);

  
  Serial.begin(115200);
  Serial1.begin(9600);
}

// Using the NeoGPS library, define a Neo object
NMEAGPS gps;

// The main NMEAGPS gps; object you declare in your sketch parses received characters, gradually assembling a fix (e.g., gps_fix fix;).
gps_fix currentFix;


void loop()
{
  // This sketch displays information every time a new sentence is correctly encoded.
  while (gps.available( Serial1 )) {
    currentFix = gps.read();
if (currentFix.valid.date) {
    Serial.println( "We have date!" );
    Serial.print( currentFix.dateTime.year);
    Serial.print( '-' );
    Serial.print( currentFix.dateTime.month);
    Serial.print( '-' );
    Serial.println( currentFix.dateTime.date);
      }
  else{
  Serial.println(F("No date yet, sorry."));
    //while(true);
  }
if (currentFix.valid.time) {
    Serial.println( "We have time!" );
    Serial.print( currentFix.dateTime.hours );
    Serial.print( ':' );
    Serial.print( currentFix.dateTime.minutes );
    Serial.print( ':' );
    Serial.println( currentFix.dateTime.seconds );
  }
  else{
  Serial.println(F("No time yet, sorry."));
    //while(true);
    }
if (currentFix.valid.location) {
    Serial.println( "We have Lat/Lon!" );
    Serial.print( currentFix.latitude() );
    Serial.print( ',' );
    Serial.println( currentFix.longitude() );
  }
  else{
  Serial.println(F("No GPS location yet, sorry."));
    //while(true);
    }
  }
delay(100); // a delay to slow down the display 
}
