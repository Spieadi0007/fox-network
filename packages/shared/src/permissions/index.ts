import { Role } from "../types";

export enum Action {
  // Work Orders
  WorkOrderCreate = "work_order:create",
  WorkOrderRead = "work_order:read",
  WorkOrderUpdate = "work_order:update",
  WorkOrderDelete = "work_order:delete",
  WorkOrderAssign = "work_order:assign",

  // Assets
  AssetCreate = "asset:create",
  AssetRead = "asset:read",
  AssetUpdate = "asset:update",
  AssetDelete = "asset:delete",

  // Users
  UserInvite = "user:invite",
  UserRead = "user:read",
  UserUpdate = "user:update",
  UserDelete = "user:delete",
  UserRoleChange = "user:role_change",

  // Settings
  SettingsRead = "settings:read",
  SettingsUpdate = "settings:update",
}

const ALL_ACTIONS = new Set(Object.values(Action));

const MANAGER_ACTIONS = new Set([
  Action.WorkOrderCreate,
  Action.WorkOrderRead,
  Action.WorkOrderUpdate,
  Action.WorkOrderDelete,
  Action.WorkOrderAssign,
  Action.AssetCreate,
  Action.AssetRead,
  Action.AssetUpdate,
  Action.AssetDelete,
  Action.UserInvite,
  Action.UserRead,
  Action.SettingsRead,
]);

const TECHNICIAN_ACTIONS = new Set([
  Action.WorkOrderRead,
  Action.WorkOrderUpdate,
  Action.AssetRead,
  Action.UserRead,
  Action.SettingsRead,
]);

const VIEWER_ACTIONS = new Set([
  Action.WorkOrderRead,
  Action.AssetRead,
  Action.UserRead,
  Action.SettingsRead,
]);

const ROLE_PERMISSIONS: Record<Role, Set<Action>> = {
  [Role.Admin]: ALL_ACTIONS,
  [Role.Manager]: MANAGER_ACTIONS,
  [Role.Technician]: TECHNICIAN_ACTIONS,
  [Role.Viewer]: VIEWER_ACTIONS,
};

export function hasPermission(role: Role, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function getPermissions(role: Role): Action[] {
  return Array.from(ROLE_PERMISSIONS[role] ?? []);
}
