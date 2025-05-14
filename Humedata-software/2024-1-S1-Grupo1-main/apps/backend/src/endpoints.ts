import { t, middleware } from "./trpc"
import { enforceUserIsAuthed } from "./middlewares/enforceUserIsAuthed"
import { enforceAdmin } from "./middlewares/enforceAdmin"
import { enforceOrgAdmin } from "./middlewares/enforceOrgAdmin"
import { enforceOrgMember } from "./middlewares/enforceOrgMember"

export const publicEndpoint = t.procedure

export const protectedEndpoint = t.procedure.use(enforceUserIsAuthed(middleware))

export const adminEndpoint = t.procedure.use(enforceAdmin(middleware))

export const adminOrgEndpoint = t.procedure.use(enforceOrgAdmin(middleware))

export const memberOrgEndpoint = t.procedure.use(enforceOrgMember(middleware))

