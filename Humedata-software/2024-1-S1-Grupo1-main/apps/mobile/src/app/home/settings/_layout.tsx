import { View, Text } from "react-native"
import { Button } from "@/components/Button"

export default function ConfigurationScreen() {
  return (
    <View className="flex flex-col justify-center text-center items-center gap-4">
      <Text className="text-4xl text-primary">Configuracion</Text>
      <Button label="Hola Cuenta" />
    </View>
  )
}



