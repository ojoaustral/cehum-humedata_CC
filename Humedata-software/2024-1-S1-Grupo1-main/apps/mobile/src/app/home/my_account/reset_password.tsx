import React, { useState } from "react"
import { View, Text } from "react-native"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { useUser } from "@clerk/clerk-expo"



export default function ResetPassword() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const minLength = 8

  const { user } = useUser()

  const canEdit = () => {
    if (newPassword !== confirmPassword || newPassword.length < minLength) {
      return false
    }
    if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
      return false
    }
    return true
  }

  const handleChangePassword = async () => {
    if (!user) {
      return
    }
    console.log(currentPassword, newPassword)
    user.updatePassword({ currentPassword, newPassword })
      .then(() => {
        alert("Contraseña actualizada con éxito!")
        setNewPassword("")
        setConfirmPassword("")
        setCurrentPassword("")
      })
      .catch((error) => {
        alert("Fallo al actulizar: " + error.errors[0].message)
      })
  }
  return (
    <View className="mt-5 pt-5">
      <Text className="font-bold text-xl">Cambiar Contraseña</Text>
      <View className="mt-2 w-full p-8 border border-gray-300 rounded">
        <Input
          className=""
          onChangeText={(value) => setCurrentPassword(value)}
          placeholder="Contraseña Actual" secureTextEntry />
        <Input
          className="mt-2"
          onChangeText={(value) => setNewPassword(value)}
          placeholder="Nueva Contraseña" secureTextEntry />
        <Input
          className="mt-2"
          onChangeText={(value) => setConfirmPassword(value)}
          placeholder="Confirmar Nueva Contraseña" secureTextEntry />
        {newPassword !== confirmPassword && confirmPassword.length > 0 && (
          <Text className="text-red-500 text-sm">Las contraseñas no coinciden</Text>
        )}
        {newPassword.length < minLength && newPassword.length > 0 && (
          <Text className="text-red-500 text-sm">La contraseña debe tener al menos {minLength} caracteres</Text>
        )}
        <Button
          className={ "mt-5 rounded-full" }
          variant={canEdit() ? "primary" : "green"}
          label="Actualizar Contraseña"
          disabled={!canEdit()}
          onPress={handleChangePassword} />
      </View>
    </View>
  )
}

