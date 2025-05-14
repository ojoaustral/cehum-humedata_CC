import React, {useState, useEffect} from "react";
import {View, Text, Alert, ScrollView} from "react-native";
import { Select } from "@/components/Select"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import useStore, {Sensor} from "@/utils/useStore";
import { router } from "expo-router";
import {CommandList} from "@/components/CommandList"
import { CsvHeaderList } from "@/components/CsvHeaderList";

export default function SensorConfiguration() {
  const currentSensor = useStore((state) => state.currentSensor)
  const sensors = useStore((state) => state.sensors)
  const [tempSensor, setTempSensor] = useState<Sensor | null>(currentSensor)
  const updateSensor = useStore((state) => state.updateSensor)
  const addSensor = useStore((state) => state.addSensor)
  const deleteSensor = useStore((state) => state.deleteSensor)

  const isNew = () => {
    return sensors.findIndex((sensor) => sensor.name === tempSensor?.name) === -1
  }

  const handleInputChange = (field: keyof Sensor, value: string) => {
    if (tempSensor) {
      setTempSensor({ ...tempSensor, [field]: value });
    }
  };

  useEffect(() => {
    setTempSensor(currentSensor)
  }, [currentSensor])

  const handleSave = () => {
    if (tempSensor) {
      if (isNew()) {
        addSensor(tempSensor)
      } else {
        updateSensor(tempSensor)
      }
      router.back()
    }
  };

  const handleDelete = () => {
    Alert.alert("¿Estás seguro?", `Esto eliminará el sensor ${tempSensor?.name}`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          if (tempSensor) {
            deleteSensor(tempSensor);
            router.back()
          }
        },
      },
    ]);
  }

  return (
    <ScrollView className="p-10">
      <Text className="text-4xl text-primary">{currentSensor?.name}</Text>
      <View className="border border-primary rounded mt-5" />
      <View>
        {
          isNew() && 
          <Input
            label="Nombre"
            value={tempSensor?.name}
            onChangeText={(value) => handleInputChange("name", value)}
          />
        }
        <Input
          label="Prefijo"
          value={tempSensor?.prefix}
          onChangeText={(value) => handleInputChange("prefix", value)}
        />
        <ScrollView>
          <Select
            label="Formato de lectura"
            onSelect={(value: string) => handleInputChange("readingFormat", value)}
            options={[
              { label: "Float", value: "float" },
              { label: "CSV", value: "csv" },
            ]}
            placeholder={tempSensor?.readingFormat|| "Seleccione un dispositivo"}
            defaultValue={tempSensor?.readingFormat}
          />
        </ScrollView>
      </View>

      <ScrollView>
        <View className="border border-primary rounded mt-5" />
        <Text className="text-2xl text-primary">Comandos</Text>
        <CommandList/>
      </ScrollView>

      <ScrollView>
        <View className="border border-primary rounded mt-5" />
        <Text className="text-2xl text-primary">Columnas CSV</Text>
        <CsvHeaderList/>
      </ScrollView>

      <View className="border border-primary rounded mt-5" />
      <View className="flex justify-center items-center mt-10 mb-20">
        <Button label="Guardar" onPress={handleSave} className="mt-2 w-1/2"/>
        <Button label="Eliminar sensor" onPress={handleDelete} className="bg-red-400 w-1/2 mt-2"/>
        <Button label="Volver" onPress={()=>router.back()} className="bg-secondary mt-2 w-1/2"/>
      </View>
    </ScrollView>
  )
}
