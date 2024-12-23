#ifndef PH_I2C_H
#define PH_I2C_H

#include <Wire.h>

#define PH_SENSOR_ADDRESS 99

void setupPH();
void handlePHCommand(const char* command, char* response, int* responseCode);

#endif
