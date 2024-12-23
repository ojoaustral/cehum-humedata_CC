// BluetoothService.js
import { PermissionsAndroid, Platform, NativeModules, NativeEventEmitter, Permission } from "react-native"
import BleManager, { Peripheral, PeripheralInfo, Characteristic, Descriptor } from "react-native-ble-manager"
import { Dispatch, SetStateAction } from "react"
import { stringToByteArray, byteArrayToString } from "@/utils/string_helpers"

export type ReceiveData = {
  characteristic: string;
  peripheral: string;
  service: string;
  value: number[];
}

const BleManagerModule = NativeModules.BleManager
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule)

export type SetError = (error: boolean) => void
type setTrue = (value: boolean) => void
type setDeviceInfo = (value: PeripheralInfo) => void
type setDescriptors = (value: Descriptor[]) => void

export const initializeBluetooth = () => {
  BleManager.start({ showAlert: true })
}

export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "android" && Platform.Version >= 23) {
    const permissions: (Permission | undefined)[] = [
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]

    if (Platform.Version >= 31) {
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      )
    }

    const filteredPermissions: Permission[] = permissions.filter((p): p is Permission => p !== undefined)
    const result = await PermissionsAndroid.requestMultiple(filteredPermissions)
    return filteredPermissions.every(p => result[p] === PermissionsAndroid.RESULTS.GRANTED)
  }

  return true
}

export const startScan = (setDevices: Dispatch<SetStateAction<Peripheral[]>>, setError: SetError) => {
  BleManager.scan([], 5, true).then(() => {
    console.log("Scanning...")
    setDevices([])
  }).catch(err => {
    console.error(err)
    console.log("Error scanning")
    setError(true)
  })
}

export const addListenerForDevices = (setDevices: Dispatch<SetStateAction<Peripheral[]>>) => {
  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    if (peripheral.name) {
      setDevices((prevDevices: Peripheral[]) => {
        const deviceExists = prevDevices.some((device: Peripheral) => device.id == peripheral.id)
        if (!deviceExists) {
          return [...prevDevices, peripheral]
        }
        return prevDevices
      })
    }
  }

  bleManagerEmitter.addListener("BleManagerDiscoverPeripheral", handleDiscoverPeripheral)
  return () => bleManagerEmitter.removeAllListeners("BleManagerDiscoverPeripheral")
}

export const connectToDevice = (device: Peripheral, setError: SetError, setTrue: setTrue) => {
  console.log("Connecting to device", device.name)
  BleManager.connect(device.id).then(() => {
    setTrue(false)
  }).catch(err => {
    console.error(err, "al conectar")
    setError(true)
  })
}

export const disconnectDevice = (device: Peripheral, setError: SetError, setTrue: setTrue) => {
  BleManager.disconnect(device.id).then(() => {
    console.log("Disconnected from device")
    setTrue(true)
  }).catch(err => {
    console.error(err)
    setError(true)
  })
}

export const writeData = (device: Peripheral, serviceUUID: string, characteristicUUID: string, data: number[], setError: SetError) => {
  BleManager.write(device.id, serviceUUID, characteristicUUID, data).then(() => {
    const decodedData = byteArrayToString(data)
    // console.log("Data written:", data, JSON.stringify(decodedData))
  }).catch(err => {
    console.error(err)
    setError(true)
  })
}

export const readData = (device: Peripheral, serviceUUID: string, characteristicUUID: string, setError: SetError) => {
  BleManager.read(device.id, serviceUUID, characteristicUUID).then(() => {
    console.log("Data read")
  }).catch(err => {
    console.error(err)
    setError(true)
  })
}

export const readDescriptors = (device: Peripheral, characteristics: Characteristic[], setDescriptors: setDescriptors) => {
  characteristics.forEach(characteristic => {
    const descriptors = characteristic.descriptors
    if (!descriptors) return

    setDescriptors([])
    descriptors.forEach(descriptor => {
      BleManager.readDescriptor(device.id, characteristic.service, characteristic.characteristic, descriptor.uuid).then(() => {
        setDescriptors([...descriptors, descriptor])
      }).catch(err => {
        console.error(err)
      })
    })
    console.log("Descriptor read", descriptors)
  })
}

export const discoverServicesAndCharacteristics = async (device: Peripheral, setError: SetError, setDeviceInfo: setDeviceInfo) => {
  try {
    await BleManager.connect(device.id)
    const info = await BleManager.retrieveServices(device.id)
    if (info) {
      setDeviceInfo(info)
      console.log("Conectado a dispositivo")
    }
    return info
  } catch (error) {
    console.error(error)
    setError(true)
  }
}
