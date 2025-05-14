#include "EC.h"

char ec_computerdata[20];           // We make a 20 byte character array to hold incoming data from a pc/mac/other.

void setupEC() {
  // No hardware setup needed for the emulator
}

void handleECCommand(const char* command, char* response, int* responseCode) {
  memset(ec_computerdata, 0, sizeof(ec_computerdata));
  for (int i = 0; command[i] != 0; i++) {
    ec_computerdata[i] = tolower(command[i]);
  }

  if (strcmp(ec_computerdata, "cal") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "r") == 0) {
    float simulatedEC = random(70, 500000) / 100.0; // Random EC value between 0.70 and 5000.00 µS/cm
    float simulatedTDS = simulatedEC * 0.5;         // Simulated TDS value
    float simulatedSAL = simulatedEC * 0.001;       // Simulated salinity value
    float simulatedSG = 1.0 + (simulatedEC * 0.0001); // Simulated specific gravity value

    char ec_str[10], tds_str[10], sal_str[10], sg_str[10];
    dtostrf(simulatedEC, 4, 2, ec_str);
    dtostrf(simulatedTDS, 4, 2, tds_str);
    dtostrf(simulatedSAL, 4, 2, sal_str);
    dtostrf(simulatedSG, 4, 3, sg_str);

    // Prepare the response string
    snprintf(response, 100, "%s,%s,%s,%s", ec_str, tds_str, sal_str, sg_str);
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "status") == 0) {
    strcpy(response, "Status: OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "sleep") == 0) {
    strcpy(response, "Entering sleep mode");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "find") == 0) {
    strcpy(response, "Blinking LED");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "export") == 0) {
    strcpy(response, "*DONE");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "import") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "factory") == 0) {
    strcpy(response, "*RE");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "baud") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "i") == 0) {
    strcpy(response, "Device info: pH Sensor");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "i2c") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "k") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "l") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "name") == 0) {
    strcpy(response, "Name: pH Sensor");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "phext") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "plock") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "slope") == 0) {
    strcpy(response, "Slope: 99.99");
    *responseCode = 1;
  } else if (strcmp(ec_computerdata, "t") == 0) {
    strcpy(response, "*OK");
    *responseCode = 1;
  } else {
    *responseCode = 2; // Fail code for unknown command
    snprintf(response, 100, "Unknown command: %s", command);
  }
}

