import React from "react"
import { View, Text, Image } from "react-native"
import { useSignIn } from "@clerk/clerk-expo"
import { router } from "expo-router"
import image from "@ui/assets/humedat@os_banner.png"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const [emailAddress, setEmailAddress] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState(false)
  const passwordInput = React.useRef(null)

  const onSignInPress = async () => {
    if (!isLoaded) {
      return
    }
    setError(false)

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      })
      await setActive({ session: completeSignIn.createdSessionId })
      router.replace("/home")
    } catch (err) {
      console.log(err)
      setError(true)
      setPassword("")
    }
  }

  return (
    <View className="flex-1 items-center mt-24">

      <View className="p-6 w-full items-center justify-center">
        <Image source={image} className='w-full h-50' resizeMode="contain" />

        <Input
          className="w-full"
          inputClasses="w-full h-12 border border-gray-300 rounded p-2.5 my-2.5 mb-2"
          placeholder="usuario@humed@tos.com"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          label="Correo"
          value={emailAddress}
          onChangeText={(email) => setEmailAddress(email)}
          returnKeyType="next"
          onSubmitEditing={() => passwordInput.current.focus()}
        />

        <Input
          ref={(input) => { passwordInput.current = input; }}
          className="w-full"
          inputClasses="w-full h-12 border border-gray-300 rounded p-2.5 my-2.5"
          label="Contraseña"
          value={password}
          textContentType="password"
          autoComplete="password"
          placeholder="********"
          autoCapitalize="none"
          secureTextEntry={true}
          returnKeyType="done"
          onChangeText={(password) => setPassword(password)}
        />

        {error &&
          <View className="justify-center">
            <Text className="text-red-500">Credenciales Invalidas</Text>
          </View>
        }

        <Button
          label="Iniciar Sesión"
          variant="default"
          className="w-1/2 mt-2 rounded-full h-12 secondary"
          onPress={onSignInPress}
        />
      </View>
    </View>
  )
}
