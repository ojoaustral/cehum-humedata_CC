import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Button } from "@/components/Button"
import { Select } from "@/components/Select"
import Chart from "./chart"
import { DateSelect } from "@/components/DateSelect"
import useStore from "@/utils/useStore"

type VisualizationProps = {
  setShowMap: (showMap: boolean) => void;
  zoneSelectedId: number;
}

export default function Visualization({ setShowMap, zoneSelectedId }: VisualizationProps) {
  const ChartData = useStore((state) => state.chartData)
  const [dataType, setDataType] = useState("")
  const [isLine, setIsLine] = useState(true)
  const handleGoBack = () => {
    setShowMap(true)
  }
  console.log(ChartData)

  const [dateStart, setDateStart] = useState()
  const [dateEnd, setDateEnd] = useState()

  if (!ChartData) {
    return null
  }

  return (
    <View className="bg-white h-full">
      <ScrollView className="flex">
        <View className="flex justify-center text-center items-center gap-4">
          <Text className="text-2xl mt-5">Visualización de datos</Text>

          <Select
            className="w-96 items-center mt-5"
            placeholder="Tipo de dato"
            options={ChartData.map((data) => ({ label: data.label, value: data.trpcKey }))}
            onSelect={setDataType}
          />
        </View>
        <View className="flex justify-center text-center items-center gap-4">
          <View style={styles.graphPlaceHolder}>
            <Chart dateStart={dateStart} dateEnd={dateEnd} dataType={dataType} zoneIds={[zoneSelectedId]} isLine={isLine}/>
          </View>
          <View className="flex flex-row gap-24 pl-5 pr-5">
            <DateSelect label="Fecha de inicio" onSelect={setDateStart}/>
            <DateSelect label="Fecha de término" onSelect={setDateEnd}/>
          </View>
          
          <Button
            label={isLine ? "Barras" : "Línea"}
            variant="green"
            className="w-1/2 mt-10 rounded-full h-12 secondary"
            onPress={() => setIsLine(!isLine)}
          />
          

          <Button
            label="Volver"
            variant="default"
            className="w-1/2 rounded-full h-12 secondary"
            onPress={handleGoBack}
          />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  graphPlaceHolder: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    height: 300,
  }
})
