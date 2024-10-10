 // Pinning
  // SDA to A4 (on modt Arduinos like the UNO)
  // SCL to A5P 
  // VCC to 5V 
  // GND to GND

#include <Wire.h>
#include "RTClib.h"

RTC_DS3231 rtc;

void setup() {
  // Start the serial communication for debugging purposes
  Serial.begin(9600);

  // Initialize the RTC
  if (!rtc.begin()) {
    Serial.println("Couldn't find RTC");
    while (1);
  }

    // The line below sets the RTC to the date & time this sketch was compiled
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));

    // Alternatively, you can set the RTC to a specific date and time manually.
    // Uncomment the next line and set the time manually in the format: (YYYY, MM, DD, HH, MM, SS)
    rtc.adjust(DateTime(2024, 9, 13, 11, 01, 0));  // Set the time to 12th Sep 2024, 10:30:00
  }

void loop() {
  // Fetch the current time from the RTC
  DateTime now = rtc.now();

  // Print the current time to the serial monitor
  Serial.print(now.year(), DEC);
  Serial.print('/');
  Serial.print(now.month(), DEC);
  Serial.print('/');
  Serial.print(now.day(), DEC);
  Serial.print(" ");
  Serial.print(now.hour(), DEC);
  Serial.print(':');
  Serial.print(now.minute(), DEC);
  Serial.print(':');
  Serial.print(now.second(), DEC);
  Serial.println();

  delay(1000); // Wait for 1 second before refreshing
}
