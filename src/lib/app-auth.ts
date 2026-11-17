import 'server-only'
import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'

export function createAppAuth(appUserCollection: 'users') {
  async function getAppPayload() {
    const payload = await getPayloadClient()
    const auth = payload.collections[appUserCollection].config.auth
    // The managed CMS initializes its own OAuth strategy; add only the
    // configured app-user strategy without altering the CMS strategies.
    if (auth) {
      for (const strategy of auth.strategies) {
        if (!payload.authStrategies.some((entry) => entry.name === strategy.name)) {
          payload.authStrategies.push(strategy)
        }
      }
    }
    return payload
  }
  return {
    async currentUser() {
      const token = (await cookies()).get('app-session')?.value
      if (!token) return null
      const payload = await getAppPayload()
      const { user } = await payload.auth({
        headers: new Headers({ Authorization: `JWT ${token}` }),
      })
      return user?.collection === appUserCollection ? user : null
    },
    async login(email: string, code: string, studentCode: string) {
      const payload = await getAppPayload()
      const result = await payload.login({
        collection: appUserCollection,
        data: { email, password: code },
      })
      if (!result.user || result.user.studentCode !== studentCode || !result.token)
        throw new Error('Оюутны код эсвэл баталгаажуулах код буруу байна.')
      const cookieStore = await cookies()
      const secure =
        process.env.NODE_ENV === 'production' ||
        process.env.FIGMA_PUBLIC_URL?.startsWith('https://') === true
      cookieStore.set('app-session', result.token, {
        httpOnly: true,
        secure,
        sameSite: secure ? 'none' : 'lax',
        path: '/',
        maxAge: 7200,
      })
      return result.user
    },
    async logout() {
      ;(await cookies()).delete('app-session')
    },
  }
}
export const appAuth = createAppAuth('users')
