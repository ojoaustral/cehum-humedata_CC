#include "DO.h"

char do_computerdata[20];
char do_data[20];
char saturation_data[10];
byte do_code = 0;

void setupDO() {
  // No hardware setup needed for the emulator
}

void handleDOCommand(const char* command, char* response, int* responseCode) {
  memset(do_computerdata, 0, sizeof(do_computerdata));
  for (int i = 0; command[i] != 0; i++) {
    do_computerdata[i] = tolower(command[i]);
  }

  if (strcmp(do_computerdata, "cal") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "r") == 0) {
    float simulatedDO = random(0, 2000) / 100.0;  // Random DO value between 0.00 and 20.00 mg/L
    float simulatedSaturation = random(0, 1000) / 10.0;  // Random saturation value between 0.0% and 100.0%
    dtostrf(simulatedDO, 4, 2, do_data);
    dtostrf(simulatedSaturation, 4, 2, saturation_data);
    snprintf(response, 100, "%s,%s", do_data, saturation_data);
    // snprintf(response, 100, "DO: %s mg/L, Saturation: %s%%", do_data, saturation_data);
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "status") == 0) {
    strcpy(response, "Status: OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "sleep") == 0) {
    strcpy(response, "Entering sleep mode");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "find") == 0) {
    strcpy(response, "Blinking LED");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "export") == 0) {
    strcpy(response, "*DONE");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "import") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "factory") == 0) {
    strcpy(response, "*RE");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "baud") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "i") == 0) {
    strcpy(response, "Device info: DO Sensor");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "i2c") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "l") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "name") == 0) {
    strcpy(response, "Name: DO Sensor");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "o") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "p") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "plock") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "s") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(do_computerdata, "t") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else {
    *responseCode = 2; // Fail code for unknown command
    snprintf(response, 100, "Unknown command: %s", command);
  }
}
