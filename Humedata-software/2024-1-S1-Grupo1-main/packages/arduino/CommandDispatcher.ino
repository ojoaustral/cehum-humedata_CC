#include "CommandDispatcher.h"

const int MAX_COMMANDS = 10;
CommandMapping commandMappings[MAX_COMMANDS];
int commandCount = 0;

void registerCommandHandler(const String& commandPrefix, CommandHandler handler) {
    if (commandCount < MAX_COMMANDS) {
        commandMappings[commandCount].commandPrefix = commandPrefix;
        commandMappings[commandCount].handler = handler;
        commandCount++;
    }
}

void processCommand(const char* command) {
    char response[100] = {0};
    int responseCode = 0;

    String cmdStr = String(command);
    for (int i = 0; i < commandCount; i++) {
        if (cmdStr.startsWith(commandMappings[i].commandPrefix)) {
            // Remove the prefix
            String strippedCommand = cmdStr.substring(commandMappings[i].commandPrefix.length());
            char strippedCommandCharArray[100];
            strippedCommand.toCharArray(strippedCommandCharArray, strippedCommand.length() + 1);

            // Call the handler with the stripped command
            commandMappings[i].handler(strippedCommandCharArray, response, &responseCode);
            break;
        }
    }

    Serial.println(response);
}
