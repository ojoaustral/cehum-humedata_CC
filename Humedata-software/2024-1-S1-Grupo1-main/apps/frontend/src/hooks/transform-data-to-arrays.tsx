import { RawChartDataCollection } from "@/types/chart-data-types"

const transformDataToArray = (rawData: RawChartDataCollection) => {
  const rows: any[] = []
  const allParams = Object.keys(rawData)

  const dataMap: Map<string, Map<string, any>> = new Map()

  allParams.forEach(param => {
    const paramData = rawData[param]?.data
    const paramName = rawData[param]?.name
    if (paramData && paramName) {
      Object.keys(paramData).forEach(zoneId => {
        if (!dataMap.has(zoneId)) {
          dataMap.set(zoneId, new Map())
        }
        paramData[zoneId]?.forEach(measurement => {
          const { timestamp, ...rest } = measurement
          const formattedTimestamp = new Date(timestamp).toLocaleString()
          if (!dataMap.get(zoneId)?.has(formattedTimestamp)) {
            dataMap.get(zoneId)?.set(formattedTimestamp, { zona_id: zoneId, fecha: formattedTimestamp })
          }
          if (dataMap.get(zoneId)) {
            dataMap.get(zoneId)!.get(formattedTimestamp)[paramName] = rest[param]
          }
        })
      })
    }
  })

  dataMap.forEach((zoneData) => {
    zoneData.forEach((rowData) => {
      allParams.forEach(param => {
        const paramName = rawData[param]?.name
        if (paramName && !Object.prototype.hasOwnProperty.call(rowData, paramName)) {
          rowData[paramName] = ""
        }
      })
      rows.push(rowData)
    })
  })
  return rows
}

export default transformDataToArray