import { View, Text, Alert, ScrollView } from "react-native"
import useStore from "@/utils/useStore"
import { Button } from "@/components/Button"
import {SensorList} from "@/components/SensorList"
import { router } from "expo-router"
import { TextInput } from "react-native";

export default function ConfigurationScreen() {
  const baudRate = useStore((state) => state.baudRate);
  const setBaudRate = useStore((state) => state.setBaudRate)
  const resetStore = useStore((state) => state.resetStore)
  const handleReset= () => {
    resetStore()
    router.navigate("/home")
  }
  const handleResetStore = () => {
    Alert.alert("¿Estás seguro?", "Esto eliminará todas las configuraciones guardadas", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: handleReset,
      },
    ])
  }
  return (
    <ScrollView className="bg-white">
      <View className="flex flex-col justify-center text-center items-center gap-4">
        <Text className="text-3xl font-semibold mt-5">Configuración</Text>
      </View>
      <View className="border border-gray-500 rounded mt-5" />
      <View className="p-5 mb-5">
        <Text className="text-2xl font-semibold text-primary">Sensores</Text>
        <View className="justify-center items-center ml-5">
          <SensorList/>
        </View>
      </View>
      <View className="border border-gray-500 rounded" />
      <View className="flex flex-col gap-4">
        <Text className="text-2xl text-primary font-semibold ml-5">Baudrate serial</Text>
        <View className="items-center">
          <TextInput
            className="border p-2 rounded"
            placeholder="Serial Baudrate"
            keyboardType="numeric"
            value={baudRate.toString()}
            onChangeText={(text) => setBaudRate(Number(text))}
          />
        </View>
      </View>
      <View className="border border-gray-500 rounded mt-5" />
      <View className="flex justify-center items-center">
        <Button onPress={handleResetStore} label="Reiniciar configuración" className="bg-red-400 w-1/2 mt-10"/>
        <Button onPress={()=>router.back()} label="Volver" variant="default" className=" w-1/2 mt-2"/>
      </View>
    </ScrollView>
  )
}

