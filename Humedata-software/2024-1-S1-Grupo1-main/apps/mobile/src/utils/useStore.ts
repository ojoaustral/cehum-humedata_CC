import { create } from "zustand"
import * as SecureStore from "expo-secure-store"
import {defaultSensors, defaultCustomCommands, defaultRepeatableDuration, defaultRepeatableInterval, defaultBaudRate, defaultChartData} from "./defaultStoreValues"
import { Peripheral } from "react-native-ble-manager"

export type CsvHeader = {
  id: number;
  name: string;
}
export type dataFormat = "float" | "csv";

export type Sensor = {
  name: string;
  prefix: string;
  readingFormat: dataFormat;
  csvHeaders: CsvHeader[];
};

export type ChartData = {
  label: string;
  trpcKey: string;
  minY?: number;
  maxY?: number;
}

export type CustomCommand = {
  name: string;
  value: string;
  repeatable?: boolean;
};

type Store = {
  floatRegex: RegExp;
  csvRegex: RegExp;
  currentBluetoothDevice: Peripheral | null;
  setCurrentBluetoothDevice: (device: Peripheral | null) => void;

  chartData: ChartData[];
  setChartData: (data: ChartData[]) => void;

  currentSensor: Sensor | null;
  setCurrentSensor: (sensor: Sensor) => void;
  sensors: Sensor[];
  addSensor: (sensor: Sensor) => void;
  updateSensor: (sensor: Sensor) => void;
  deleteSensor: (sensor: Sensor) => void;
  updateCsvHeader: (sensor: Sensor, csvHeaders: CsvHeader) => void;
  deleteCsvHeader: (sensor: Sensor, csvHeader: CsvHeader) => void;

  sensorCommands: () => CustomCommand[];
  selectedCommand: CustomCommand | null;
  setSelectedCommand: (command: CustomCommand | null) => void;

  repeatableDuration: number;
  setRepeatableDuration: (duration: number) => void;
  repeatableInterval: number;
  setRepeatableInterval: (interval: number) => void;

  customCommands: Record<string, CustomCommand[]>;
  addCustomCommand: (sensor: Sensor, command: CustomCommand) => void;
  editCustomCommand: (sensor: Sensor, command: CustomCommand) => void;
  deleteCustomCommand: (sensor: Sensor, command: CustomCommand) => void;
  changeRepeatableCommand: (sensorName: string, command: CustomCommand) => void;

  selectedCommandIndex: number | null;
  setSelectedCommandIndex: (index: number | null) => void;

  baudRate: number;
  setBaudRate: (rate: number) => void;

  initializeStore: () => Promise<void>;
  resetStore: () => void;
};

