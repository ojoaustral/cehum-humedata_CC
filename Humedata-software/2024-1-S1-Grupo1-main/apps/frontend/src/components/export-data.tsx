import React from "react"
import exportFromJSON from "export-from-json"
import { Button } from "@ui/components/button"
import transformDataToCsvFormat from "@/hooks/transform-data-to-csv-format"
import { trpc } from "@repo/trpc-client"
// import { useAuth } from "@clerk/nextjs"

interface DataInArray {
  zona_id: string;
  fecha: string;
  [key: string]: number | string;
}

interface DownloadCSVProps {
  rawData: DataInArray[];
  location_name: string;
  selected_zones: string[];
  parameter_ids: string[];
}

const transformDate = (dateString: string): Date => {
  const [datePart = "", timePart = ""] = dateString.split(", ")
  const [day, month, year] = datePart.split("/").map(part => part.padStart(2, "0"))
  const [hours, minutes, seconds] = timePart.split(":").map(part => part.padStart(2, "0"))
  return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
}

const DownloadBuoysDataCSV: React.FC<DownloadCSVProps> = ({ rawData, location_name, selected_zones, parameter_ids }) => {
  
  //const [username, setUsername] = useState<string | null>(null)

  // const { userId } = useAuth()
  //const { user } = useUser()

  // useEffect(() => {
  //   if (user) {
  //     setUsername(user.username || user.firstName || user.lastName || user.primaryEmailAddress?.emailAddress || "Desconocido")
  //   }
  // }, [user])
  
  const downloadMutation = trpc.downloadRecord.createDownloadRecord.useMutation()

  const onDownloadData = async () => {
    if (!rawData || rawData.length === 0) {
      console.error("No data available for download.")
      return
    }

    const downloadedDataFileName = "dataHumedatasCEHUM" // Name of downloaded file
    const exportType = exportFromJSON.types.csv

    const csvData = transformDataToCsvFormat(rawData)

    exportFromJSON({ data: csvData, fileName: downloadedDataFileName, exportType })
    
    // Get start and end date of the period downloaded by a user
    const first_element = rawData[0] ? rawData[0] : { fecha: "" }
    const length = rawData.length
    const last_index = length - 1
    const last_element = rawData[last_index] ? rawData[last_index] : { fecha: "" }
    const start_date = transformDate(first_element.fecha) // Transform date from string to Date
    const end_date = last_element ? transformDate(last_element.fecha) : new Date() // Transform date from string to Date or use current date if last_element is undefined
    
    // Post download record
    try {
      await downloadMutation.mutateAsync({
        //userId: userId || "Desconocido",
        location_name: location_name || "Unknown",
        zones_id: selected_zones,
        params_id: parameter_ids,
        start_date: start_date,
        end_date: end_date,
      })
      console.log("Download registered successfully")
    } catch (error) {
      console.error("Failed to register download", error)
    }
  }

  return (
    <Button className="bg-white text-black" onClick={onDownloadData}>Descargar tabla</Button>
  )
}

export default DownloadBuoysDataCSV
