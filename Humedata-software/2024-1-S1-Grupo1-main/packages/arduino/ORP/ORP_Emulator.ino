#include "ORP.h"

char orp_computerdata[20];
byte orp_code = 0;
char ORP_data[20];

void setupORP() {
  // No hardware setup needed for the emulator
}

void handleORPCommand(const char* command, char* response, int* responseCode) {
  memset(orp_computerdata, 0, sizeof(orp_computerdata));
  for (int i = 0; command[i] != 0; i++) {
    orp_computerdata[i] = tolower(command[i]);
  }

  if (strcmp(orp_computerdata, "cal") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "r") == 0) {
    float simulatedORP = random(-2000, 2000) / 100.0;  // Random ORP value between -20.00 and 20.00 mV
    dtostrf(simulatedORP, 4, 2, ORP_data);
    // snprintf(response, 100, "ORP: %s mV", ORP_data);
    snprintf(response, 100, "%s", ORP_data);
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "status") == 0) {
    strcpy(response, "Status: OK");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "sleep") == 0) {
    strcpy(response, "Entering sleep mode");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "find") == 0) {
    strcpy(response, "Blinking LED");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "export") == 0) {
    strcpy(response, "*DONE");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "import") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "factory") == 0) {
    strcpy(response, "*RE");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "baud") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "i") == 0) {
    strcpy(response, "Device info: ORP Sensor");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "i2c") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "l") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "name") == 0) {
    strcpy(response, "Name: ORP Sensor");
    *responseCode = 1;
  } else if (strcmp(orp_computerdata, "plock") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else {
    *responseCode = 2; // Fail code for unknown command
    snprintf(response, 100, "Unknown command: %s", command);
  }
}
