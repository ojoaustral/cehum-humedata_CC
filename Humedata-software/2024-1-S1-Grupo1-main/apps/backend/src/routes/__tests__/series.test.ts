import { caller } from "../../router"

describe("Times Series Controller", () => {
  it("should get times series by zones v1" , async() =>{
    const data = {
      parameters: ["ph" as "ph", "atmospheric_pressure" as "atmospheric_pressure"],
      zones_id : ["66436ad4c75d9b73d988b132","664a20e49539950ad55f3576"],
      start_date : new Date("2024-01-01"),
      end_date : new Date("2024-01-02"),
    }
    const timeSeries = await caller.zoneTimeSeries.getTimeSeriesByZones(data)
    // TODO: Add more assertions
  })
})
