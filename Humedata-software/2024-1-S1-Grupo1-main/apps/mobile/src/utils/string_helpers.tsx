export const convertHexToString = (hex: string) => {
  let str = ""
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  }
  return str
}

export const convertStringToHex = (str: string) => {
  let hex = ""
  for (let i = 0; i < str.length; i++) {
    hex += "" + str.charCodeAt(i).toString(16)
  }
  return hex
}

export const stringToByteArray = (str: string) => {
  return Array.from(str).map(char => char.charCodeAt(0))
}

export const byteArrayToString = (arr: number[]) => {
  return arr.map(byte => String.fromCharCode(byte)).join("")
}
