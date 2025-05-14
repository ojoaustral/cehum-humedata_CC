import { parameters } from "../downloadrecord/downloadrecord.schema"
import { caller } from "../../router"

describe("DownloadRecord Controller", () => {
  it("should get all download records", async () => {
    const downloadRecords = await caller.downloadRecord.get({})
    expect(downloadRecords).toBeInstanceOf(Array)
  })

  it("should create download records for multiple zones", async () => {
    const zoneIds = ["66436ad4c75d9b73d988b132", "664a20e49539950ad55f3576"]
    const downloadRecordData = {
      zones_id: zoneIds,
      params_id: [parameters.Enum.ph, parameters.Enum.atmospheric_pressure], 
      location_name: "Test Location",
      start_date: new Date(),
      end_date: new Date(),
    }

    const downloadRecords = await caller.downloadRecord.createDownloadRecord(downloadRecordData)

    expect(downloadRecords).toHaveLength(zoneIds.length)
    expect(downloadRecords[0]).toHaveProperty("location_name", "Test Location")
    expect(downloadRecords[0]).toHaveProperty("start_date")
    expect(downloadRecords[0]).toHaveProperty("end_date")
  })

  it("should get download records filtered by organization", async () => {
    const organizationName = "testOrganization"
    const downloadRecords = await caller.downloadRecord.get({ organization: organizationName })
    expect(downloadRecords).toBeInstanceOf(Array)
    downloadRecords.forEach(record => {
      expect(record.organization).toBe(organizationName)
    })
  })
})
