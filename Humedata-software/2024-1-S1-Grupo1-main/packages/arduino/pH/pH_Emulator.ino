#include "pH.h"

char ph_computerdata[20];  // Array to hold incoming data from the serial monitor
char ph_data[20];  // Array to hold incoming data from the pH circuit
float ph_float;  // Float variable to hold the pH value
// byte code = 0;  // Used to hold the I2C response code

void setupPH() {
  // No hardware setup needed for the emulator
}

void handlePHCommand(const char* command, char* response, int* responseCode) {
  memset(ph_computerdata, 0, sizeof(ph_computerdata));
  for (int i = 0; command[i] != 0; i++) {
    ph_computerdata[i] = tolower(command[i]);
  }

  if (strcmp(ph_computerdata, "cal") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "r") == 0) {
    float simulatedPH = random(0, 1400) / 100.0;  // Random pH value between 0.00 and 14.00
    dtostrf(simulatedPH, 4, 2, ph_data);
    snprintf(response, 100, "%s", ph_data);
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "status") == 0) {
    strcpy(response, "Status: OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "sleep") == 0) {
    strcpy(response, "Entering sleep mode");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "find") == 0) {
    strcpy(response, "Blinking LED");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "export") == 0) {
    strcpy(response, "*DONE");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "import") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "factory") == 0) {
    strcpy(response, "*RE");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "baud") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "i") == 0) {
    strcpy(response, "Device info: pH Sensor");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "i2c") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "k") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "l") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "name") == 0) {
    strcpy(response, "Name: pH Sensor");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "phext") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "plock") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "slope") == 0) {
    strcpy(response, "Slope: 99.99");
    *responseCode = 1;
  } else if (strcmp(ph_computerdata, "t") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else {
    *responseCode = 2; // Fail code for unknown command
    snprintf(response, 100, "Unknown command: %s", command);
  }
}
