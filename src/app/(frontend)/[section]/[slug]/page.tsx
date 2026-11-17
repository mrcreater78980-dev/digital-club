import { notFound } from 'next/navigation'
import { getClubContent, getClubDetail } from '@/lib/club-content'
import { DetailView } from '@/components/club/pages'

export async function generateStaticParams() {
  const { posts, events, projects } = await getClubContent()
  return [
    ...posts.map((p) => ({ section: 'news', slug: p.slug })),
    ...events.map((p) => ({ section: 'events', slug: p.slug })),
    ...projects.map((p) => ({ section: 'projects', slug: p.slug })),
  ]
}
export default async function DetailPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>
}) {
  const { section, slug } = await params
  if (!['news', 'events', 'projects'].includes(section)) notFound()
  const type = section === 'news' ? 'posts' : section === 'events' ? 'events' : 'projects'
  const item = await getClubDetail(type, slug)
  if (!item) notFound()
  return <DetailView section={section as 'news' | 'events' | 'projects'} item={item} />
}
