
// Código para poner el módulo reloj a la hora y asegurar una correcta serie de tiempo.
// Para aplicar este código, desconectar el módulo RTC 3231 de Humedata y conectarlo a un Arduino 

// Pinning (tested in Arduino Nano)
// SDA to A4 (on most Arduinos like the UNO)
// SCL to A5P
// VCC to 5V 
// GND to GND

// (hay un cable adaptador que facilita esta tarea)
// El Humedata debe quedar marcando la hora en UTC-4, la hora estándar de Chile y la utilizada en invierno. 
// Durente el horario de verano, es necesario sustraer una hora de la hora de los celulares y computadores:
// Este código, por defecto, toma la hora de compilación de este sketch y se la pasa al módulo reloj. 
// En la siguiente línea debes definir el ajuste horario que se le aplicará a la hora de tu PC para conseguir UTC-4.  


// HERE agregar una funsion condicional para adaptar el ajuste automaticamente, o solicitar directamente UTC-4 en lugar de la hora por defecto del sistema. 

int hour_adjustment = -1; // Apply -1 in summer time, and 0 in witer time so as to achieve UTC-4. 


// Una vez revisada la línea anterior, compila/sube este sketch completo a tu Arduino conectado al módulo reloj, 
// abre el monitor serial, y confirma que aparece la hora correcta en UTC-4. 
// Si es así, desconecta el módulo y conéctalo al Humedata que debe encontrarse energizado.
// Aunque es extraño, hemos visto que la pérdida prolongada de poder hace perder la buena hora en el módulo,
// tema que debe ser abordado en mayor profundidad en el futuro.  
     

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

    // The line below sets the RTC to the date & time this sketch was compiled + an adjustment 
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__))+ TimeSpan(0, hour_adjustment, 0, 0));

    // Alternatively, you can set the RTC to a specific date and time manually.
    // Uncomment the next line and set the time manually in the format: (YYYY, MM, DD, HH, MM, SS)
    // rtc.adjust(DateTime(2024, 9, 13, 11, 01, 0));  // Set the time to 12th Sep 2024, 10:30:00
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
