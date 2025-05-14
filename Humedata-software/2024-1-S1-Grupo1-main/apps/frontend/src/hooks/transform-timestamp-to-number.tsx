interface Measurement {
  timestamp: string;
  [key: string]: number | string;
}

interface ZoneData {
  [key: string]: Measurement[]
}

interface ChartData {
  name: string;
  id: string;
  data: ZoneData;
}

interface ChartDataCollection {
  [key: string]: ChartData;
}

interface MeasurementT {
  timestamp: number;
  [key: string]: number | string;
}

interface ZoneDataT {
  [key: string]: MeasurementT[]
}

interface ChartDataT {
  name: string;
  id: string;
  data: ZoneDataT;
}

interface ChartDataCollectionT {
  [key: string]: ChartDataT;
}

export function convertTimestampsToNumbers(data: ChartDataCollection): ChartDataCollectionT {
  const newData: ChartDataCollectionT = {}

  Object.keys(data).forEach(key => {
    const chartData = data[key]

    if (chartData) {
      newData[key] = {
        id: chartData.id,
        name: chartData.name,
        data: {},
      }

      Object.keys(chartData.data).forEach(zoneId => {
        const measurements = chartData.data[zoneId]

        if (measurements) {
          const convertedMeasurements = measurements.map(measurement => ({
            ...measurement,
            timestamp: new Date(measurement.timestamp).getTime(), 
          }))

          newData[key]!.data[zoneId] = convertedMeasurements
        }
      })
    }
  })

  return newData
}