import React from "react"
import { View, Text } from "react-native"
import { TerminalOutput } from '@/components/Terminal';

type TerminalOutputViewProps = {
  terminalOutput: TerminalOutput[];
};

export const outputToText = (output: TerminalOutput) => {
  return `[${output?.timestamp.toLocaleString()}] ${output.type === "send" ? "> " : "< "} ${output.command}`
}

const TerminalOutputView = ({ terminalOutput }: TerminalOutputViewProps) => {
  const getTextColor = (type: string) => {
    switch (type) {
    case "send":
      return "text-blue-500"
    case "receive":
      return "text-green-500"
    case "error":
      return "text-red-500"
    default:
      return "text-black"
    }
  }

  return (
    <View className="ml-10">
      {terminalOutput.map((output, index) => (
        <Text
          key={index}
          className={`text-base font-mono p-1 ${getTextColor(output.type)}`}
        >
          {outputToText(output)}
        </Text>
      ))}
    </View>
  )
}

export default TerminalOutputView

