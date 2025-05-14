#include "CommandDispatcher.h"
#include <SoftwareSerial.h>

SoftwareSerial BTSerial(10, 11); // RX, TX pins for HC-06

void setupBluetooth() {
  Serial.begin(9600); // Initialize hardware serial for debug
  BTSerial.begin(9600); // Initialize software serial for HC-06

  Serial.println("Waiting for Bluetooth connection...");
}

void loopBluetooth() {
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    processCommand(data.c_str());
  }
  if (BTSerial.available()) {
    String rxValue = BTSerial.readStringUntil('\n');
    if (rxValue.length() > 0) {
      Serial.println("*********");
      Serial.print("Received Value: ");
      Serial.println(rxValue);
      Serial.println("*********");

      char command[rxValue.length() + 1];
      rxValue.toCharArray(command, rxValue.length() + 1);

      char response[100] = {0};
      int responseCode = 0;

      processCommand(command); // Process the received command

      // If needed, notify the client (HC-06)
      // Convert the response to a String and send it back via BTSerial
      String responseStr(response);
      BTSerial.println(responseStr);
    }
  }
}
