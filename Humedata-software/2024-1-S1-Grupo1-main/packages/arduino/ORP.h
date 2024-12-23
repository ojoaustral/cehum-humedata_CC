#ifndef ORP_I2C_H
#define ORP_I2C_H

#include <Wire.h>

#define ORP_SENSOR_ADDRESS 98

void setupORP();
void handleORPCommand(const char* command, char* response, int* responseCode);

#endif

