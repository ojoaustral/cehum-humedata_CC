#ifndef DO_I2C_H
#define DO_I2C_H

#include <Wire.h>

#define DO_SENSOR_ADDRESS 97

void setupDO();
void handleDOCommand(const char* command, char* response, int* responseCode);

#endif

