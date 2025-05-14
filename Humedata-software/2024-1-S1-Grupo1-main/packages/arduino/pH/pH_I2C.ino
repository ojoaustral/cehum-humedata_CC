#include "pH.h"

char computerdata[20];  // Array to hold incoming data from the serial monitor
byte received_from_computer = 0;
byte serial_event = 0;
byte code = 0;
char ph_data[20];  // Array to hold incoming data from the pH circuit
byte in_char = 0;  // Buffer to store inbound bytes from the pH circuit
byte i = 0;  // Counter used for the ph_data array
int time_ = 815;  // Delay needed depending on the command sent to the pH circuit
float ph_float;  // Float variable to hold the pH value

void setupPH() {
  Wire.begin();
}

void handlePHCommand(const char* command, char* response, int* responseCode) {
  for (i = 0; command[i] != 0; i++) {
    computerdata[i] = tolower(command[i]);
  }
  computerdata[i] = 0;

  if (computerdata[0] == 'c' || computerdata[0] == 'r') time_ = 815;
  else time_ = 250;

  Wire.beginTransmission(PH_SENSOR_ADDRESS);
  Wire.write(computerdata);
  Wire.endTransmission();

  if (strcmp(computerdata, "sleep") != 0) {
    delay(time_);

    Wire.requestFrom(PH_SENSOR_ADDRESS, 20, 1);
    code = Wire.read();

    switch (code) {
      case 1:
        i = 0; // Reset the index for ph_data
        while (Wire.available()) {
            in_char = Wire.read();
            if (i < sizeof(ph_data) - 1) { // Ensure we don't overflow ph_data
              ph_data[i++] = in_char;
            }
            if (in_char == 0) { // Null-terminated string
              break;
            }
          }
          ph_data[i] = 0; // Null-terminate ph_data
          if (i > 0) {
            strcpy(response, ph_data); // Copy the ph_data to response
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
