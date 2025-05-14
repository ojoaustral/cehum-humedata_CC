import { forwardRef } from "react"
import { Text, TextInput, View } from "react-native"

import { cn } from "@ui/utils"

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  height?: number;
  labelClasses?: string;
  inputClasses?: string;
  numeric?: boolean;
}
const Input = forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, labelClasses, inputClasses, height, numeric, ...props }, ref) => (
    <View className={cn("flex flex-col gap-1.5", className)}>
      {label && <Text className={cn("text-base", labelClasses)}>{label}</Text>}
      <TextInput
        ref={ref}
        className={cn(
          inputClasses,
          "border border-gray-500 py-2.5 px-4 rounded-lg"
        )}
        keyboardType={numeric ? "numeric" : "default"} // Set keyboardType based on numeric prop
        inputMode={numeric ? "numeric" : "text"} // Set inputMode based on numeric prop
        {...props}
      />
    </View>
  )
)

export { Input }
