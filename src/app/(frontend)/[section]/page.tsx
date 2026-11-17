import { notFound } from 'next/navigation'
import { getClubContent } from '@/lib/club-content'
import {
  AboutView,
  EventsView,
  ForbiddenView,
  LoginView,
  MembersView,
  NewsView,
  ProjectsView,
  RoadmapView,
  TrainingView,
} from '@/components/club/pages'
import { ManageView } from '@/components/club/manage'
import { DesignSystemView } from '@/components/club/design-system'

export const dynamicParams = false
export function generateStaticParams() {
  return [
    'news',
    'events',
    'learn',
    'projects',
    'members',
    'about',
    'training',
    'login',
    'manage',
    '403',
    'design-system',
  ].map((section) => ({ section }))
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (section === 'about') return <AboutView />
  if (section === 'login') return <LoginView />
  if (section === 'manage') return <ManageView />
  if (section === '403') return <ForbiddenView />
  if (section === 'design-system') return <DesignSystemView />
  const content = await getClubContent()
  if (section === 'news') return <NewsView posts={content.posts} />
  if (section === 'events') return <EventsView events={content.events} />
  if (section === 'learn') return <RoadmapView tracks={content.tracks} />
  if (section === 'projects') return <ProjectsView projects={content.projects} />
  if (section === 'members') return <MembersView members={content.members} />
  if (section === 'training') return <TrainingView events={content.events} />
  notFound()
}
