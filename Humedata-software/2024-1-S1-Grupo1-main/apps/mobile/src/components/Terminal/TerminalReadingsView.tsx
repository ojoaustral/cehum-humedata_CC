import React from "react"
import { View } from "react-native"
import { TerminalOutput } from "./index"
import SingleFloat from "./formats/singleFloat"
import MultipleFloatsBarGraph from "./formats/csvFormat"

type TerminalReadingsViewProps = {
  terminalOutput: TerminalOutput[];
  regex: RegExp;
};

const TerminalReadingsView = ({ terminalOutput, regex }: TerminalReadingsViewProps) => {
  const floatRegex = /^-?\d+(\.\d+)?$/
  const isFloatRegex = regex.toString() === floatRegex.toString()

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {isFloatRegex ? (
        <SingleFloat terminalOutput={terminalOutput} />
      ) : (
        <MultipleFloatsBarGraph terminalOutput={terminalOutput} />
      )}
    </View>
  )
}

export default TerminalReadingsView
