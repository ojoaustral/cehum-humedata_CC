import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { writeData, discoverServicesAndCharacteristics, disconnectDevice, ReceiveData } from "@/utils/android_bluetooth"
import BleManager, { PeripheralInfo, Service, Characteristic } from "react-native-ble-manager"
import Terminal, { TerminalOutput } from "@/components/Terminal"
import { Spinner } from "@/components/Spinner"
import { stringToByteArray, byteArrayToString } from "@/utils/string_helpers"
import { NativeEventEmitter, NativeModules } from "react-native"
import useStore from "@/utils/useStore"
import { Button } from "@/components/Button"

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

type CalibrationModuleProps = {
  setForm: (value: boolean) => void,
  setSuccess: (value: boolean) => void,
}

type SubViewProps = {
  setError: (value: boolean) => void,
  selectedService: Service,
  characteristics: Characteristic[]
  handleBack: () => void
}

const TerminalView = ({ setError, selectedService, characteristics, handleBack }: SubViewProps) => {
  const device = useStore((state) => state.currentBluetoothDevice)
  const currentSensor = useStore((state) => state.currentSensor)
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([
    {
      command: "Device connected",
      type: "receive",
      timestamp: new Date()
    }
  ])
  const getNotifyCharacteristic = () => {
    if (characteristics) {
      return characteristics.filter(char => char.properties.Notify)[0]
    }
  }
  const getWriteableCharacteristics = () => {
    if (characteristics) {
      return characteristics.filter(char => char.properties.Write)[0]
    }
  }
  const [notifyCharacteristic, setNotifyCharacteristic] = useState<Characteristic | undefined>(getNotifyCharacteristic())
  const [writeableCharacteristic, setWriteableCharacteristic] = useState<Characteristic | undefined>(getWriteableCharacteristics())


  useEffect(() => {
    if (notifyCharacteristic && notifyCharacteristic.properties.Notify && device) {
      BleManager.startNotification(device?.id, selectedService.uuid, notifyCharacteristic.characteristic).then(() => {
        console.log("Notification started")
      }).catch((error) => {
        console.error("Notification start error", error)
        setError(true)
      })
    }

    const handleUpdateValueForCharacteristic = (data: ReceiveData) => {
      const parsedData = byteArrayToString(data.value).replace("\n", "").replace("\r", "")
      setTerminalOutput(prevOutput => [
        ...prevOutput,
        { command: parsedData, type: "receive", timestamp: new Date()}
      ])
    }

    bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic", handleUpdateValueForCharacteristic)

    return () => {
      bleManagerEmitter.removeAllListeners("BleManagerDidUpdateValueForCharacteristic")
      if (notifyCharacteristic && notifyCharacteristic.properties.Notify && device) {
        BleManager.stopNotification(device?.id, selectedService.uuid, notifyCharacteristic.characteristic).then(() => {
          console.log("Notification stopped")
        }).catch((error) => {
          console.error("Notification stop error", error)
        })
      }
    }
  }, [device?.id, selectedService.uuid, notifyCharacteristic])

  const handleSend = (command: string) => {
    if (device && selectedService && writeableCharacteristic) {
      const sensorCommand = currentSensor?.prefix + command + "\n"

      const hexCommand = stringToByteArray(sensorCommand)
      writeData(device, selectedService.uuid, writeableCharacteristic.characteristic, hexCommand, setError)
    }
  }

  return (
    <View className="flex-1 justify-center">
      <Terminal
        hasPermission={true}
        onSend={(command) => handleSend(command)}
        onClear={() => console.log("Clear")}
        terminalOutput={terminalOutput}
        setTerminalOutput={setTerminalOutput}
        name={`Terminal ${device?.name}`}
        onBack={handleBack}
      />
    </View>
  )
}

const CalibrationModule = ({ setForm }: CalibrationModuleProps) => {
  const [loading, setLoading] = useState<boolean>(true)
  const [_, setError] = useState<boolean>(false)
  const [deviceInfo, setDeviceInfo] = useState<PeripheralInfo | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const device = useStore((state) => state.currentBluetoothDevice)
  const setStoreDevice = useStore((state) => state.setCurrentBluetoothDevice)

  const services = deviceInfo?.services || []

  const serviceCharacteristics = (service: Service) => {
    if (deviceInfo && deviceInfo.characteristics) {
      return deviceInfo.characteristics.filter(char => char.service === service.uuid)
    }
    return []
  }

  const handleDisconnect = () => {
    setStoreDevice(null)
    if (device)
      disconnectDevice(device, setError, setForm)
  }

  useEffect(() => {
    if (device)
      discoverServicesAndCharacteristics(device, setError, setDeviceInfo)
  }, [])

  useEffect(() => {
    setLoading(true)
    if (!selectedService && services.length > 0) {
      const possibleServices = services.filter(service => {
        const characteristics = serviceCharacteristics(service)
        setLoading(false)
        return characteristics.some(char => char.properties.Notify || char.properties.Write)
      })
      if (possibleServices.length > 0) {
        setSelectedService(possibleServices[0] || null)
        setLoading(false)
      }
    }
  }, [deviceInfo])

  if (loading) {
    return <Spinner />
  }

  return (
    <View className="flex-1 px-5 pb-5">
      {selectedService ?
        <>
          <TerminalView 
            setError={setError}
            selectedService={selectedService}
            characteristics={serviceCharacteristics(selectedService)} 
            handleBack={() => handleDisconnect()}
          /> 
        </>
        : <ScrollView >
          <Text className="text-center text-3xl mb-4">Seleccione un servicio para continuar</Text>
          <Text className="text-center text-xl mb-4">Servicios disponibles ({services.length})</Text>
          {services.map((service, index) => (
            <Pressable
              key={index}
              className="p-4 mb-2 border rounded bg-gray-100"
              onPress={() => setSelectedService(service)}
            >
              <Text className="text-lg font-semibold">Service UUID: {service.uuid}</Text>
              <Text className="text-sm text-gray-500">Characteristics:</Text>
              {serviceCharacteristics(service).map((char, charIndex) => (
                <Text key={charIndex} className="text-sm text-gray-500">- {char.properties.Read}{char.properties.Write}{char.properties.Notify}{char.properties.Indicate}</Text>
              ))}
            </Pressable>
          ))}
          {services.length === 0 && <Button label="Desconectar" onPress={handleDisconnect} className="w-1/2 mt-2 rounded-full h-12 primary" />}
        </ScrollView>}
    </View>
  )
}

export default CalibrationModule
