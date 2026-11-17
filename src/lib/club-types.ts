export const roleLabels: Record<string, string> = {
  member: 'IT гишүүн',
  core: 'Үндсэн гишүүн',
  leader: 'Клубын тэргүүн',
  teacher: 'Багш',
}
export const navigation = [
  { href: '/', label: 'Нүүр', icon: 'home' },
  { href: '/news', label: 'Мэдээ', icon: 'news' },
  { href: '/events', label: 'Арга хэмжээ', icon: 'calendar' },
  { href: '/learn', label: 'Сургалт', icon: 'learn' },
  { href: '/projects', label: 'Төслүүд', icon: 'projects' },
  { href: '/members', label: 'Гишүүд', icon: 'members' },
  { href: '/about', label: 'Бидний тухай', icon: 'about' },
]
export type AppUser = { id: string; name: string; role: string; studentCode: string }
export function dateLabel(date: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Ulaanbaatar',
  }).formatToParts(new Date(date))
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${part('year')}.${part('month')}.${part('day')}`
}
export function safeHref(value?: string | null) {
  return value && /^https:\/\//.test(value) ? value : undefined
}
export function timeLabel(date: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Ulaanbaatar',
  }).formatToParts(new Date(date))
  return `${parts.find((p) => p.type === 'hour')?.value}:${parts.find((p) => p.type === 'minute')?.value}`
}
