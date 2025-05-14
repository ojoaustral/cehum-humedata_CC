import { PrismaClient } from "../../generated/mongo-client"
import { createContext } from "../../context"
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { caller } from "../../router"

type MockedPrismaClient = PrismaClient & {
  location: {
    findMany: jest.Mock,
    create: jest.Mock,
    update: jest.Mock,
    delete: jest.Mock,
  }
};

jest.mock("../../generated/mongo-client", () => {
  const mock = {
    findMany: jest.fn().mockResolvedValue([{ id: "1", name: "Location 1" }, { id: "2", name: "Location 2" }]),
    create: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  }
  return { PrismaClient: jest.fn(() => ({ location: mock })) }
})

describe("Location Controller", () => {
  let ctx: ReturnType<typeof createContext>
  let prismaMock: MockedPrismaClient

  beforeAll(() => {
    ctx = createContext({ req: {} } as CreateExpressContextOptions)
    prismaMock = new PrismaClient() as unknown as MockedPrismaClient
    ctx.prismaMongo = prismaMock
  })

  it("should get all locations", async () => {
    const locations = await caller.location.get()
    expect(locations).toEqual([{ id: "1", name: "Location 1" }, { id: "2", name: "Location 2" }])
    expect(prismaMock.location.findMany).toHaveBeenCalledTimes(1)
  })

  it("should create a new location", async () => {
    const newLocationData = {
      name: "New Location",
      organization: "org123",
      latitude: 34.0522,
      longitude: -118.2437,
    }
  
    const createdLocation = {
      id: "1",
      ...newLocationData,
    }
  
    prismaMock.location.create.mockResolvedValue(createdLocation)
  
    const result = await caller.location.createLocation(newLocationData)
  
    expect(result).toEqual(createdLocation)
    expect(prismaMock.location.create).toHaveBeenCalledWith({
      data: {
        name: newLocationData.name,
        organization: {
          connect: { id: newLocationData.organization } 
        },
        latitude: newLocationData.latitude,
        longitude: newLocationData.longitude,
      }
    })
  })
  

  it("should update an existing location", async () => {
    const updateData = {
      name: "Updated Location Name",
      latitude: 35.0000,
      longitude: -117.0000,
    }

    const updatedLocation = {
      id: "1",
      ...updateData
    }

    prismaMock.location.update.mockResolvedValue(updatedLocation)

    const result = await caller.location.updateLocation({ id: "1", data: updateData })

    expect(result).toEqual(updatedLocation)
    expect(prismaMock.location.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: updateData
    })
  })

  it("should delete a location by id", async () => {
    const locationId = "1"
    prismaMock.location.delete.mockResolvedValue({ id: locationId, name: "Deleted Location" })

    const result = await caller.location.deleteLocation({ id: locationId })

    expect(prismaMock.location.delete).toHaveBeenCalledWith({ where: { id: locationId } })
    expect(result).toEqual({
      success: true,
      message: "Location deleted successfully",
      id: locationId
    })
  })
})
