import axios, { type AxiosRequestConfig, type Method } from 'axios'
import { Permission, type Manager } from './model'

export enum Rule {
  None = -1,
  UserOrAbove,
  AdminOrAbove,
  SuperAdminOnly,
}

function parsePermissionValue(value: string): Permission {
  const normalized = value.trim()

  if (normalized === '2') {
    return Permission.SuperAdmin
  }

  if (normalized === '1') {
    return Permission.Admin
  }

  if (normalized === '0') {
    return Permission.User
  }

  return Permission.None
}

function readCookie(name: string) {
  const all = document.cookie ? document.cookie.split('; ') : []

  for (const row of all) {
    const [key, ...rest] = row.split('=')
    if (key !== name) {
      continue
    }

    return decodeURIComponent(rest.join('='))
  }

  return null
}

export async function get_user_from_cookie() {
  const name = readCookie('name')
  if (!name) {
    return null
  }
  const permisson_raw = readCookie('permisson')
  if (!permisson_raw) {
    return null
  }
  const permisson = parsePermissionValue(permisson_raw)

  const is_login = readCookie('is_login') === '1'
  const u: Manager = {
    name: name,
    permisson: permisson,
    is_login: is_login,
  }
  return u
}

export async function auth() {
  const response = await axios.get('/api/auth')
  if (response.status !== 200) {
    return null
  }

  const manager_info: Manager = {
    name: response.data?.name ?? '',
    permisson: parsePermissionValue(
      String(response.data?.permisson ?? response.data?.permission ?? ''),
    ),
    is_login:
      response.data?.is_login === 1 ||
      response.data?.is_login === '1' ||
      response.data?.is_login === true,
  }

  return manager_info
}

export function clearCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`
}

export function is_permission_match_rule(p: Permission, r: Rule) {
  return p >= r
}
