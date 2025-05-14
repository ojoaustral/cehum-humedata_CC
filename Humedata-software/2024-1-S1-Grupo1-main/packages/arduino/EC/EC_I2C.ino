#include "EC.h"

char computerdata[20];
byte received_from_computer = 0;
byte serial_event = 0;
byte code = 0;
char ec_data[32];
byte in_char = 0;
byte i = 0;
int time_ = 570;

void setupEC() {
  Wire.begin();
}

void handleECCommand(const char* command, char* response, int* responseCode) {
  for (i = 0; command[i] != 0; i++) {
    computerdata[i] = tolower(command[i]);
  }
  computerdata[i] = 0;

  if (computerdata[0] == 'c' || computerdata[0] == 'r') time_ = 570;
  else time_ = 250;

  Wire.beginTransmission(EC_SENSOR_ADDRESS);
  Wire.write(computerdata);
  Wire.endTransmission();

  if (strcmp(computerdata, "sleep") != 0) {
    delay(time_);

    Wire.requestFrom(EC_SENSOR_ADDRESS, 32, 1);
    code = Wire.read();

    switch (code) {
      case 1:
        i = 0; // Reset the index for ec_data
        while (Wire.available()) {
            in_char = Wire.read();
            if (i < sizeof(ec_data) - 1) { // Ensure we don't overflow ec_data
              ec_data[i++] = in_char;
            }
            if (in_char == 0) { // Null-terminated string
              break;
            }
          }
          ec_data[i] = 0; // Null-terminate ec_data
          if (i > 0) {
            strcpy(response, ec_data); // Copy the ec_data to response
          }
        break;
      case 2:
        strcpy(response, "Failed");
        *responseCode = 2;
        break;
      case 254:
        strcpy(response, "Pending");
        *responseCode = 254;
        break;
      case 255:
        strcpy(response, "No Data");
        *responseCode = 255;
        break;
    }
  } else {
    strcpy(response, "Sleep command executed");
  }
}
