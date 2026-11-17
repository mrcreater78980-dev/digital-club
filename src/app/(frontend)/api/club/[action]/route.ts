import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { hasRole, roles } from '@/lib/club-access'
import type { User } from '@/payload-types'
import { getClubContent } from '@/lib/club-content'
import { dateLabel } from '@/lib/club-types'

const publicUser = (user: User | null) =>
  user ? { id: user.id, name: user.name, role: user.role, studentCode: user.studentCode } : null
const fail = (error: string, status = 400) => Response.json({ error }, { status })
const text = (value: unknown, max = 10000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''
const isSafeURL = (value: string) => !value || /^https:\/\/[^\s]+$/.test(value)
function validOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const expected = process.env.FIGMA_PUBLIC_URL || process.env.NEXT_PUBLIC_SITE_URL
  if (!origin) return true
  const source = new URL(origin)
  return (
    source.host === request.headers.get('host') ||
    (!!expected && source.origin === new URL(expected).origin)
  )
}
export async function GET(request: Request, { params }: { params: Promise<{ action: string }> }) {
  try {
    const { action } = await params
    if (action === 'chat') {
      const question = text(new URL(request.url).searchParams.get('question'), 500)
      const content = await getClubContent()
      if (/docker|докер|roadmap/i.test(question)) {
        const track = content.tracks.find((t) => t.icon === 'docker')
        return Response.json({
          text: track
            ? `${track.description} Суралцах дараалал: ${(track.steps ?? []).map((s) => s.title).join(' → ')}.`
            : 'Docker чиглэлийн мэдээлэл хараахан нийтлэгдээгүй байна.',
          href: '/learn?track=docker',
          label: 'Эх сурвалж: Docker сургалтын зам',
        })
      }
      const school = /сургуул|арга хэмжээ|зар/i.test(question)
      const events = content.events
        .filter((e) => e.scope === (school ? 'school' : 'internal') && !e.archived)
        .slice(0, 3)
      return Response.json({
        text: events.length
          ? `${events.map((e) => `${e.title} — ${dateLabel(e.date)}, ${e.location}`).join('. ')}. ${school ? 'Бүртгэлийг зохион байгуулагч өөр сувгаар авна.' : 'IT гишүүний эрхээр нэвтэрч сургалтад бүртгүүлээрэй.'}`
          : 'Одоогоор нийтлэгдсэн мэдээлэл олдсонгүй. Сургалтын чиглэлүүдтэй танилцаарай.',
        href: school ? '/events?scope=school' : '/training',
        label: school ? 'Эх сурвалж: Сургуулийн зар' : 'Эх сурвалж: Дотоод сургалт',
      })
    }
    const user = await appAuth.currentUser()
    if (action === 'session')
      return Response.json(
        { user: publicUser(user) },
        { headers: { 'Cache-Control': 'private, no-store' } },
      )
    if (!user) return fail('Нэвтрэх шаардлагатай.', 401)
    const payload = await getPayloadClient()
    if (action === 'trainings') {
      const result = await payload.find({
        collection: 'events',
        overrideAccess: false,
        user,
        where: { and: [{ scope: { equals: 'internal' } }, { _status: { equals: 'published' } }] },
        sort: 'date',
        limit: 100,
        depth: 0,
      })
      return Response.json(
        { events: result.docs },
        { headers: { 'Cache-Control': 'private, no-store' } },
      )
    }
    if (action === 'registration') {
      const training = new URL(request.url).searchParams.get('training')
      const result = await payload.find({
        collection: 'registrations',
        overrideAccess: false,
        user,
        depth: 0,
        where: { and: [{ member: { equals: user.id } }, { training: { equals: training } }] },
        limit: 1,
      })
      return Response.json({ registration: result.docs[0] ?? null })
    }
    if (action === 'manage') {
      if (!hasRole(user, ['core', 'leader', 'teacher'])) return fail('403 Хандах эрхгүй', 403)
      const canEducate = hasRole(user, ['leader', 'teacher'])
      const canEdit = hasRole(user, ['core', 'leader'])
      const [posts, events, projects, tracks, users, registrations, activity, media] =
        await Promise.all([
          canEdit
            ? payload.find({
                collection: 'posts',
                overrideAccess: false,
                user,
                limit: 100,
                draft: true,
              })
            : null,
          payload.find({
            collection: 'events',
            overrideAccess: false,
            user,
            limit: 100,
            draft: true,
          }),
          canEdit
            ? payload.find({
                collection: 'projects',
                overrideAccess: false,
                user,
                limit: 100,
                draft: true,
              })
            : null,
          canEducate
            ? payload.find({
                collection: 'tracks',
                overrideAccess: false,
                user,
                limit: 20,
                draft: true,
              })
            : null,
          canEducate
            ? payload.find({
                collection: 'users',
                overrideAccess: false,
                user,
                limit: 100,
                select: { name: true, role: true, studentCode: true, major: true },
              })
            : null,
          canEducate
            ? payload.find({
                collection: 'registrations',
                overrideAccess: false,
                user,
                limit: 100,
                depth: 1,
              })
            : null,
          payload.find({
            collection: 'activity',
            overrideAccess: false,
            user,
            limit: 100,
            sort: '-createdAt',
          }),
          payload.find({ collection: 'media', overrideAccess: false, user, limit: 100, depth: 0 }),
        ])
      return Response.json({
        posts: posts?.docs ?? [],
        events: events.docs,
        projects: projects?.docs ?? [],
        tracks: tracks?.docs ?? [],
        users: users?.docs ?? [],
        registrations: registrations?.docs ?? [],
        activity: activity.docs,
        media: media.docs,
      })
    }
    return fail('Мэдээлэл олдсонгүй', 404)
  } catch {
    return fail('Мэдээлэл ачаалж чадсангүй. Дахин оролдоно уу.', 500)
  }
}
export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  if (!validOrigin(request)) return fail('Хүсэлт зөвшөөрөгдөөгүй.', 403)
  try {
    const { action } = await params
    if (action === 'logout') {
      await appAuth.logout()
      return Response.json({ success: true })
    }
    if (action === 'login') {
      const body = await request.json()
      const studentCode = text(body.studentCode, 30).toUpperCase()
      const email = text(body.email, 160).toLowerCase()
      const code = text(body.code, 100)
      if (!/^(DC\d{5}|B\d{9})$/.test(studentCode)) return fail('IT чиглэлийн оюутан биш байна')
if (!/@(student\.example\.edu\.mn|stda\.edu\.mn)$/i.test(email))
      if (!email.endsWith('@student.example.edu.mn'))
        return fail('Сургуулийн туршилтын имэйл хаягаа оруулна уу.')
      if (!code) return fail('Баталгаажуулах кодоо оруулна уу.')
      try {
        const user = await appAuth.login(email, code, studentCode)
        return Response.json({ user: publicUser(user) })
      } catch {
        return fail('Оюутны код, имэйл эсвэл баталгаажуулах код буруу байна.')
      }
    }
    const user = await appAuth.currentUser()
    if (!user) return fail('Нэвтрэх шаардлагатай.', 401)
    const payload = await getPayloadClient()
    if (action === 'upload') {
      if (!hasRole(user, ['core', 'leader', 'teacher'])) return fail('403 Хандах эрхгүй', 403)
      const form = await request.formData()
      const file = form.get('file')
      if (
        !(file instanceof File) ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 5000000
      )
        return fail('5 МБ-аас бага JPG, PNG, WebP зураг оруулна уу.')
      const doc = await payload.create({
        collection: 'media',
        overrideAccess: false,
        user,
        data: { alt: text(form.get('alt'), 180) || 'Клубын нийтлэлийн зураг' },
        file: {
          data: Buffer.from(await file.arrayBuffer()),
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
      })
      return Response.json({ doc })
    }
    const body = await request.json()
    if (action === 'registration') {
      const training = text(body.training, 100)
      if (!training || !['registered', 'cancelled'].includes(body.status))
        return fail('Бүртгэлийн мэдээлэл буруу байна.')
      const existing = await payload.find({
        collection: 'registrations',
        overrideAccess: false,
        user,
        depth: 0,
        where: { key: { equals: `${user.id}:${training}` } },
        limit: 1,
      })
      const doc = existing.docs[0]
        ? await payload.update({
            collection: 'registrations',
            id: existing.docs[0].id,
            overrideAccess: false,
            user,
            data: { status: body.status },
          })
        : await payload.create({
            collection: 'registrations',
            overrideAccess: false,
            user,
            data: { training, member: user.id, key: `${user.id}:${training}`, status: body.status },
          })
      return Response.json({ registration: doc })
    }
    if (action === 'role') {
      if (!hasRole(user, ['leader', 'teacher'])) return fail('403 Хандах эрхгүй', 403)
      if (!roles.includes(body.role) || typeof body.id !== 'string')
        return fail('Эрхийн мэдээлэл буруу байна.')
      if (body.id === user.id) return fail('Өөрийн эрхийг өөрчлөх боломжгүй.')
      await payload.update({
        collection: 'users',
        id: body.id,
        overrideAccess: false,
        user,
        data: { role: body.role },
      })
      return Response.json({ success: true })
    }
    if (action === 'roadmap') {
      if (!hasRole(user, ['leader', 'teacher'])) return fail('403 Хандах эрхгүй', 403)
      if (
        typeof body.id !== 'string' ||
        !Array.isArray(body.steps) ||
        body.steps.length < 1 ||
        body.steps.length > 30
      )
        return fail('1–30 алхам оруулна уу.')
      const steps: { title: string; description: string; skill: string; material: string }[] =
        body.steps.map((step: Record<string, unknown>) => ({
          title: text(step.title, 180),
          description: text(step.description, 3000),
          skill: text(step.skill, 180),
          material: text(step.material, 1000),
        }))
      if (
        steps.some(
          (s) => !s.title || !s.description || !s.skill || !s.material || !isSafeURL(s.material),
        )
      )
        return fail('Алхамын бүх талбарыг бөглөж, HTTPS материалын холбоос оруулна уу.')
      await payload.update({
        collection: 'tracks',
        id: body.id,
        overrideAccess: false,
        user,
        draft: body.publish !== true,
        data: { steps, _status: body.publish === true ? 'published' : 'draft' },
      })
      return Response.json({ success: true })
    }
    if (action === 'save' || action === 'delete') {
      const collection = body.collection
      if (!['posts', 'events', 'projects'].includes(collection)) return fail('Төрөл буруу байна.')
      if (
        !hasRole(user, ['core', 'leader']) &&
        !(collection === 'events' && hasRole(user, ['teacher']))
      )
        return fail('403 Хандах эрхгүй', 403)
      if (action === 'delete') {
        if (typeof body.id !== 'string') return fail('Мэдээллийн дугаар буруу байна.')
        await payload.delete({ collection, id: body.id, overrideAccess: false, user })
        return Response.json({ success: true })
      }
      const input = body.data ?? {}
      const title = text(input.title, 180),
        description = text(input.description)
      if (!title || !description) return fail('Гарчиг болон тайлбарыг заавал бөглөнө үү.')
      const data: Record<string, unknown> = {
        title,
        description,
        _status: body.publish === true ? 'published' : 'draft',
      }
      if (!body.id) data.slug = `${collection}-${Date.now().toString(36)}`
      if (typeof input.image === 'string' && input.image) data.image = input.image
      if (collection === 'posts') {
        data.category = ['Клубын мэдээ', 'Технологи', 'Амжилт', 'Зөвлөгөө'].includes(input.category)
          ? input.category
          : 'Клубын мэдээ'
        data.date = new Date().toISOString()
        data.body = text(input.body)
      }
      if (collection === 'events') {
        if (
          !['internal', 'school'].includes(input.scope) ||
          !text(input.location) ||
          !input.date ||
          Number.isNaN(Date.parse(input.date))
        )
          return fail('Огноо, байршил болон хамрах хүрээг бөглөнө үү.')
        if (user.role === 'teacher' && input.scope !== 'internal')
          return fail('Багш зөвхөн дотоод сургалт удирдана.', 403)
        const material = text(input.material, 1000)
        if (!isSafeURL(material)) return fail('HTTPS холбоос оруулна уу.')
        Object.assign(data, {
          scope: input.scope,
          location: text(input.location, 200),
          date: new Date(input.date).toISOString(),
          material,
          archived: input.archived === true,
        })
      }
      if (collection === 'projects') {
        if (!text(input.technologies)) return fail('Технологи оруулна уу.')
        if (!isSafeURL(text(input.link))) return fail('HTTPS холбоос оруулна уу.')
        Object.assign(data, {
          technologies: text(input.technologies, 300),
          link: text(input.link, 1000),
          body: text(input.body),
        })
      }
      const doc = body.id
        ? await payload.update({
            collection,
            id: body.id,
            data,
            overrideAccess: false,
            user,
            draft: body.publish !== true,
          })
        : await payload.create({
            collection,
            data,
            overrideAccess: false,
            user,
            draft: body.publish !== true,
          })
      return Response.json({ doc })
    }
    return fail('Хүсэлт олдсонгүй', 404)
  } catch (error) {
    const forbidden = error instanceof Error && /forbidden|not allowed/i.test(error.message)
    return fail(
      forbidden
        ? '403 Хандах эрхгүй'
        : 'Өөрчлөлтийг хадгалж чадсангүй. Талбаруудаа шалгаад дахин оролдоно уу.',
      forbidden ? 403 : 400,
    )
  }
}
