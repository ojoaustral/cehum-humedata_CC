#include "CommandDispatcher.h"

void setupSerial() {
  Serial.begin(9600);
}

void loopSerial() {
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    processCommand(data.c_str());
  }
}
