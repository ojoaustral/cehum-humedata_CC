import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { cn } from "@ui/utils"
import React from "react";

type IconButtonProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  size?: number;
  color?: string;
} & React.ComponentPropsWithoutRef<typeof TouchableOpacity>;

export const IconButton: React.FC<IconButtonProps> = ({ icon, size=24, color='black', className,...props }) => (
  <TouchableOpacity
    className={cn("w-100 p-2 h-12 m-1 bg-primary justify-center items-center rounded", className)}
    {...props}
  >
    <MaterialIcons name={icon} size={size} color={color}/>
  </TouchableOpacity>
);

