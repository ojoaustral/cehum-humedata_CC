import "@ui/globals.css"
import { ClerkProvider } from "@clerk/clerk-expo"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { TrpcProvider } from "../providers/trpc.provider"
import { useFonts } from "expo-font"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import Constants from "expo-constants"
import { getToken, saveToken } from "@/utils/cache"
import { LogBox } from "react-native"
import useStore from "@/utils/useStore"
import * as Sentry from "@sentry/react-native"

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: true,
})
LogBox.ignoreLogs(["new NativeEventEmitter"])
LogBox.ignoreLogs(["Sentry Logger [warn]"])

export { ErrorBoundary } from "expo-router"
SplashScreen.preventAutoHideAsync()

const tokenCache = {
  getToken,
  saveToken,
}

const RootLayout = () => {
  const initializeStore = useStore((state) => state.initializeStore)
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={Constants.expoConfig?.extra?.clerkPublishableKey}>
      <TrpcProvider>
        <Stack>
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
      </TrpcProvider>
    </ClerkProvider>
  )
}

export default Sentry.wrap(RootLayout)