const useStore = create<Store>((set) => ({
  floatRegex: /^-?\d+(\.\d+)?$/,
  csvRegex: /^-?\d+(\.\d+)?(,-?\d+(\.\d+)?)*$/,
  currentBluetoothDevice: null,
  setCurrentBluetoothDevice: async (device: Peripheral | null) => {
    await SecureStore.setItemAsync("currentBluetoothDevice", JSON.stringify(device))
    set({ currentBluetoothDevice: device })
  },
  currentSensor: null,
  setCurrentSensor: async (sensor: Sensor) => {
    await SecureStore.setItemAsync("currentSensor", JSON.stringify(sensor))
    set({ currentSensor: sensor })
  },
  sensors: defaultSensors,
  addSensor: async (sensor: Sensor) => {
    set((state) => {
      const updatedSensors = [...state.sensors, sensor]
      SecureStore.setItemAsync("sensors", JSON.stringify(updatedSensors))
      return { sensors: updatedSensors }
    })
  },
  updateSensor: async (sensor: Sensor) => {
    set((state) => {
      const updatedSensors = state.sensors.map((s) => (s.name === sensor.name ? sensor : s))
      SecureStore.setItemAsync("sensors", JSON.stringify(updatedSensors))
      return { sensors: updatedSensors }
    })
  },
  deleteSensor: async (sensor: Sensor) => {
    set((state) => {
      const updatedSensors = state.sensors.filter((s) => s.name !== sensor.name)
      SecureStore.setItemAsync("sensors", JSON.stringify(updatedSensors))
      return { sensors: updatedSensors }
    })
  },
  updateCsvHeader: async (sensor: Sensor, csvHeader: CsvHeader) => {
    set((state) => {
      const updatedSensors = state.sensors.map((s) => {
        if (s.name === sensor.name) {
          const csvHeaderExists = s.csvHeaders?.some((h) => h.id === csvHeader.id);

          const updatedCsvHeaders = csvHeaderExists
            ? s.csvHeaders.map((h) => (h.id === csvHeader.id ? csvHeader : h))
            : [...(s.csvHeaders || []), csvHeader];

          return {
            ...s,
            csvHeaders: updatedCsvHeaders
          };
        }
        return s;
      });

      SecureStore.setItemAsync("sensors", JSON.stringify(updatedSensors));
      return { sensors: updatedSensors, currentSensor: updatedSensors.find((s) => s.name === sensor.name) };
    });
  },
  deleteCsvHeader: async (sensor: Sensor, csvHeader: CsvHeader) => {
    set((state) => {
      const updatedSensors = state.sensors.map((s) => {
        if (s.name === sensor.name) {
          const updatedCsvHeaders = (s.csvHeaders || []).filter((h) => h.id !== csvHeader.id);
          return {
            ...s,
            csvHeaders: updatedCsvHeaders
          };
        }
        return s;
      });

      SecureStore.setItemAsync("sensors", JSON.stringify(updatedSensors));
      return { sensors: updatedSensors, currentSensor: updatedSensors.find((s) => s.name === sensor.name) };
    });
  },
  sensorCommands: () => {
    const state: Store = useStore.getState()
    const sensor = state.currentSensor
    if (!sensor) {
      return []
    }
    return state.customCommands[sensor.name] || []
  },
  selectedCommand: null,
  setSelectedCommand: (command: CustomCommand | null) => set({ selectedCommand: command }),

  repeatableDuration: defaultRepeatableDuration,
  setRepeatableDuration: async (duration: number) => {
    await SecureStore.setItemAsync("repeatableDuration", duration.toString())
    set({ repeatableDuration: duration })
  },
  repeatableInterval: defaultRepeatableInterval,
  setRepeatableInterval: async (interval: number) => {
    await SecureStore.setItemAsync("repeatableInterval", interval.toString())
    set({ repeatableInterval: interval })
  },
  customCommands: defaultCustomCommands,
  addCustomCommand: async (sensor: Sensor, command: CustomCommand) => {
    set((state) => {
      const sensorName = sensor.name
      const commands = state.customCommands[sensorName] || []
      const updatedCommands = [...commands, command]
      SecureStore.setItemAsync("customCommands", JSON.stringify({ ...state.customCommands, [sensorName]: updatedCommands }))
      return { customCommands: { ...state.customCommands, [sensorName]: updatedCommands } }
    })
  },
  editCustomCommand: async (sensor: Sensor, command: CustomCommand) => {
    set((state) => {
      const sensorName = sensor.name
      const commands = state.customCommands[sensorName] || []
      const updatedCommands = commands.map((cmd) => (cmd.name === command.name ? command : cmd))
      SecureStore.setItemAsync("customCommands", JSON.stringify({ ...state.customCommands, [sensorName]: updatedCommands }))
      return { customCommands: { ...state.customCommands, [sensorName]: updatedCommands } }
    })
  },
  deleteCustomCommand: async (sensor: Sensor, command: CustomCommand) => {
    set((state) => {
      const sensorName = sensor.name
      const commands = state.customCommands[sensorName] || []
      const updatedCommands = commands.filter((cmd) => cmd.name !== command.name)
      SecureStore.setItemAsync("customCommands", JSON.stringify({ ...state.customCommands, [sensorName]: updatedCommands }))
      return { customCommands: { ...state.customCommands, [sensorName]: updatedCommands } }
    })
  },
  changeRepeatableCommand: async (sensorName: string, command: CustomCommand) => {
    set((state) => {
      const commands = state.customCommands[sensorName] || []
      const updatedCommands = commands.map((cmd) => ({
        ...cmd,
        repeatable: cmd === command,
      }))
      SecureStore.setItemAsync("customCommands", JSON.stringify({ ...state.customCommands, [sensorName]: updatedCommands }))
      return { customCommands: { ...state.customCommands, [sensorName]: updatedCommands } }
    })
  },

  chartData: defaultChartData,
  setChartData: (data: ChartData[]) => set({ chartData: data }),

  selectedCommandIndex: null,
  setSelectedCommandIndex: (index: number | null) => set({ selectedCommandIndex: index }),

  baudRate: defaultBaudRate,
  setBaudRate: async (rate: number) => {
    await SecureStore.setItemAsync("baudRate", rate.toString())
    set({ baudRate: rate })
  },

  initializeStore: async () => {
    const storedBluetoothDevice = await SecureStore.getItemAsync("currentBluetoothDevice")
    const storedSensor = await SecureStore.getItemAsync("currentSensor")
    const storedCustomCommands = await SecureStore.getItemAsync("customCommands")
    const storedBaudRate = await SecureStore.getItemAsync("baudRate")
    const storedSensors = await SecureStore.getItemAsync("sensors")
    // const storedChartData = await SecureStore.getItemAsync("chartData")

    set({
      currentBluetoothDevice: storedBluetoothDevice ? JSON.parse(storedBluetoothDevice) : null,
      currentSensor: storedSensor ? JSON.parse(storedSensor) : null,
      customCommands: storedCustomCommands ? JSON.parse(storedCustomCommands) : defaultCustomCommands,
      baudRate: storedBaudRate ? Number(storedBaudRate) : defaultBaudRate,
      sensors: storedSensors ? JSON.parse(storedSensors) : defaultSensors,
      // chartData: storedChartData ? JSON.parse(storedChartData) : defaultChartData,
    })
  },
  resetStore: () => {
    SecureStore.deleteItemAsync("currentBluetoothDevice")
    SecureStore.deleteItemAsync("currentSensor")
    SecureStore.deleteItemAsync("customCommands")
    SecureStore.deleteItemAsync("baudRate")
    SecureStore.deleteItemAsync("sensors")
    // SecureStore.deleteItemAsync("chartData")
    set({
      currentBluetoothDevice: null,
      currentSensor: null,
      sensors: defaultSensors,
      customCommands: defaultCustomCommands,
      baudRate: defaultBaudRate,
      // chartData: defaultChartData,
    })
  }
}))

export default useStore
