import { PrismaClient } from "../../generated/mongo-client"
import { createContext } from "../../context"
import { CreateExpressContextOptions } from "@trpc/server/adapters/express"
import { caller } from "../../router"

type MockedPrismaClient = PrismaClient & {
  zone: {
    findMany: jest.Mock,
    create: jest.Mock,
    findUnique: jest.Mock,
    update: jest.Mock,
    delete: jest.Mock,
  }
};

jest.mock("../../generated/mongo-client", () => {
  const mock = {
    findMany: jest.fn().mockResolvedValue([{ id: "1", name: "Zone 1" }, { id: "2", name: "Zone 2" }]),
    create: jest.fn(),
    findUnique: jest.fn().mockResolvedValue({ id: "1", name: "Zone 1" }),
    update: jest.fn(),
    delete: jest.fn().mockResolvedValue({ id: "1", name: "Deleted Zone" }),
  }
  return { PrismaClient: jest.fn(() => ({ zone: mock })) }
})

describe("Zone Controller", () => {
  let ctx: ReturnType<typeof createContext>
  let prismaMock: MockedPrismaClient

  beforeAll(() => {
    ctx = createContext({ req: {} } as CreateExpressContextOptions)
    prismaMock = new PrismaClient() as unknown as MockedPrismaClient
    ctx.prismaMongo = prismaMock
  })

  it("should get all zones", async () => {
    const zones = await caller.zone.get()
    expect(zones).toEqual([{ id: "1", name: "Zone 1" }, { id: "2", name: "Zone 2" }])
    expect(ctx.prismaMongo.zone.findMany).toHaveBeenCalledTimes(1)
  })

  it("should create a new zone", async () => {
    const newZoneData = {
      name: "New Zone",
      locationId: "location1",
      min_latitude: -10,
      max_latitude: 10,
      min_longitude: -10,
      max_longitude: 10,
    }
  
    const createdZone = {
      id: "1", 
      ...newZoneData,
    }
  
    prismaMock.zone.create.mockResolvedValue(createdZone)
  
    const result = await caller.zone.createZone(newZoneData)
  
    expect(result).toEqual(createdZone)
    expect(prismaMock.zone.create).toHaveBeenCalledWith({
      data: newZoneData,
    })
  })

  it("should update an existing zone including locationId", async () => {
    const updateData = {
      name: "Updated Zone Name",
      locationId: "newLocationId", 
      max_latitude: 20,
      min_longitude: -10,
    }

  
    const updatedZone = {
      id: "1",
      name: "Updated Zone Name",
      locationId: "newLocationId",
      min_latitude: -10, 
      max_latitude: 20, 
      min_longitude: -10, 
      max_longitude: 10, 
    }
  
    prismaMock.zone.update.mockResolvedValue(updatedZone)
  
    const result = await caller.zone.updateZone({ id: "1", data: updateData })
  
    expect(result).toEqual(updatedZone)
    expect(prismaMock.zone.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: updateData
    })
  })


  it("should delete a zone by id", async () => {
    const zoneId = "123"
    prismaMock.zone.delete.mockResolvedValue({
      id: zoneId,
      name: "Zone to be deleted",
      locationId: "location1",
      min_latitude: -10,
      max_latitude: 10,
      min_longitude: -10,
      max_longitude: 10
    })

    const result = await caller.zone.deleteZone({ id: zoneId })

    expect(prismaMock.zone.delete).toHaveBeenCalledWith({
      where: { id: zoneId }
    })
    expect(result).toEqual({
      success: true,
      message: "Zone deleted successfully",
      id: zoneId
    })
  })
})

