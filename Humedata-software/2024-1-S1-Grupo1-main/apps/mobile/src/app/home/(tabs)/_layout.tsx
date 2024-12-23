import React from "react"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { Tabs } from "expo-router"
import { useColorScheme } from "nativewind"

const Colors = {
  light: {
    tint: '#93c020',
    tabIconDefault: '#ccc',
    background: '#fff',
  },
  dark: {
    tint: 'black',
    tabIconDefault: '#fff',
    background: 'black',
  },
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"]
  color: string
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint,
        tabBarInactiveTintColor: colorScheme === 'dark' ? Colors.dark.tabIconDefault : Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
        },
      }}
    >
      <Tabs.Screen
        name="visualization"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calibration"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="cloud-upload" color={color} />,
        }}
      />
    </Tabs>
  )
}
