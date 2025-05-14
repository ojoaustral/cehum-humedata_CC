import { caller } from "../../router"

describe("Variables Controller", () => {
  it("should create a variable", async () => {
    const variable = await caller.variable.createVariable({
      location_name: "Test_Location_1",
      location_id: "66436a9ff85ec7d65398a7fd",
      formula: "ph+atmospheric_pressure",
      name: "ph y atm",
      params: ["ph","atmospheric_pressure"]
    })
    expect(variable).toHaveProperty("name","ph y atm")
  })

  it("should updata a variable", async () => {
    const createdVariable = await caller.variable.createVariable({
      location_name: "Test_Location_1",
      location_id: "66436a9ff85ec7d65398a7fd",
      formula: "$ph$ + $atmospheric_pressure$",
      name: "ph y atm",
      params: ["ph", "atmospheric_pressure"]
    })
    const updatedVariable = await caller.variable.updateVariable({
      variable_id: createdVariable.id,
      location_id: "66436a9ff85ec7d65398a7fd",
      formula: "$ph$ + $ph$",
      name: "2xph"
    })
    expect(updatedVariable).toHaveProperty("name", "2xph")
    expect(updatedVariable).toHaveProperty("formula", "$ph$ + $ph$")
  }),

  it("should delete a variable", async () => {
    const createdVariable = await caller.variable.createVariable({
      location_name: "Test_Location_1",
      location_id: "66436a9ff85ec7d65398a7fd",
      formula: "$ph$ + $atmospheric_pressure$",
      name: "ph y atm",
      params: ["ph", "atmospheric_pressure"]
    })
    const deletedVariable = await caller.variable.deleteVariable({
      variable_id: createdVariable.id
    })
    expect(deletedVariable.id).toEqual(createdVariable.id)
  })

  it("should return logs corresponding to variable", async () => {
    const logsByVariable = await caller.variable.getTimeSeriesByVariable({
      zones_id: ["66436ad4c75d9b73d988b132"],
      start_date : new Date("2024-01-01"),
      end_date : new Date("2024-12-31"),
      variables: ["667c7e314356fd6b8ad8b674"]
    })
  })
  
})

