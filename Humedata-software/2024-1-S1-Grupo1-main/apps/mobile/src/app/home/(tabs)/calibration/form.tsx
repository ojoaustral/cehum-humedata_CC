import React, { useState, useEffect } from "react"
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform } from "react-native"
import { Button } from "@/components/Button"
import { Select } from "@/components/Select"
import { Peripheral } from "react-native-ble-manager"
import { initializeBluetooth, requestPermissions, startScan, addListenerForDevices, connectToDevice } from "@/utils/android_bluetooth"
import SerialScreen from "./serial"
import useStore from "@/utils/useStore"

type setForm = (value: boolean) => void

type FormScreenProps = {
  setForm: setForm,
}


const FormScreen = ({ setForm }: FormScreenProps) => {
  const currentSensor = useStore((state) => state.currentSensor)
  const device = useStore((state) => state.currentBluetoothDevice)
  const sensors = useStore((state) => state.sensors)
  const setCurrentSensor = useStore((state) => state.setCurrentSensor)
  const storeDevice = useStore((state) => state.currentBluetoothDevice)
  const setStoreDevice = useStore((state) => state.setCurrentBluetoothDevice)
  const [error, setError] = useState<boolean>(false)
  const [permissionError, setPermissionError] = useState<boolean>(false)
  const [devices, setDevices] = useState<Peripheral[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isSerial, setSerial] = useState(false)
  const sensorTypes = sensors.map((sensor) => {
    return {
      label: sensor.name,
      value: sensor
    }
  })
  const mapDevices = devices.map((device) => {
    return {
      label: device.name || "Unknown",
      value: device,
      id: device.id
    }
  })

  useEffect(() => {
    initializeBluetooth()
    requestPermissions().then(granted => {
      setPermissionError(!granted)
    })

    addListenerForDevices(setDevices)
  }, [])

  const handleScan = () => {
    setIsScanning(true)
    startScan(setDevices, setError)
    setTimeout(() => setIsScanning(false), 5000)
  }

  const handleSelectDevice = (device: Peripheral) => {
    setStoreDevice(device)
  }

  const handleCalibrate = () => {
    if (device?.id) {
      connectToDevice(device, setError, setForm)
    }
  }

  const handleSerial = () => {
    if (currentSensor){
      setSerial(true)
    }
  }


  if (permissionError) {
    return (
      <View className="flex justify-center p-7 h-96">
        <Text className="text-xl font-bold text-center">Los permisos de Bluetooth no fueron otorgados</Text>
        <Text className="text-xl font-bold mt-4 text-center">Por favor, otorgue los permisos necesarios y reinicie la aplicación.</Text>
      </View>
    )
  }

  if (isSerial && Platform.OS === "android" ) {
    return <SerialScreen setForm={setForm} setSerial={setSerial} />
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Calibración</Text>

        <Select
          label="Tipo de sensor"
          options={sensorTypes}
          onSelect={(selectedSensor) => setCurrentSensor(selectedSensor)}
          placeholder="Seleccione un tipo de sensor"
          defaultValue={currentSensor?.name}
        />

        <Select
          className="pt-4 mb-4"
          label={`Dispositivos Bluetooth (${devices.length})`}
          options={mapDevices}
          onSelect={(selectedDevice) => handleSelectDevice(selectedDevice)}
          placeholder={device?.name || "Seleccione un dispositivo"}
          defaultValue={device?.name}
        />

        <View className="items-center">
          {
            device && (
              <Button
                label="Calibrar"
                className="w-1/2 mt-2 rounded-full h-12 primary"
                onPress={() => { handleCalibrate() }}
                disabled={!currentSensor}
              />
            )
          }
          <Button
            label="Buscar dispositivos"
            variant={isScanning || device ? "gray" : "default"}
            className={`w-1/2 mt-2 rounded-full h-12`}
            onPress={handleScan}
            disabled={isScanning}
          />

          {
            Platform.OS == "android" &&
            <Button
              label="Serial USB"
              variant={`${isScanning || !currentSensor ? "gray" : "green"}`}
              className={`w-1/2 mt-2 rounded-full h-12`}
              onPress={() => handleSerial()}
              disabled={isScanning || !currentSensor}
            />
          }
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    textAlign: "left",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  }
})

export default FormScreen
