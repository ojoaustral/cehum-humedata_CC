#include "DO.h"

char computerdata[20];
byte received_from_computer = 0;
byte serial_event = 0;
byte code = 0;
char do_data[20];
byte in_char = 0;
byte i = 0;
int time_ = 575;

void setupDO() {
  Wire.begin();
}

void handleDOCommand(const char* command, char* response, int* responseCode) {
  for (i = 0; command[i] != 0; i++) {
    computerdata[i] = tolower(command[i]);
  }
  computerdata[i] = 0;

  if (computerdata[0] == 'c' || computerdata[0] == 'r') time_ = 575;
  else time_ = 250;

  Wire.beginTransmission(DO_SENSOR_ADDRESS);
  Wire.write(computerdata);
  Wire.endTransmission();

  if (strcmp(computerdata, "sleep") != 0) {
    delay(time_);

    Wire.requestFrom(DO_SENSOR_ADDRESS, 20, 1);
    code = Wire.read();

    switch (code) {
      case 1:
        i = 0; // Reset the index for do_data

        while (Wire.available()) {
            in_char = Wire.read();
            if (i < sizeof(do_data) - 1) { // Ensure we don't overflow do_data
              do_data[i++] = in_char;
            }
            if (in_char == 0) { // Null-terminated string
              break;
            }
          }
          do_data[i] = 0; // Null-terminate do_data
          if (i > 0) {
            strcpy(response, do_data); // Copy the do_data to response
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
