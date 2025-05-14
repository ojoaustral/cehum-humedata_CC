#ifndef EC_I2C_H
#define EC_I2C_H

#include <Wire.h>

#define EC_SENSOR_ADDRESS 100

void setupEC();
void handleECCommand(const char* command, char* response, int* responseCode);

#endif

