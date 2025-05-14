import type { ActClaim, CheckAuthorizationWithCustomPermissions, JwtPayload, OrganizationCustomPermissionKey, OrganizationCustomRoleKey, ServerGetToken } from "@clerk/types"

/*
  WE NEED TO DO THIS BECAUSE OF TYPESCRIPT KNOWN ISSUES WITH SYMLINKS
  https://github.com/microsoft/TypeScript/pull/58176#issuecomment-2052698294
  EXPECTED TO BE SOLVED IN TYPESCRIPT 5.5 BETA
*/

export type SignedInAuthObject = {
  sessionClaims: JwtPayload;
  sessionId: string;
  actor: ActClaim | undefined;
  userId: string;
  orgId: string | undefined;
  orgRole: OrganizationCustomRoleKey | undefined;
  orgSlug: string | undefined;
  orgPermissions: OrganizationCustomPermissionKey[] | undefined;
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
}

export type SignedOutAuthObject = {
  sessionClaims: null;
  sessionId: null;
  actor: null;
  userId: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  getToken: ServerGetToken;
  has: CheckAuthorizationWithCustomPermissions;
}

export type AuthObject = SignedInAuthObject | SignedOutAuthObject;