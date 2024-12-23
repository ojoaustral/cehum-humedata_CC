import React from "react"
import { View, Text, Image } from "react-native"
import ResetPassword from "./reset_password"
import { useUser } from "@clerk/clerk-expo"

export default function MyAccountScreen() {
  const { user } = useUser()
  const getUserRole = () => {
    if (user?.organizationMemberships && user?.organizationMemberships.length > 0) {
      if (user?.organizationMemberships[0]?.role === "org:admin") {
        return "administrador"
      }
    }
    return "usuario"
  }


  const getRoleClass = (userRole: string) => {
    if (userRole === "admin") {
      return "bg-primary"
    }
    return "bg-[#93c020]"
  }

  const userRole = getUserRole()
  const roleClass = getRoleClass(userRole)

  return (
    <View className="flex justify-center p-8 bg-white h-full">
      <Text className="font-bold text-xl">Información de la Cuenta</Text>
      <View className="mt-2 w-full p-8 border border-gray-300 rounded flex-row">
        <View className="w-1/3">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user?.imageUrl }}
              className="w-20 bg-secondary h-20 rounded-full"
            />
          ) :
            (
              <View className="w-20 bg-secondary h-20 rounded-full flex justify-center items-center" />
            )}
        </View>
        <View className="w-2/3">
          <Text>{user?.fullName}</Text>
          <Text>{user?.primaryEmailAddress?.emailAddress}</Text>
          <Text
            className={`rounded-full bg-primary w-20 text-center p-1 font-bold mt-2 ${roleClass}`}
          >
            {userRole}
          </Text>
        </View>
      </View>

      <ResetPassword />
    </View>
  )
}
