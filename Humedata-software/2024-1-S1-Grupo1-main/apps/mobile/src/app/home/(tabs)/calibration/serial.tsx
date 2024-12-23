import React, { useState, useEffect } from "react"
import { Alert, Platform } from "react-native"
import Terminal, { TerminalOutput } from "@/components/Terminal"
import { convertHexToString, convertStringToHex } from "@/utils/string_helpers"
import useStore from "@/utils/useStore"

type SerialScreenProps = {
  setSerial: (value: boolean) => void
}

const SerialScreen = ({ setSerial }: SerialScreenProps) => {
  let  UsbSerialManager: any, Parity: any;
  if (Platform.OS == 'android'){
    ({ UsbSerialManager, Parity }= require("react-native-usb-serialport-for-android"))
  }
  const [hasPermission, setHasPermission] = useState(false)
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([])
  const [usbSerial, setUsbSerial] = useState<any>()
  const currentSensor = useStore((state) => state.currentSensor)
  const baudRate = useStore((state) => state.baudRate)

  useEffect(() => {
    if (!usbSerial) {
      requestUSBPermission()
    }
  }, [])

  const handleReceive = (data: any) => {
    setTerminalOutput(prevOutput => [
      ...prevOutput,
      { command: convertHexToString(data?.data), type: "receive", timestamp: new Date() }
    ])
  }

  const handleBack = () => {
    if (usbSerial) {
      usbSerial.close()
    }
    setSerial(false)
  }

  async function sendData(command: string) {
    if (usbSerial && command !== "") {
      try {
        setTerminalOutput(prevOutput => [
          ...prevOutput,
          { command: command, type: "send" }
        ])
        const sensorCommand = currentSensor?.prefix + command
        const hexStr = convertStringToHex(sensorCommand)
        await usbSerial.send(hexStr)
      } catch (e) {
        console.error(e);
      }
    }
  }

  async function requestUSBPermission() {
    try {
      const devices = await UsbSerialManager.list()
      if (devices.length === 0) {
        Alert.alert("No hay dispositivos USB conectados")
        handleBack()
        return
      }
      const device = devices[0]
      if (!device) {
        Alert.alert("No se puede obtener el ID del dispositivo USB")
        handleBack()
        return
      }
      const granted = await UsbSerialManager.tryRequestPermission(device.deviceId)
      if (granted) {
        setHasPermission(true)
        const usbSerialport = await UsbSerialManager.open(device.deviceId, { baudRate: baudRate, parity: Parity.None, dataBits: 8, stopBits: 1 })
        usbSerialport.onReceived((data: any) => {
          console.log("received", data)
          handleReceive(data)
        })

        setUsbSerial(usbSerialport)
      } else {
        setSerial(false)
        Alert.alert("USB permission denied")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Terminal
      hasPermission={hasPermission}
      onSend={sendData}
      terminalOutput={terminalOutput}
      setTerminalOutput={setTerminalOutput}
      name="Terminal USB"
      onBack={handleBack}
    />
  )
}

export default SerialScreen
