import React, { useState, forwardRef, useEffect } from "react";
import { Text, View, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { cn } from "@ui/utils";

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
  defaultValue?: string;
}

const Select = forwardRef<{}, SelectProps>(
  ({ className, label, options, onSelect, labelClasses, buttonClasses, placeholder = "", defaultValue=""}, ref) => {
    const [visible, setVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState(defaultValue);
    const [uniqueOptions, setUniqueOptions] = useState([]);

    useEffect(() => {
      if (options.length === 0) {
        setSelectedValue("");
      }
      const uniqueOptions = options.filter((option, index, self) =>
        index === self.findIndex((t) => t.value === option.value)
      );
      setUniqueOptions(uniqueOptions);
    }, [options]);

    const handleSelect = (value: any, label: string) => {
      setSelectedValue(label);
      setVisible(false);
      onSelect(value);
    };

    return (
      <View style={{ flex: 1 }} className={cn("flex flex-col gap-1.5", className)}>
        {label && <Text>{label}</Text>}
        <TouchableOpacity
          style={{
            padding: 15,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            ...buttonClasses,
          }}
          onPress={() => setVisible(true)}
          disabled={uniqueOptions.length === 0 || options.length === 0}
        >
          <Text style={{ flex: 1 }}>{selectedValue || placeholder}</Text>
          <FontAwesome name="chevron-down" size={20} color="#ccc" style={{ marginLeft: 10 }} />
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={visible}
          animationType="slide"
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={uniqueOptions}
                keyExtractor={(item) => item?.id || item.label.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item.value, item.label)}
                  >
                    <Text>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#93c020',
    borderRadius: 20,
    width: '60%',
    marginLeft: '20%',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export { Select };

