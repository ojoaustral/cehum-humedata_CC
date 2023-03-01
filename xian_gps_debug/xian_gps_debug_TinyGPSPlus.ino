// This code is intended to test the NEO-6M GPS Module with Arduino
// Useful help: https://randomnerdtutorials.com/guide-to-neo-6m-gps-module-with-arduino/

#include <TinyGPSPlus.h>
//test
TinyGPSPlus gps;

const int XIAN_SWITCH = A4;
const int GPS_SWITCH = A5;
const int RS485_SWITCH = A6;
const int MAX_3485_EN = 3;

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

  Serial.println(F("DeviceExample.ino"));
  Serial.println(F("A simple demonstration of TinyGPSPlus with an attached GPS module"));
  Serial.print(F("Testing TinyGPSPlus library v. ")); Serial.println(TinyGPSPlus::libraryVersion());
  Serial.println(F("by Mikal Hart"));
  Serial.println();
}

void loop()
{
  // This sketch displays information every time a new sentence is correctly encoded.
  while (Serial1.available() > 0)
    if (gps.encode(Serial1.read()))
      displayInfo();

  if (millis() > 5000 && gps.charsProcessed() < 10)
  {
    Serial.println(F("No GPS detected: check wiring."));
    while(true);
  }
}

void displayInfo()
{
  Serial.print(F("Location: ")); 
  if (gps.location.isValid())
  {
    Serial.print(gps.location.lat(), 6);
    Serial.print(F(","));
    Serial.print(gps.location.lng(), 6);
  }
  else
  {
    Serial.print(F("INVALID"));
  }

  Serial.print(F("  Date/Time: "));
  if (gps.date.isValid())
  {
    Serial.print(gps.date.month());
    Serial.print(F("/"));
    Serial.print(gps.date.day());
    Serial.print(F("/"));
    Serial.print(gps.date.year());
  }
  else
  {
    Serial.print(F("INVALID"));
  }

  Serial.print(F(" "));
  if (gps.time.isValid())
  {
    if (gps.time.hour() < 10) Serial.print(F("0"));
    Serial.print(gps.time.hour());
    Serial.print(F(":"));
    if (gps.time.minute() < 10) Serial.print(F("0"));
    Serial.print(gps.time.minute());
    Serial.print(F(":"));
    if (gps.time.second() < 10) Serial.print(F("0"));
    Serial.print(gps.time.second());
    Serial.print(F("."));
    if (gps.time.centisecond() < 10) Serial.print(F("0"));
    Serial.println(gps.time.centisecond());

// Try some additional commands from TinyGPSPlus to parse data from GPS module. 
Serial.print("LAT=");  Serial.println(gps.location.lat(), 6);
Serial.print("LONG="); Serial.println(gps.location.lng(), 6);
Serial.print("ALT=");  Serial.println(gps.altitude.meters());
  }
  else
  {
    Serial.print(F("INVALID"));
  }
delay(5000);
  Serial.println();
}
