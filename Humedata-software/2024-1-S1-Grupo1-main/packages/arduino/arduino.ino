#include "CommandDispatcher.h"

#include "EC.h"
#include "ORP.h"
#include "pH.h"
#include "DO.h"


// Function prototypes
void setupSerial();
void loopSerial();
void setupBluetooth();
void loopBluetooth();
void setupPH();
void setupDO();
void setupORP();
void setupEC();
void handlePHCommand(const char* command, char* response, int* responseCode);
void handleDOCommand(const char* command, char* response, int* responseCode);
void handleORPCommand(const char* command, char* response, int* responseCode);
void handleECCommand(const char* command, char* response, int* responseCode);

void setup() {
  setupBluetooth();
  setupPH();   // Initialize pH sensor
  setupDO();   // Initialize DO sensor
  setupORP();  // Initialize ORP sensor
  setupEC();   // Initialize EC sensor

  // Register command handlers
  registerCommandHandler("ph_", handlePHCommand); // Prefix "ph_" for pH commands
  registerCommandHandler("do_", handleDOCommand); // Prefix "do_" for DO commands
  registerCommandHandler("orp_", handleORPCommand); // Prefix "orp_" for ORP commands
  registerCommandHandler("ec_", handleECCommand); // Prefix "ec_" for EC commands
}

void loop() {
  loopBluetooth(); // Para bluetooth y Serial USB
}
