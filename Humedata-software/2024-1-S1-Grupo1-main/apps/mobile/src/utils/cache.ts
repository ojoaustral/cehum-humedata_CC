import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

export async function saveToken(key: string, value: string) {
  try {
    return SecureStore.setItemAsync(key, value);
  } catch (err) {
    return;
  }
}

export async function getToken(key: string) {
  const value = await SecureStore.getItemAsync(key)
  if (value) {
    console.log(`${key} was used 🔐 \n`);
  } else {
    console.log("No values stored under key: " + key);
  }
  return value
}

export async function deleteToken(key: string) {
  await SecureStore.deleteItemAsync(key)
}

// SecureStore is not supported on the web
// https://github.com/expo/expo/issues/7744#issuecomment-611093485
export const tokenCache =
  Platform.OS !== "web"
    ? {
      getToken,
      saveToken,
    }
    : undefined
