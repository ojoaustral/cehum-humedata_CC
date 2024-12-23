import { t } from "./trpc"
import { userController } from "./routes/user/user.controller"
import { deviceController } from "./routes/device/device.controller"
import { zoneController } from "./routes/zone/zone.controller"
import { zoneTimeSeriesController } from "./routes/series/series.controller"
import { organizationController } from "./routes/organization/organization.controller"
import { locationController } from "./routes/location/location.controller"
import { noteController } from "./routes/note/note.controller"
import { downloadRecordController } from "./routes/downloadrecord/downloadrecord.controller"
import { variableController } from "./routes/variables/variable.controller"
import { prismaCehum } from "./context"
import { prismaMongo } from "./context"

export const appRouter = t.router({
  user: userController,
  device: deviceController, 
  zone: zoneController,
  zoneTimeSeries: zoneTimeSeriesController,
  organization: organizationController,
  location: locationController,
  note: noteController,
  downloadRecord:  downloadRecordController,
  variable: variableController
})

const createCaller = t.createCallerFactory(appRouter)

const signedOutAuth = {
  sessionClaims: null,
  sessionId: null,
  actor: null,
  userId: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  orgPermissions: null,
  getToken: async () => null,
  has: () => false
}

export const caller = createCaller({
  auth: signedOutAuth,
  prismaCehum,
  prismaMongo
})
