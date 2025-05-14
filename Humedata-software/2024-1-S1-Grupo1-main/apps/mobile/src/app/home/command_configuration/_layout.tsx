import React, {useState, useEffect} from "react";
import {View, Text, Alert } from "react-native";
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import useStore from "@/utils/useStore";
import { router } from "expo-router";
import { CustomCommand } from "@/utils/useStore";

export default function SensorConfiguration() {
  const currentSensor = useStore((state) => state.currentSensor)
  const currentCommand = useStore((state) => state.selectedCommand)
  const sensorCommands = useStore((state) => state.sensorCommands())
  const [tempCommand, setTempCommand] = useState<CustomCommand | null>(currentCommand)
  const addCustomCommand = useStore((state) => state.addCustomCommand)
  const editCustomCommand = useStore((state) => state.editCustomCommand)
  const deleteCustomCommand = useStore((state) => state.deleteCustomCommand)

  if (!currentCommand || !currentSensor) {
    router.back()
    return null
  }

  const isNew = () => {
    return sensorCommands.find((cmd) => cmd.name === tempCommand?.name) === undefined
  }

  const handleInputChange = (field: keyof CustomCommand, value: string) => {
    if (tempCommand) {
      setTempCommand({ ...tempCommand, [field]: value });
    }
  };

  useEffect(() => {
    setTempCommand(currentCommand)
  }, [currentCommand])

  const handleSave = () => {
    if (tempCommand) {
      if (isNew()) {
        addCustomCommand(currentSensor, tempCommand)
      } else {
        editCustomCommand(currentSensor, tempCommand)
      }
      router.back()
    }
  };

  const handleDelete = () => {
    Alert.alert("¿Estás seguro?", `Esto eliminará el comando ${tempCommand?.name} (${currentSensor?.name})`, [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          if (tempCommand) {
            deleteCustomCommand(currentSensor, tempCommand)
            router.back()
          }
        },
      },
    ]);
  }

  return (
    <View className="p-10">
      <Text className="text-4xl text-primary">{currentCommand?.name} ({currentSensor?.name})</Text>
      <View className="mt-5" />
      <View>
        {
          isNew() && 
          <Input
            label="Nombre"
            value={tempCommand?.name}
            onChangeText={(value) => handleInputChange("name", value)}
          />
        }
        <Input
          label="Valor (sin prefijo)"
          value={tempCommand?.value}
          onChangeText={(value) => handleInputChange("value", value)}
        />
      </View>

      <View className="border border-primary rounded mt-5" />
      <View className="flex justify-center items-center mt-10"  >
        <Button label="Guardar" onPress={handleSave} className="mt-2 w-1/2"/>
        <Button label="Eliminar comando" onPress={handleDelete} className="bg-red-400 w-1/2 mt-2"/>
        <Button label="Volver" onPress={()=>router.back()} className="bg-secondary mt-2 w-1/2"/>
      </View>
    </View>
  )
}

