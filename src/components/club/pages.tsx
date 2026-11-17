'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CodeXml,
  ExternalLink,
  GraduationCap,
  Heart,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Heading,
  Input,
  ProgressStep,
  Skeleton,
  Tabs,
  tones,
  useToast,
  type Tone,
} from '@/components/clay/ui'
import type { ClubContent } from '@/lib/club-content'
import type { Event, Member, Post, Project, Track } from '@/payload-types'
import { dateLabel, roleLabels, safeHref, timeLabel } from '@/lib/club-types'
import { ContentImage, EventCard, NewsCard, ProjectCard, TrackArt } from './content-cards'
import { SectionTitle } from './home'
import { clubRequest, useSession } from './session'

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="pt-12 pb-9 text-center md:pt-16 md:pb-12">
      <Badge className="clay mb-5 px-4 py-2">
        <Sparkles size={13} />
        {eyebrow}
      </Badge>
      <Heading as="h1" className="text-4xl leading-tight md:text-5xl">
        {title}
      </Heading>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
        {description}
      </p>
    </div>
  )
}
export function NewsView({ posts }: { posts: Post[] }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Бүгд')
  const categories = ['Бүгд', 'Клубын мэдээ', 'Технологи', 'Амжилт', 'Зөвлөгөө']
  const selected = categories.includes(category) ? category : 'Бүгд'
  const filtered = posts.filter(
    (p) =>
      (selected === 'Бүгд' || p.category === selected) &&
      `${p.title} ${p.description}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="КЛУБЫН ӨДӨР ТУТАМ"
        title="Мэдлэг, мэдээ, урам зориг"
        description="Манай клубын шинэ мэдээ, технологийн сонин хачин, хамтдаа бүтээсэн амжилтууд."
      />
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          items={categories.map((c) => ({ label: c, value: c }))}
          value={selected}
          onChange={setCategory}
        />
        <div className="relative w-full lg:w-72">
          <Search size={18} className="pointer-events-none absolute top-4 left-5 text-muted" />
          <Input
            aria-label="Мэдээ хайх"
            placeholder="Мэдээ хайх..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="[&_input]:pl-12"
          />
        </div>
      </div>
      <p className="mb-5 text-xs text-muted">{filtered.length} мэдээ</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post) => (
          <NewsCard key={post.id} post={post} />
        ))}
        {!filtered.length && <Empty description="Хайлтын үгээ эсвэл ангиллаа өөрчлөөд үзээрэй." />}
      </div>
    </main>
  )
}
export function EventsView({ events }: { events: Event[] }) {
  const [scope, setScope] = useState('internal')
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('scope') === 'school') setScope('school')
  }, [])
  const filtered = events.filter((e) => e.scope === scope)
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="ХАМТДАА ОРОЛЦЪЁ"
        title="Танилц. Суралц. Урам ав."
        description="Дотоод сургалтууд болон сургуулийн үйл явдлын мэдээлэл нэг дор."
      />
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Tabs
          items={[
            { value: 'internal', label: 'Дотоод сургалт', icon: <BookOpen size={16} /> },
            { value: 'school', label: 'Сургуулийн зар', icon: <CalendarDays size={16} /> },
          ]}
          value={scope}
          onChange={setScope}
        />
        <Button href="/training" variant="ghost" className="text-violet-dark">
          Миний дотоод сургалт
          <ArrowRight size={16} />
        </Button>
      </div>
      {scope === 'school' && (
        <Card tone="peach" className="mb-7 flex items-start gap-3 p-5">
          <Info className="mt-0.5 shrink-0" size={19} />
          <p className="text-sm">
            Сургуулийн арга хэмжээний бүртгэлийг зохион байгуулагч өөр сувгаар авна.
          </p>
        </Card>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
        {!filtered.length && <Empty />}
      </div>
    </main>
  )
}
export function RoadmapView({ tracks }: { tracks: Track[] }) {
  const [selected, setSelected] = useState<string>(tracks[0]?.icon ?? 'docker')
  const [step, setStep] = useState<number | null>(null)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('track')
    if (id && tracks.some((t) => t.icon === id)) setSelected(id)
  }, [tracks])
  const track = tracks.find((t) => t.icon === selected) ?? tracks[0]
  const tone = (track?.color ?? 'violet') as Tone
  function choose(icon: string) {
    setSelected(icon)
    setStep(null)
    window.history.replaceState(null, '', `/learn?track=${icon}`)
  }
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="АЛХАМ БҮР НЬ ШИНЭ БОЛОМЖ"
        title="Чиний суралцах зам"
        description="Хаанаас эхлэхээ мэдэхгүй байна уу? Чиглэлээ сонгоод эхний жижиг алхмаа хийгээрэй."
      />
      <div
        role="tablist"
        aria-label="Сургалтын чиглэл"
        className="grid grid-cols-2 gap-3 md:grid-cols-5"
      >
        {tracks.map((t) => (
          <Button
            key={t.id}
            role="tab"
            aria-selected={selected === t.icon}
            variant="secondary"
            onClick={() => choose(t.icon)}
            className={`flex-col rounded-3xl px-3 py-5 ${tones[t.color as Tone]} ${selected === t.icon ? 'clay-pressed ring-2 ring-violet/40' : ''}`}
          >
            <TrackArt
              icon={t.icon}
              tone={t.color as Tone}
              className="mb-2 size-13 rounded-2xl [&_svg]:size-7"
            />
            {t.title}
          </Button>
        ))}
      </div>
      {!track ? (
        <div className="mt-8">
          <Empty />
        </div>
      ) : (
        <>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Heading className="text-3xl">{track.title}</Heading>
              <p className="mt-2 max-w-xl text-sm text-muted">{track.description}</p>
            </div>
            <Badge tone={tone}>{track.steps?.length ?? 0} алхам · Өөрийн хурдаар</Badge>
          </div>
          <Card className="relative mt-8 overflow-hidden px-5 py-10 md:px-16 md:py-14">
            <div className="absolute top-16 bottom-16 left-13 w-1 rounded-full bg-violet-soft md:hidden" />
            <svg
              viewBox="0 0 800 800"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 hidden h-full w-full md:block"
            >
              <path
                d="M300 50 C650 100 650 160 400 210 S150 340 430 380 S670 510 370 550 S180 680 430 740"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray="7 12"
                strokeLinecap="round"
                className="text-violet-soft"
              />
            </svg>
            <div className="relative mx-auto max-w-3xl space-y-7">
              {(track.steps ?? []).map((item, i) => (
                <div
                  key={item.id ?? i}
                  className={`relative md:w-[84%] ${i % 2 ? 'md:ml-auto' : 'md:mr-auto'}`}
                >
                  <Button
                    variant="secondary"
                    onClick={() => setStep(step === i ? null : i)}
                    aria-expanded={step === i}
                    className={`w-full justify-start gap-4 rounded-clay px-4 py-4 text-left md:px-5 ${step === i ? tones[tone] : ''}`}
                  >
                    <ProgressStep number={i + 1} active={step === i} />
                    <span className="min-w-0 flex-1">
                      <span className="mb-1 block text-[10px] text-muted">
                        АЛХАМ {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm md:text-lg">{item.title}</span>
                    </span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 transition-transform ${step === i ? 'rotate-180' : ''}`}
                    />
                  </Button>
                  {step === i && (
                    <div className="animate-enter ml-6 rounded-b-3xl bg-surface/80 px-5 pt-6 pb-7 md:ml-20">
                      <p className="text-sm leading-relaxed text-muted">{item.description}</p>
                      <p className="mt-5 mb-2 text-xs font-extrabold">Эзэмших ур чадвар</p>
                      <Badge tone={tone}>
                        <CheckCircle2 size={13} />
                        {item.skill}
                      </Badge>
                      <div className="mt-5">
                        {safeHref(item.material) && (
                          <Button href={item.material} target="_blank" className="text-xs">
                            <BookOpen size={15} />
                            Сургалтын материал
                            <ExternalLink size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="relative mx-auto mt-9 flex max-w-3xl items-center gap-4 rounded-3xl bg-mint-soft p-5">
              <span className="clay flex size-14 shrink-0 items-center justify-center rounded-full bg-paper">
                <Rocket size={26} />
              </span>
              <div>
                <Heading as="h3" className="text-base">
                  Эхэлсэн нь өөрөө амжилт!
                </Heading>
                <p className="mt-1 text-xs text-muted">
                  Суралцсан зүйлээ бодит төсөл дээр туршаад үзээрэй.
                </p>
              </div>
            </div>
          </Card>
          <p className="mt-6 flex items-start justify-center gap-2 text-center text-sm text-muted">
            <Info size={17} className="mt-0.5 shrink-0" />
            Энэ нь чиглэл заасан зам бөгөөд заавал дагах шаардлагагүй.
          </p>
        </>
      )}
    </main>
  )
}
export function ProjectsView({ projects }: { projects: Project[] }) {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="САНААНААС БОДИТ БҮТЭЭЛ РҮҮ"
        title="Бид ингэж бүтээдэг"
        description="Суралцсан мэдлэг, хамтын хичээл зүтгэлээр бүтсэн оюутнуудын төслүүд."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
        {!projects.length && <Empty />}
      </div>
    </main>
  )
}
export function MembersView({ members }: { members: Member[] }) {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="НЭГ БАГ, ОЛОН СУПЕР ЧАДВАР"
        title="Манай дижитал гэр бүл"
        description="Мэдлэгээ хуваалцаж, нэгнээ дэмжиж, ирээдүйгээ хамтдаа бүтээж буй хүмүүс."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member, i) => (
          <Card key={member.id} className="lift p-7 text-center">
            <Avatar
              name={member.name}
              className="mb-5 size-22 text-2xl"
              tone={(['violet', 'mint', 'peach', 'sky'] as const)[i % 4]}
            />
            <Heading as="h3" className="text-lg">
              {member.name}
            </Heading>
            <div className="mt-3">
              <Badge
                tone={
                  member.role === 'leader'
                    ? 'yellow'
                    : member.role === 'teacher'
                      ? 'mint'
                      : 'violet'
                }
              >
                {roleLabels[member.role]}
              </Badge>
            </div>
            <p className="mt-4 text-xs text-muted">{member.major}</p>
          </Card>
        ))}
        {!members.length && <Empty />}
      </div>
    </main>
  )
}
export function AboutView() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="СУРАЛЦ. ТУРШ. БҮТЭЭ."
        title="Технологиор холбогдсон бид"
        description="Digital Club бол ШУТИС-ийн Дархан-Уул аймаг дахь Технологийн сургуулийн оюутны технологийн клуб."
      />
      <Card tone="violet" className="grid items-center gap-8 p-7 md:grid-cols-[1.3fr_1fr] md:p-12">
        <div>
          <Badge className="bg-paper">Бидний эрхэм зорилго</Badge>
          <Heading className="mt-5 text-3xl md:text-4xl">
            Сониуч сэтгэлийг
            <br />
            бодит чадвар болгох.
          </Heading>
          <p className="mt-5 text-sm leading-loose text-muted">
            Бид технологийн мэдлэгээ нээлттэй хуваалцаж, жижиг туршилтаас бодит төсөл хүртэл хамтдаа
            суралцдаг. Алдаанаас айхгүй, асуултаас ичихгүй, нэгнээ дэмждэг орчныг бий болгох нь
            бидний зорилго.
          </p>
        </div>
        <div className="flex justify-center">
          <span className="clay-floating flex size-48 -rotate-6 items-center justify-center rounded-[3rem] bg-paper">
            <Rocket size={100} strokeWidth={1.8} className="text-violet" />
          </span>
        </div>
      </Card>
      <section className="mt-14">
        <SectionTitle eyebrow="ЧАМД НЭЭЛТТЭЙ" title="Хэн нэгдэж болох вэ?" />
        <div className="grid gap-5 md:grid-cols-3">
          {['Кибер аюулгүй байдал', 'Мэдээллийн систем', 'Программ хангамж'].map((major, i) => (
            <Card tone={(['sky', 'mint', 'peach'] as const)[i]} key={major} className="p-7">
              <GraduationCap size={32} />
              <Heading as="h3" className="mt-5 text-xl">
                {major}
              </Heading>
              <p className="mt-3 text-sm text-muted">
                1–4-р курсын оюутан бүрд нээлттэй. Суралцах хүсэл байхад л хангалттай.
              </p>
            </Card>
          ))}
        </div>
      </section>
      <Card className="mt-12 grid gap-6 p-7 md:grid-cols-2 md:p-10">
        <div>
          <Heading className="text-2xl">Холбоо барья</Heading>
          <p className="mt-3 text-sm text-muted">
            Клубын талаар асуух зүйл байвал бидэнтэй холбогдоорой.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-3">
            <Users size={18} />
            Сургалтын мастер Г.Уянга
          </p>
          <Link
            href="tel:99063222"
            className="flex items-center gap-3 font-extrabold text-violet-dark"
          >
            <Phone size={18} />
            99063222
          </Link>
          <p className="flex items-center gap-3 text-muted">
            <MapPin size={18} />
            Дархан-Уул аймаг, ШУТИС-ийн Технологийн сургууль
          </p>
        </div>
      </Card>
    </main>
  )
}
export function RegistrationControl({ event }: { event: Event }) {
  const { user, loading } = useSession()
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  useEffect(() => {
    if (user)
      fetch(`/api/club/registration?training=${event.id}`)
        .then((r) => r.json())
        .then((data) => setStatus(data.registration?.status ?? ''))
        .catch(() => setError('Бүртгэлийн төлөв ачаалж чадсангүй.'))
    else setStatus('')
  }, [user, event.id])
  if (event.scope === 'school')
    return (
      <Card tone="peach" className="flex items-start gap-3 p-5">
        <Info size={20} className="mt-0.5 shrink-0" />
        <p className="text-sm font-bold">Бүртгэлийг зохион байгуулагч өөр сувгаар авна.</p>
      </Card>
    )
  if (event.archived || new Date(event.date) < new Date())
    return (
      <Badge tone="peach">
        <Clock3 size={14} />
        Архивлагдсан
      </Badge>
    )
  if (loading) return <Skeleton className="h-14 w-full" />
  if (!user)
    return (
      <Card tone="violet" className="p-6 text-center">
        <LockKeyhole size={28} className="mx-auto text-violet-dark" />
        <Heading as="h3" className="mt-3 text-lg">
          Хамтдаа суралцахад бэлэн үү?
        </Heading>
        <p className="mt-2 text-sm text-muted">Бүртгүүлэхийн тулд нэвтэрнэ үү.</p>
        <Button href={`/login?next=/events/${event.slug}`} className="mt-5">
          <LockKeyhole size={16} />
          Нэвтрэх
        </Button>
      </Card>
    )
  async function register() {
    setBusy(true)
    setError('')
    try {
      const next = status === 'registered' ? 'cancelled' : 'registered'
      const result = await clubRequest('registration', { training: event.id, status: next })
      setStatus(result.registration.status)
      toast(
        next === 'registered'
          ? 'Сургалтад амжилттай бүртгэгдлээ.'
          : 'Бүртгэлийг цуцаллаа. Та дахин бүртгүүлэх боломжтой.',
      )
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      {status === 'registered' && (
        <p className="mb-4 flex items-center gap-2 text-sm font-extrabold text-emerald-800">
          <CheckCircle2 size={19} />
          Бүртгэгдсэн
        </p>
      )}
      <Button
        onClick={register}
        disabled={busy}
        variant={status === 'registered' ? 'secondary' : 'primary'}
        className="w-full"
      >
        {busy
          ? 'Түр хүлээнэ үү...'
          : status === 'registered'
            ? 'Цуцлах'
            : status === 'cancelled'
              ? 'Дахин бүртгүүлэх'
              : 'Бүртгүүлэх'}
        {status !== 'registered' && <ArrowRight size={17} />}
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
export function DetailView({
  section,
  item,
}: {
  section: 'news' | 'events' | 'projects'
  item: Post | Event | Project
}) {
  const event = section === 'events' ? (item as Event) : null
  const post = section === 'news' ? (item as Post) : null
  const project = section === 'projects' ? (item as Project) : null
  return (
    <main className="mx-auto max-w-5xl px-4 pt-9 md:px-10 md:pt-12">
      <Button href={`/${section}`} variant="ghost" className="mb-6 px-0 text-violet-dark">
        <ArrowLeft size={17} />
        {section === 'news'
          ? 'Мэдээ рүү буцах'
          : section === 'events'
            ? 'Арга хэмжээ рүү буцах'
            : 'Төслүүд рүү буцах'}
      </Button>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Badge tone={event ? (event.scope === 'internal' ? 'mint' : 'peach') : 'violet'}>
          {post?.category ??
            (event
              ? event.scope === 'internal'
                ? 'Дотоод сургалт'
                : 'Сургуулийн зар'
              : 'Клубын төсөл')}
        </Badge>
        {post && <span className="text-xs text-muted">{dateLabel(post.date)}</span>}
      </div>
      <Heading as="h1" className="max-w-3xl text-3xl leading-tight md:text-5xl">
        {item.title}
      </Heading>
      <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted">{item.description}</p>
      <ContentImage image={item.image} title={item.title} className="mt-8 h-60 md:h-96" />
      <div className={`mt-9 grid gap-8 ${event ? 'md:grid-cols-[1.2fr_1fr]' : ''}`}>
        <Card className="p-6 md:p-8">
          <Heading className="text-2xl">
            {event ? 'Сургалтын тухай' : project ? 'Төслийн тухай' : 'Дэлгэрэнгүй'}
          </Heading>
          <div className="mt-5 whitespace-pre-line text-sm leading-loose text-muted">
            {post?.body || project?.body || item.description}
          </div>
          {event && (
            <div className="mt-6 space-y-4 text-sm">
              <p className="flex items-center gap-3">
                <CalendarDays size={19} className="text-violet" />
                {dateLabel(event.date)}
              </p>
              <p className="flex items-center gap-3">
                <Clock3 size={19} className="text-violet" />
                {timeLabel(event.date)}
              </p>
              <p className="flex items-center gap-3">
                <MapPin size={19} className="text-violet" />
                {event.location}
              </p>
            </div>
          )}
          {project && (
            <>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.technologies.split(',').map((tech) => (
                  <Badge key={tech}>{tech.trim()}</Badge>
                ))}
              </div>
              {safeHref(project.link) && (
                <Button href={project.link!} target="_blank" className="mt-6">
                  Төслийн холбоос
                  <ExternalLink size={16} />
                </Button>
              )}
            </>
          )}
        </Card>
        {event && (
          <Card className="h-fit p-6 md:p-8">
            <Heading as="h3" className="mb-5 text-xl">
              {event.scope === 'school' ? 'Мэдээлэл' : 'Оролцох хүсэлт'}
            </Heading>
            <RegistrationControl event={event} />
          </Card>
        )}
      </div>
    </main>
  )
}
export function TrainingView({ events }: { events: Event[] }) {
  const { user, loading } = useSession()
  const [trainings, setTrainings] = useState<Event[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    if (user)
      fetch('/api/club/trainings')
        .then(async (r) => {
          const data = await r.json()
          if (!r.ok) throw new Error(data.error)
          setTrainings(data.events ?? [])
        })
        .catch((e) => setError(e.message))
  }, [user])
  return (
    <main className="mx-auto max-w-6xl px-4 md:px-10">
      <PageHeading
        eyebrow="ГИШҮҮДИЙН СУРАЛЦАХ ОРОН ЗАЙ"
        title="Дотоод сургалт"
        description="Сургалтын хуваарь, сэдэв, хэрэгтэй материалууд болон таны бүртгэл."
      />
      {loading ? (
        <Skeleton className="h-64" />
      ) : !user ? (
        <Card className="mx-auto max-w-2xl px-7 py-14 text-center">
          <span className="clay-floating mx-auto flex size-24 -rotate-6 items-center justify-center rounded-clay bg-violet-soft">
            <LockKeyhole size={40} className="text-violet-dark" />
          </span>
          <Heading className="mt-8 text-2xl">Гишүүдэд зориулсан боломж</Heading>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
            Дотоод сургалтад бүртгүүлэх, материалуудтай танилцахын тулд IT гишүүний эрхээр нэвтэрнэ
            үү.
          </p>
          <Button href="/login?next=/training" className="mt-7">
            Нэвтрэх
            <ArrowRight size={17} />
          </Button>
          <p className="mt-5 text-xs text-muted">
            Нээлттэй сургалтын чиглэлийг нэвтрэхгүйгээр үзэх боломжтой.
          </p>
          <Button href="/learn" variant="ghost" className="mt-2 text-violet-dark">
            Сургалтын чиглэл үзэх
            <ArrowUpRight size={15} />
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card tone="mint" className="flex items-center gap-3 p-5">
            <CheckCircle2 size={22} />
            <p className="text-sm font-bold">
              Сайн уу, {user.name}! Дараагийн шинэ чадвараа хамтдаа эзэмшицгээе.
            </p>
          </Card>
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          {(trainings.length ? trainings : events.filter((e) => e.scope === 'internal')).map(
            (event) => (
              <Card key={event.id} className="grid gap-6 p-6 md:grid-cols-[1fr_280px] md:p-8">
                <div>
                  <Badge tone="mint">Дотоод сургалт</Badge>
                  <Heading as="h3" className="mt-4 text-xl">
                    {event.title}
                  </Heading>
                  <p className="mt-3 text-sm text-muted">{event.description}</p>
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <CalendarDays size={15} />
                    {dateLabel(event.date)}
                    <span>·</span>
                    {event.location}
                  </p>
                  {safeHref(event.material) && (
                    <Button
                      href={event.material!}
                      target="_blank"
                      variant="secondary"
                      className="mt-5 text-xs"
                    >
                      <BookOpen size={15} />
                      Сургалтын материал
                      <ExternalLink size={14} />
                    </Button>
                  )}
                </div>
                <div className="self-center">
                  <RegistrationControl event={event} />
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </main>
  )
}
const demoAccounts = [
  { name: 'IT гишүүн', studentCode: 'DC24001', email: 'enkhjin@student.example.edu.mn' },
  { name: 'Үндсэн гишүүн', studentCode: 'DC24002', email: 'temuulen@student.example.edu.mn' },
  { name: 'Клубын тэргүүн', studentCode: 'DC24003', email: 'nomin@student.example.edu.mn' },
  { name: 'Багш', studentCode: 'DC24004', email: 'uyanga@student.example.edu.mn' },
]
export function LoginView() {
  const [studentCode, setStudentCode] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [stage, setStage] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { user, refresh } = useSession()
  const router = useRouter()
  const toast = useToast()
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^(DC\d{5}|B\d{9})$/.test(studentCode.toUpperCase())) {
      setError('IT чиглэлийн оюутан биш байна')
      return
    }
    if (!/@(student\.example\.edu\.mn|stda\.edu\.mn)$/i.test(email)) {
      setError('Сургуулийн туршилтын имэйл хаягаа оруулна уу.')
      return
    }
    if (stage === 1) {
      setStage(2)
      return
    }
    setBusy(true)
    try {
      await clubRequest('login', { studentCode, email, code })
      await refresh()
      toast('Амжилттай нэвтэрлээ. Digital Club-д тавтай морил!')
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next && /^\/(?!\/)/.test(next) && !next.includes('\\') ? next : '/training')
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <main className="mx-auto max-w-5xl px-4 pt-12 md:px-10 md:pt-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="hidden md:block">
          <Badge className="clay">СУРАЛЦАХ ХҮСЛЭЭР НЭГДСЭН</Badge>
          <Heading as="h1" className="mt-6 text-5xl leading-tight">
            Дараагийн алхмаа
            <br />
            <span className="text-violet">хамтдаа</span> хийе.
          </Heading>
          <p className="mt-6 text-sm leading-loose text-muted">
            Сургалтад бүртгүүлж, мэдлэгээ тэлж, бүтээлч хамт олныхоо нэг хэсэг болоорой.
          </p>
          <span className="clay-floating mt-10 inline-flex size-36 -rotate-6 items-center justify-center rounded-[2.5rem] bg-mint-soft">
            <ShieldCheck size={74} className="text-ink/75" />
          </span>
        </div>
        <Card className="p-6 md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="clay-violet flex size-12 items-center justify-center rounded-2xl bg-violet text-white">
              <CodeXml size={26} />
            </span>
            <div>
              <Heading as="h2" className="text-2xl">
                Тавтай морил!
              </Heading>
              <p className="text-xs text-muted">IT оюутны нэвтрэлт</p>
            </div>
          </div>
          {user ? (
            <div className="py-6 text-center">
              <CheckCircle2 size={44} className="mx-auto text-emerald-700" />
              <Heading as="h3" className="mt-4 text-xl">
                Та нэвтэрсэн байна
              </Heading>
              <p className="mt-2 text-sm">
                {user.name} · {roleLabels[user.role]}
              </p>
              <Button href={user.role === 'member' ? '/training' : '/manage'} className="mt-6">
                Үргэлжлүүлэх
                <ArrowRight size={17} />
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-3">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-black ${stage === 1 ? 'bg-violet text-white' : 'bg-mint-soft'}`}
                >
                  {stage > 1 ? <Check size={14} /> : 1}
                </span>
                <span className="text-xs font-bold">Оюутны мэдээлэл</span>
                <span className="h-0.5 flex-1 bg-violet-soft" />
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-black ${stage === 2 ? 'bg-violet text-white' : 'bg-violet-soft'}`}
                >
                  2
                </span>
                <span className="text-xs font-bold">Баталгаажуулах</span>
              </div>
              <form onSubmit={submit} className="space-y-5">
                {stage === 1 ? (
                  <>
                    <Input
                      name="studentCode"
                      label="Оюутны код"
                      placeholder="Жишээ: DC24001"
                      value={studentCode}
                      required
                      onChange={(e) => setStudentCode(e.target.value)}
                    />
                    <Input
                      name="email"
                      type="email"
                      label="Сургуулийн имэйл"
                      placeholder="Нэвтрэх жишээг доороос сонгоорой"
                      value={email}
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted">{email}</p>
                    <Input
                      name="code"
                      label="Баталгаажуулах код"
                      placeholder="6 оронтой код"
                      value={code}
                      required
                      maxLength={6}
                      inputMode="numeric"
                      onChange={(e) => setCode(e.target.value)}
                      autoComplete="one-time-code"
                    />
                    <p className="text-xs text-muted">
                      Туршилтын код: <strong className="text-violet-dark">246810</strong>. Энэ
                      хувилбарт имэйл илгээхгүй.
                    </p>
                  </>
                )}
                {error && (
                  <p
                    role="alert"
                    className="rounded-2xl bg-peach-soft px-4 py-3 text-xs font-bold text-danger"
                  >
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={busy} className="w-full">
                  {busy
                    ? 'Шалгаж байна...'
                    : stage === 1
                      ? 'Баталгаажуулах код оруулах'
                      : 'Нэвтрэх'}
                  <ArrowRight size={17} />
                </Button>
                {stage === 2 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStage(1)
                      setError('')
                    }}
                    className="w-full"
                  >
                    <ArrowLeft size={15} />
                    Мэдээллээ засах
                  </Button>
                )}
              </form>
              <div className="mt-6 rounded-3xl bg-surface p-4">
                <p className="mb-3 flex items-center gap-2 text-xs font-extrabold">
                  <Info size={14} />
                  Туршилтын эрх сонгох
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {demoAccounts.map((account) => (
                    <Button
                      key={account.studentCode}
                      variant="secondary"
                      onClick={() => {
                        setStudentCode(account.studentCode)
                        setEmail(account.email)
                        setCode('')
                        setStage(1)
                        setError('')
                      }}
                      className="min-h-11 px-2 py-2 text-[10px]"
                    >
                      {account.name}
                    </Button>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-muted">
                  Зөвхөн зохиомол бүртгэл. Бодит оюутны мэдээлэл бүү оруулна уу. Сургуулийн имэйл
                  баталгаажуулалт холбогдоогүй.
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
export function ForbiddenView() {
  return (
    <main className="mx-auto max-w-2xl px-4 pt-16">
      <Card className="p-10 text-center">
        <span className="clay-floating mx-auto flex size-24 items-center justify-center rounded-clay bg-peach-soft">
          <LockKeyhole size={40} />
        </span>
        <Heading as="h1" className="mt-8 text-4xl">
          403
        </Heading>
        <Heading className="mt-2 text-2xl">Хандах эрхгүй</Heading>
        <p className="mt-4 text-sm text-muted">Энэ хэсэг зөвхөн эрх бүхий гишүүдэд нээлттэй.</p>
        <Button href="/" className="mt-7">
          <ArrowLeft size={16} />
          Нүүр хуудас руу
        </Button>
      </Card>
    </main>
  )
}
