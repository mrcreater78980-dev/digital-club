import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Cloud,
  CodeXml,
  Container,
  GitBranch,
  MapPin,
  Paintbrush,
  Sparkles,
} from 'lucide-react'
import { Badge, Card, Heading, tones, type Tone } from '@/components/clay/ui'
import { dateLabel } from '@/lib/club-types'
import type { Post, Event, Project, Track, Media } from '@/payload-types'

export const trackIcons = {
  docker: Container,
  cloud: Cloud,
  git: GitBranch,
  design: Paintbrush,
  ai: BrainCircuit,
}
export function TrackArt({
  icon,
  tone = 'violet',
  className = '',
}: {
  icon: string
  tone?: Tone
  className?: string
}) {
  const Icon = trackIcons[icon as keyof typeof trackIcons] ?? CodeXml
  return (
    <span
      className={`clay-floating relative flex size-19 items-center justify-center rounded-[1.6rem] ${tones[tone]} ${className}`}
    >
      <Icon size={39} strokeWidth={2.3} className="relative z-10 text-ink/80" />
      <span className="absolute top-2 left-3 h-2 w-8 rounded-full bg-white/45 blur-sm" />
    </span>
  )
}
export function TrackCard({ track }: { track: Track }) {
  const tone = track.color as Tone
  return (
    <Link href={`/learn?track=${track.icon}`} className="group block h-full">
      <Card
        tone={tone}
        className="lift flex h-full flex-col items-center px-4 pt-7 pb-5 text-center"
      >
        <TrackArt
          icon={track.icon}
          tone={tone}
          className="mb-5 -rotate-6 transition-transform group-hover:rotate-0"
        />
        <Heading as="h3" className="text-base leading-tight">
          {track.title}
        </Heading>
        <p className="mt-2 text-xs text-muted">{track.steps?.length ?? 0} алхам · Анхан шат</p>
        <span className="mt-5 flex items-center gap-2 text-xs font-extrabold">
          Суралцаж эхлэх
          <ArrowRight size={14} />
        </span>
      </Card>
    </Link>
  )
}
export function ContentImage({
  image,
  title,
  className = '',
}: {
  image?: string | Media | null
  title: string
  className?: string
}) {
  const media = typeof image === 'object' && image ? image : null
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-violet-soft ${className}`}>
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt || title}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-soft to-sky-soft">
          <Sparkles size={56} className="text-violet/60" />
        </div>
      )}
    </div>
  )
}
export function NewsCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.slug}`} className="group block">
      <Card className="lift h-full p-3">
        <ContentImage image={post.image} title={post.title} className="h-48" />
        <div className="px-3 pt-5 pb-4">
          <div className="flex items-center justify-between gap-2">
            <Badge
              tone={
                post.category === 'Амжилт'
                  ? 'mint'
                  : post.category === 'Технологи'
                    ? 'sky'
                    : 'violet'
              }
            >
              {post.category}
            </Badge>
            <span className="text-xs text-muted">{dateLabel(post.date)}</span>
          </div>
          <Heading as="h3" className="mt-4 text-lg leading-snug">
            {post.title}
          </Heading>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{post.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-violet-dark">
            Дэлгэрэнгүй
            <ArrowRight size={15} />
          </span>
        </div>
      </Card>
    </Link>
  )
}
export function EventCard({ event }: { event: Event }) {
  const date = new Date(event.date)
  const archived = event.archived || date < new Date()
  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <Card className="lift flex h-full items-start gap-5 p-6">
        <div
          className={`clay flex w-19 shrink-0 flex-col items-center rounded-3xl px-3 py-3 ${event.scope === 'internal' ? 'bg-violet-soft' : 'bg-peach-soft'}`}
        >
          <span className="text-[10px] font-extrabold">{date.getUTCMonth() + 1}-Р САР</span>
          <span className="text-3xl font-black leading-tight">
            {String(date.getUTCDate()).padStart(2, '0')}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <Badge tone={archived ? 'peach' : event.scope === 'internal' ? 'mint' : 'peach'}>
            {archived
              ? 'Архивлагдсан'
              : event.scope === 'internal'
                ? 'Дотоод сургалт'
                : 'Сургуулийн зар'}
          </Badge>
          <Heading as="h3" className="mt-3 text-lg leading-snug">
            {event.title}
          </Heading>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <MapPin size={14} />
            {event.location}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-violet-dark">
            Дэлгэрэнгүй
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Card>
    </Link>
  )
}
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <Card className="lift h-full p-3">
        <div
          className={`relative flex h-48 items-center justify-center overflow-hidden rounded-3xl ${index % 2 ? 'bg-mint-soft' : 'bg-violet-soft'}`}
        >
          {typeof project.image === 'object' && project.image?.url ? (
            <Image
              src={project.image.url}
              alt={project.image.alt || project.title}
              fill
              sizes="(max-width:768px) 100vw, 400px"
              className="object-cover"
            />
          ) : (
            <div className="clay-floating w-4/5 -rotate-6 rounded-2xl bg-paper p-4">
              <div className="mb-4 flex gap-1.5">
                <span className="size-2 rounded-full bg-peach" />
                <span className="size-2 rounded-full bg-yellow" />
                <span className="size-2 rounded-full bg-mint" />
              </div>
              <span className="font-black text-violet-dark">{project.title.split('—')[0]}</span>
              <div className="mt-3 flex gap-2">
                <span className="clay h-12 w-1/3 rounded-xl bg-violet-soft" />
                <span className="clay h-12 flex-1 rounded-xl bg-mint-soft" />
              </div>
            </div>
          )}
        </div>
        <div className="p-3 pt-5">
          <Heading as="h3" className="text-lg">
            {project.title}
          </Heading>
          <p className="mt-2 line-clamp-2 text-sm text-muted">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.technologies.split(',').map((tech) => (
              <Badge key={tech} tone={index % 2 ? 'mint' : 'violet'}>
                {tech.trim()}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
}
