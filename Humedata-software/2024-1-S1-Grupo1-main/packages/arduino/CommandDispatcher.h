#ifndef COMMAND_DISPATCHER_H
#define COMMAND_DISPATCHER_H

#include <Arduino.h>

typedef void (*CommandHandler)(const char* command, char* response, int* responseCode);

struct CommandMapping {
    String commandPrefix;
    CommandHandler handler;
};

void registerCommandHandler(const String& commandPrefix, CommandHandler handler);
void processCommand(const char* command);

#endif
