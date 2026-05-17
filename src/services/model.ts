export interface Manager {
  name: String
  permisson: Permission
  is_login: boolean
}

export enum Permission {
  SuperAdmin = 2,
  Admin = 1,
  User = 0,
  None = -1,
}

export function permission_to_name(p: Permission) {
  const map: Record<Permission, string> = {
    [Permission.SuperAdmin]: '超级管理员',
    [Permission.Admin]: '管理员',
    [Permission.User]: '用户',
    [Permission.None]: '无权限',
  }
  return map[p]
}
