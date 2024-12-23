import React, { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity  } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { router } from "expo-router"
import useStore from "@/utils/useStore"
import { CustomCommand } from "@/utils/useStore"

type CustomCommandsProps = {
  onSend: (command: string) => void;
  onDownload?: () => void;
};

const CustomCommands = ({ onSend, onDownload }: CustomCommandsProps) => {
  const currentSensor = useStore((state) => state.currentSensor)
  const customCommands = useStore((state) => state.customCommands)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const duration = useStore((state) => state.repeatableDuration)
  const interval = useStore((state) => state.repeatableInterval)
  const setSelectedCommand = useStore((state) => state.setSelectedCommand)
  const repeatableCommand = useStore((state) => {
    if (state && state.currentSensor) {
      return state.customCommands?.[state.currentSensor.name]?.find((cmd) => cmd.repeatable) || null
    }
    return null
  })

  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const handleNewCommand = async () => {
    const newCommand: CustomCommand = {
      name: "cmd",
      value: ""
    }
    setSelectedCommand(newCommand)
    router.navigate("/home/command_configuration")
  }
  const handleCommandPress = (cmd: CustomCommand) => {
    setSelectedCommand(cmd)
    router.navigate("/home/command_configuration")
  }
  const handleRepeatableCommand = () => {
    if (repeatableCommand) {
      onSend(repeatableCommand.value)
      intervalRef.current = window.setTimeout(handleRepeatableCommand, interval)
    }
  }
  useEffect(() => {
    if (repeatableCommand && isPlaying) {
      handleRepeatableCommand();
      if (duration > 0) {
        timeoutRef.current = window.setTimeout(() => {
          if (intervalRef.current !== null) {
            clearTimeout(intervalRef.current);
          }
          setIsPlaying(false);
        }, duration);
      }
    }
    return () => {
      if (intervalRef.current !== null) {
        clearTimeout(intervalRef.current);
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [repeatableCommand, duration, interval, isPlaying]);

  return (
    <View className="w-full mt-2">
      <View className="flex flex-wrap justify-center flex-row">
        { customCommands[currentSensor?.name].map((cmd: CustomCommand, index: number) => (
          <TouchableOpacity
            key={index}
            className={`w-1/5 h-12 m-1 justify-center items-center rounded ${cmd.repeatable ? "bg-secondary" : "bg-gray-300"}`}
            onPress={() => onSend(cmd.value)}
            onLongPress={() => handleCommandPress(cmd)}
          >
            <Text className="text-black text-base">{cmd.name}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          className="w-1/5 h-12 m-1 bg-gray-500 justify-center items-center rounded"
          onPress={() => handleNewCommand()}
        >
          <Text className="text-white text-2xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
      <View className="flex flex-wrap justify-center flex-row">
        <TouchableOpacity
          className="w-1/5 h-12 m-1 bg-gray-400 justify-center items-center rounded"
          onLongPress={() => router.navigate("/home/repeatable_command")}
          onPress={() => router.navigate("/home/repeatable_command")}
        >
          <MaterialIcons name="settings" size={24} color="black" />
        </TouchableOpacity>
        {repeatableCommand && (
          <TouchableOpacity
            className={"w-1/5 h-12 m-1 justify-center items-center rounded " + (isPlaying ? "bg-red-500" : "bg-green-500")}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <MaterialIcons name="pause" size={24} color="black" /> :
              <MaterialIcons name="play-arrow" size={24} color="black" />}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          className={"w-1/5 h-12 m-1 justify-center items-center rounded bg-gray-400"}
          onPress={() => onDownload && onDownload()}
        >
          <MaterialIcons name="download" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default CustomCommands
