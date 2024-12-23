export const formatDateToISO = (date: Date): string => {
  const pad = (num: number): string => (num < 10 ? "0" : "") + num

  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1) // getMonth() returns 0-11
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}