import React from "react"
import { View, Dimensions } from "react-native"
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from "victory-native"
import { TerminalOutput } from "@/components/Terminal"
import useStore from "@/utils/useStore"

type TerminalReadingsViewProps = {
  terminalOutput: TerminalOutput[];
};

const LatestEntryBarGraph = ({ terminalOutput }: TerminalReadingsViewProps) => {
  const currentSensor = useStore((state) => state.currentSensor)
  const latestEntry = terminalOutput[terminalOutput.length - 1]
  const data = latestEntry?.command.split(",").map((val, index) => ({
    x: index + 1,
    y: parseFloat(val)
  }))

  // Determine tick values based on the length of the CSV data
  const tickValues = data?.map((_, index) => index + 1)

  const getColumnName = (index: number) => {
    return currentSensor?.csvHeaders[index]?.name || `Col ${index + 1}`
  }

  if (!data || !currentSensor) {
    return null
  }

  return (
    <View>
      <VictoryChart 
        theme={VictoryTheme.material}
        width={Dimensions.get("window").width * 0.8}
        height={300}
        domainPadding={{ x: 20 }}
      >
        <VictoryAxis 
          tickCount={data?.length} // Set the tick count to the length of the CSV data
          tickValues={tickValues} // Use the generated tick values
          tickFormat={(t) => getColumnName(t-1)} // Format the x-axis to show value index
        />
        <VictoryAxis dependentAxis />
        <VictoryBar 
          data={data}
          style={{
            data: { fill: "#c43a31" }
          }}
        />
      </VictoryChart>
    </View>
  )
}

export default LatestEntryBarGraph
