import React, {useEffect} from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useAuth, useUser } from "@clerk/clerk-expo"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Menu, MenuTrigger, MenuOptions, MenuOption, MenuProvider } from "react-native-popup-menu"
import { Ionicons } from "@expo/vector-icons"
import { router, usePathname } from "expo-router"
import { Stack } from "expo-router"

function HomeLayout() {
  return <HomeLayoutNav />
}

function getUserName(user: any) {
  const name = user?.firstName || user?.primaryEmailAddress?.emailAddress
  return name || "Usuario"
}


const ProfileMenu = () => {
  const { isLoaded, signOut } = useAuth()
  const { user } = useUser()
  const route = usePathname()
  const allowedRoutes = ["/home", "/home/visualization", "/home/calibration"]
  const isHomeRoute = allowedRoutes.includes(route)
  useEffect(() => {
    if (route=="/") {
      router.replace("/home");
    }
  }, []);

  if (!isLoaded) {
    return null
  }

  const handleSignOut = () => {
    signOut()
    router.navigate("/login")
  }

  const handleConfiguration = () => {
    router.navigate("/home/configuration")
  }

  return (
    <View style={styles.header}>
      {isHomeRoute ? (
        <Text style={styles.placeholder}></Text>
      ) : (
        <TouchableOpacity onPress={() => router.navigate("/home")}>
          <Ionicons
            name="home"
            size={30}
            color="#333"
          />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle}>Hola {getUserName(user)}</Text>
      <Menu>
        <MenuTrigger customStyles={triggerStyles}>
          <Ionicons name="person-circle-outline" size={30} color="#333" />
        </MenuTrigger>
        <MenuOptions customStyles={optionsStyles}>
          <MenuOption onSelect={() => router.navigate("/home/my_account")}>
            <Text style={styles.text}>Mi Cuenta</Text>
          </MenuOption>
          <View
            style={{
              borderBottomColor: "grey",
              borderBottomWidth: 1,
            }}
          />
          {/* <MenuOption onSelect={() => router.navigate("/home/configuration")}> */}
          {/*   <Text style={styles.text}>Configuración</Text> */}
          {/* </MenuOption> */}
          <View
            style={{
              borderBottomColor: "grey",
              borderBottomWidth: 1,
            }}
          />
          <MenuOption onSelect={() => handleConfiguration()}>
            <Text style={styles.text}>Configuracion</Text>
          </MenuOption>
          <MenuOption onSelect={() => handleSignOut()}>
            <Text style={styles.text}>Cerrar Sesión</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    </View>
  )
}

function HomeLayoutNav() {
  return (
    <MenuProvider>
      <GestureHandlerRootView style={{ flex: 1, marginTop: 30 }}>
        <ProfileMenu />
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen
            name="my_account"
            options={{
              headerShown: false
            }} />
          <Stack.Screen
            name="command_configuration"
            options={{
              headerShown: false
            }} />
          <Stack.Screen
            name="repeatable_command"
            options={{
              headerShown: false
            }} />
          <Stack.Screen
            name="sensor_configuration"
            options={{
              headerShown: false
            }} />
          <Stack.Screen
            name="configuration"
            options={{
              headerShown: false
            }} />
        </Stack>
      </GestureHandlerRootView>
    </MenuProvider>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    padding: 10,
    color: "#333",
  },
  placeholder: {
    width: "10%",
  },
})

const triggerStyles = {
  triggerWrapper: {
    padding: 10,
  },
}

const optionsStyles = {
  optionsContainer: {
    marginTop: 50,
    padding: 15,
    textAlign: "center",
    fontSize: 30,
    backgroundColor: "white",
    borderRadius: 5,
  },
}

export default HomeLayout
