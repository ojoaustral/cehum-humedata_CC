import React from "react"
import { View, Dimensions } from "react-native"
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme } from "victory-native"
import { TerminalOutput } from "@/components/Terminal"

type TerminalReadingsViewProps = {
  terminalOutput: TerminalOutput[];
};

const SingleFloat = ({ terminalOutput }: TerminalReadingsViewProps) => {
  const data = terminalOutput
    .map(output => ({
      x: output.timestamp,
      y: parseFloat(output.command)
    }))

  return (
    <View className="">
      <VictoryChart theme={VictoryTheme.material} scale={{ x: "time" }}
        width={Dimensions.get("window").width * 0.8}
        height={300}
      >
        <VictoryAxis 
          tickFormat={(t) => `${t.getSeconds()}`} // Format the time axis
        />
        <VictoryAxis dependentAxis />
        <VictoryLine 
          data={data}
          style={{
            data: { stroke: "#c43a31" }
          }}
        />
      </VictoryChart>
    </View>
  )
}

export default SingleFloat
