import { TerminalOutput } from "./index"


export const handleSendCommand = (
  cmd: string | undefined,
  currentCommand: string,
  setCommand: (command: string) => void,
  setTerminalOutput: (output: TerminalOutput[]) => void,
  onSend: (command: commandType) => void
) => {
  const commandToSend = cmd || currentCommand
  if (commandToSend.trim() !== "") {
    const newCommand = {
      command: commandToSend,
      type: "send",
      timestamp: new Date(),
    }
    onSend(commandToSend)
    setTerminalOutput((prevOutput: TerminalOutput[]): TerminalOutput[] => [
      ...prevOutput,
      newCommand
    ]);
    setCommand("")
  }
}

export const handleClearOutput = (
  setTerminalOutput: (output: TerminalOutput[]) => void,
  onClear?: () => void
) => {
  setTerminalOutput([])
  if (onClear) {
    onClear()
  }
}


