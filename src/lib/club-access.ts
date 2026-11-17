import type { Access, FieldAccess } from 'payload'

export const roles = ['member', 'core', 'leader', 'teacher'] as const
export type ClubRole = (typeof roles)[number]
export function hasRole(user: unknown, allowed: readonly string[]) {
  const account = user as { collection?: string; role?: string } | null
  return (
    account?.collection === 'admins' ||
    (account?.collection === 'users' && allowed.includes(account.role ?? ''))
  )
}
export const editors: Access = ({ req }) => hasRole(req.user, ['core', 'leader'])
export const educators: Access = ({ req }) => hasRole(req.user, ['leader', 'teacher'])
export const staff: Access = ({ req }) => hasRole(req.user, ['core', 'leader', 'teacher'])
export const roleAccess: FieldAccess = ({ req }) => hasRole(req.user, ['leader', 'teacher'])
export const published: Access = ({ req }) =>
  hasRole(req.user, ['core', 'leader', 'teacher']) || { _status: { equals: 'published' } }
