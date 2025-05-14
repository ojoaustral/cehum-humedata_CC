import React, { useState, useRef, useEffect } from "react"
import { ScrollView, View, Text, TextInput, TouchableOpacity, Dimensions } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { Button } from "@/components/Button"
import CustomCommands from "@/components/CustomCommands"
import useStore from "@/utils/useStore"
import TerminalOutputView from "./TerminalOutputView"
import TerminalReadingsView from "./TerminalReadingsView"
import { handleSendCommand, handleClearOutput } from "./terminalFunctions"
import { downloadTerminalOutput } from "@/utils/download"
import { Sensor } from "@/utils/useStore"

interface ScrollRef {
  current: ScrollView | null;
  scrollToEnd: (options: { animated: boolean }) => void;
}

const { width } = Dimensions.get("window")

export type TerminalOutput = {
  command: string;
  type: "send" | "receive" | "error";
  timestamp?: Date;
};

type TerminalProps = {
  hasPermission: boolean;
  onSend: (command: string) => void;
  onClear?: () => void;
  onBack?: () => void;
  terminalOutput: TerminalOutput[];
  setTerminalOutput: (output: TerminalOutput[]) => void;
  name?: string;
};

const Terminal = ({ hasPermission, onSend, onClear, terminalOutput, setTerminalOutput, name = "Terminal", onBack }: TerminalProps) => {
  const [command, setCommand] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const scrollViewRef = useRef<ScrollRef>(null)
  const verticalScrollRef = useRef<ScrollRef>(null)
  const currentSensor = useStore((state) => state.currentSensor)
  const floatRegex = useStore((state) => state.floatRegex)
  const csvRegex = useStore((state) => state.csvRegex)

  const downloadTxtFile = () => {
    downloadTerminalOutput(terminalOutput, currentSensor as Sensor)
  }

  const currentRegex = () => {
    if (currentSensor?.readingFormat === "float") {
      return floatRegex
    }
    return csvRegex
  }

  useEffect(() => {
    if (verticalScrollRef.current) {
      verticalScrollRef.current.scrollToEnd({ animated: true })
    }
  }, [terminalOutput])

  useEffect(() => {
    if (terminalOutput.length === 0 && hasPermission) {
      setTerminalOutput([
        {
          command: "Device connected",
          type: "receive",
          timestamp: new Date(),
        },
      ])
    }
  }, [hasPermission])

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent
    const page = Math.round(contentOffset.x / width)
    setCurrentPage(page)
  }

  const handleSend = () => {
    handleSendCommand(undefined, command, setCommand, setTerminalOutput, onSend)
    if (verticalScrollRef.current)
      verticalScrollRef.current.scrollToEnd({ animated: true })
  }

  if (!currentSensor) {
    return (
      <View className="flex-1 items-center p-4 bg-white">
        <Text className="text-2xl font-bold text-black mb-4">{name}</Text>
        <Text className="text-base text-black">Selecciona un sensor para comenzar</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 items-center p-4 bg-white">
      <Text className="text-2xl font-bold text-black mb-4">{name} ({currentSensor.name})</Text>
      <View className="flex-1 w-full border-gray-300 border rounded-lg p-2 bg-gray-200">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate="fast"
          ref={scrollViewRef}
        >
          <View style={{ width }}>
            <TerminalReadingsView terminalOutput={terminalOutput
              .filter(output => currentRegex().test(output.command))} 
            regex={currentRegex()}
            />
          </View>
          <View style={{ width }}>
            <ScrollView
              ref={verticalScrollRef}
            >
              <TerminalOutputView terminalOutput={terminalOutput} />
            </ScrollView>
          </View>
        </ScrollView>
        <View className="flex-row justify-center mt-2">
          <View className={`h-2 w-2 ${currentPage === 0 ? "bg-blue" : "bg-gray-500"} rounded-full mx-1`} />
          <View className={`h-2 w-2 ${currentPage === 1 ? "bg-blue" : "bg-gray-500"} rounded-full mx-1`} />
        </View>
      </View>
      <CustomCommands 
        onSend={(cmd) => handleSendCommand(cmd, command, setCommand, setTerminalOutput, onSend)}
        onDownload={downloadTxtFile}
      />
      <View className="w-full mt-2 flex-row items-center">
        <TextInput
          className="flex-1 h-12 p-2 border border-gray-400 rounded-l-lg bg-white text-black"
          placeholder="Comando a enviar"
          autoCapitalize="none"
          onChangeText={setCommand}
          value={command}
        />
        <TouchableOpacity
          className="h-12 w-12 bg-blue-500 rounded-r-lg items-center justify-center border border-gray-400"
          onPress={handleSend}
          disabled={!hasPermission}
        >
          <MaterialIcons name="send" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View className="w-full mt-2 flex-row justify-between">
        {onBack && (
          <Button
            className="flex-1 mt-2 ml-2 rounded-none h-12 bg-red-400"
            onPress={onBack}
            label="Volver"
          />
        )}
        <Button
          className="flex-1 mt-2 rounded-none h-12 bg-gray-400"
          onPress={() => handleClearOutput(setTerminalOutput, onClear)}
          label="Limpiar"
        />
      </View>
    </View>
  )
}

export default Terminal
