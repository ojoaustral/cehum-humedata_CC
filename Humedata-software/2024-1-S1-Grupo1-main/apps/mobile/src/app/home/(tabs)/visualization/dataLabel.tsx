import React, { useState } from "react"
import { View, Text, StyleSheet, TextInput } from "react-native"
import { Button } from "@/components/Button"
import { Select } from "@/components/Select"
import { Input } from "@/components/Input"

export default function DataLabel({ setShowMap, showDataLabel }) {
  const [dataType, setDataType] = useState("temperature")
  const handleGoBack = () => {
    setShowMap(false)
    showDataLabel(false)
  }

  return (
    <View className="flex justify-center text-center items-center gap-4">
      <Button
        label="Volver a datos"
        variant="secondary"
        className="w-1/2 mt-2 rounded-full h-12 secondary"
        onPress={handleGoBack}
      />
      <Select
        className="w-1/2 mt-2 rounded-full h-12 secondary"
        placeholder="Elegir tipo de dato"
        options={[
          { label: "Temperatura", value: "temperature" },
          { label: "Humedad", value: "humidity" },
          { label: "Presión", value: "pressure" },
        ]}
        onSelect={setDataType}
      />
      <View className="flex flex-row gap-16 justify-center mt-10">
        <Text className="text-xl mb-24">Fecha de inicio</Text>
        <Input placeholder="Fecha de inicio" type="date" />
      </View>
      <View className="flex flex-row gap-16 justify-center">
        <Text className="text-xl mb-24">Fecha de termino</Text>
        <Input placeholder="Fecha de termino" type="date" />
      </View>
      <Select
        className="w-1/2 mt-2 rounded-full h-12 secondary"
        label="Elegir etiqueta"
        options={[
          { label: "Normal", value: "normal" },
          { label: "Anormal", value: "anormal" },
        ]}
        onSelect={setDataType}
      />
      <TextInput
        placeholder="Notas"
        className="w-96 min-w-80 h-24 border border-slate-300 mt-10"
      />
      <Button
        label="Guardar"
        variant="secondary"
        className="w-1/2 mt-2 rounded-full h-12 secondary"
        onPress={handleGoBack}
      />
    </View>
  )
}
