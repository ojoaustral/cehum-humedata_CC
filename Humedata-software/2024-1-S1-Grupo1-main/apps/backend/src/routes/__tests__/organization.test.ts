import { caller } from "../../router"

describe("Organization Controller", () => {
  it("should find organization by name", async () => {
    const organization = await caller.organization.getOrganizationByName({
      name: "test_organization_2",
    })
    expect(organization).toHaveProperty("name", "test_organization_2")
  })

  it("should get locations by organization name", async () => {
    const response = await caller.organization.getLocations({ organization: "Test_Organization_1" })
    expect(response).toEqual([
      {
        organization: "Test_Organization_1",
        locations_names: ["Test_Location_1", "test_location_2", "test_location_3"]
      }
    ])
  })
  
})



