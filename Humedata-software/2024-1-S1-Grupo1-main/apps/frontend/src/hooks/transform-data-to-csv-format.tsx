interface DataInArray {
  zona_id: string;
  fecha: string;
  [key: string]: number | string;
}

const transformDataToCsvFormat = (data: DataInArray[]) => {
  if (data.length === 0) return []

  const first = data[0]
  if (first) {
    const headers = Object.keys(first)
  
    const csvData: any[] = [headers]

    data.forEach(row => {
      const rowValues = headers.map(header => row[header])
      csvData.push(rowValues)
    })
    return csvData
  } else {
    return []
  }
}

export default transformDataToCsvFormat