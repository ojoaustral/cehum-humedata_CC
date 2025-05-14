import React, { useState } from "react"
import { View, Text, ScrollView } from "react-native"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import useStore, {CustomCommand} from "@/utils/useStore"
import { Select } from "@/components/Select"
import {router} from "expo-router"

export default function RepetableCommand() {
  const currentSensor = useStore((state) => state.currentSensor)
  const customCommands = useStore((state) => state.customCommands)
  const sensorCommands = customCommands[currentSensor?.name || ""] || []
  const repeatableDuration = useStore((state) => state.repeatableDuration)
  const repeatableInterval = useStore((state) => state.repeatableInterval)
  const setRepeatableDuration = useStore((state) => state.setRepeatableDuration)
  const setRepeatableInterval = useStore((state) => state.setRepeatableInterval)
  const changeRepeatableCommand = useStore((state) => state.changeRepeatableCommand)
  const [repeatableCommand, setRepeatableCommand] = useState<CustomCommand | null>(sensorCommands.filter((cmd) => cmd.repeatable)[0] || null)

  if (!currentSensor || !repeatableCommand) {
    return (
      <View className="flex flex-col justify-center text-center items-center gap-4">
        <Text className="text-4xl text-primary">Hubo un error</Text>
        <Text className="text-xl">Por favor, vuelva a seleccionar un sensor</Text>
        <Button label="Volver" onPress={()=>router.back()}/>
      </View>
    )
  }

  const handleDurationChange = (text: string) => {
    const value = parseInt(text)
    if (!isNaN(value)) {
      setRepeatableDuration(value * 1000)
    } else {
      setRepeatableDuration(0)
    }
  }
  const handleIntervalChange = (text: string) => {
    const value = parseInt(text)
    if (!isNaN(value)) {
      setRepeatableInterval(value * 1000)
    } else {
      setRepeatableInterval(0)
    }
  }

  const handleCommandChange = (cmd: CustomCommand) => {
    setRepeatableCommand(cmd)
    changeRepeatableCommand(currentSensor.name, cmd)
  }

  return (
    <View className="flex flex-col justify-center text-center items-center gap-4">
      <Text className="text-4xl text-primary">Comando de lectura: {currentSensor.name}</Text>
      <Text className="text-xl">Comando Repetibe</Text>
      <ScrollView className="w-20">
        <Select
          options={sensorCommands.map((cmd) => ({ label: cmd.name, value: cmd }))}
          placeholder="Seleccione un tipo de sensor"
          defaultValue={repeatableCommand.name}
          onSelect={(cmd) => handleCommandChange(cmd)}
        />
      </ScrollView>
      <Input label="Duración (s)" value={`${repeatableDuration/1000}`} onChangeText={handleDurationChange} numeric/>
      <Text>(0s para duración indefinida)</Text>
      <Input label="Intervalo (s)" value={`${repeatableInterval/1000}`} onChangeText={handleIntervalChange} numeric/>
      <Button label="Guardar y volver" onPress={()=> router.back()} />
    </View>
  )
}




