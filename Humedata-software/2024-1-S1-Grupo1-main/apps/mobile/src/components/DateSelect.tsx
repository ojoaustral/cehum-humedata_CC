import React, { useState, forwardRef, useEffect } from "react"
import { Text, View, TouchableOpacity, Modal, FlatList } from "react-native"
import { cn } from "@ui/utils"
import { Modes, TimeDatePicker } from "react-native-time-date-picker"


export interface SelectOptions {
  label: string;
  value: any;
  id?: string;
}


export interface SelectProps {
  options: SelectOptions[];
  label?: string;
  placeholder?: string;
  onSelect: (value: any) => void;
  className?: string;
  labelClasses?: Object;
  buttonClasses?: Object;
}

const DateSelect = forwardRef<{}, SelectProps>(
  ({ className, label, onSelect, labelClasses, buttonClasses, placeholder = "" }, ref) => {
    const [visible, setVisible] = useState(false)
    const [selectedValue, setSelectedValue] = useState("")


    const handleSelect = (value: any, label: string) => {
      setSelectedValue(value)
      setVisible(false)
      onSelect(value)
    }
    // TODO: implement more tailwind classes

    const renderDate = (value: any) => {
      if (value){
        let hours = ""
        let minutes = ""
        if (new Date(value).getHours() < 10){hours = "0"}
        if (new Date(value).getMinutes() < 10){minutes = "0"}
        return (new Date(value).getMonth() + "/" + new Date(value).getDate() + "/" + new Date(value).getFullYear() + " [" + hours + new Date(value).getHours() + ":" + minutes + new Date(value).getMinutes() +"]" )
      }
      return ("Elegir fecha")
    }

    return (
      <View style={{ flex: 1 }} className={cn("flex flex-col gap-1.5", className)}>
        {label && <Text className="text-center">{label}</Text>}
        <TouchableOpacity
          style={{
            padding: 15,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            ...buttonClasses
          }}
          onPress={() => setVisible(true)}
        >
          <Text className="text-center">{renderDate(selectedValue) || placeholder}</Text>
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={visible}
          onRequestClose={() => setVisible(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onPress={() => setVisible(false)}
          >
            <View style={{ backgroundColor: "white", width: "80%", maxHeight: "50%" }}>
              <TimeDatePicker
                selectedDate={selectedValue}
                mode={Modes.date}
                onSelectedChange={(selected) => {setSelectedValue(selected); onSelect(selected); setVisible(false)}}
                onMonthYearChange={(month) => {setSelectedValue(month); onSelect(month)}}
                onTimeChange={(time) => {setSelectedValue(time); onSelect(time)}}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    )
  }
)

export { DateSelect }
