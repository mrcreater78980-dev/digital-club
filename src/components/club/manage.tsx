'use client'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  FolderCode,
  GripVertical,
  History,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Map,
  Pencil,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  Dropdown,
  Empty,
  Heading,
  Input,
  Skeleton,
  StatusChip,
  Table,
  Textarea,
  Toggle,
  useToast,
} from '@/components/clay/ui'
import { clubRequest, useSession } from './session'
import { ForbiddenView, PageHeading } from './pages'
import { dateLabel, roleLabels } from '@/lib/club-types'
import type {
  Activity,
  Event,
  Media,
  Post,
  Project,
  Registration,
  Track,
  User,
} from '@/payload-types'

type ManageData = {
  posts: Post[]
  events: Event[]
  projects: Project[]
  tracks: Track[]
  users: User[]
  registrations: Registration[]
  activity: Activity[]
  media: Media[]
}
type Panel =
  | 'overview'
  | 'posts'
  | 'projects'
  | 'topics'
  | 'roadmap'
  | 'registrations'
  | 'users'
  | 'activity'
type EditableCollection = 'posts' | 'projects' | 'events'
type EditorForm = {
  title: string
  description: string
  body: string
  category: string
  scope: string
  date: string
  location: string
  material: string
  technologies: string
  link: string
  image: string
  archived: boolean
}
const blankForm: EditorForm = {
  title: '',
  description: '',
  body: '',
  category: 'Клубын мэдээ',
  scope: 'internal',
  date: '',
  location: '',
  material: '',
  technologies: '',
  link: '',
  image: '',
  archived: false,
}
type Confirm =
  | { kind: 'role'; id: string; role: string; name: string }
  | { kind: 'delete'; id: string; collection: EditableCollection; title: string }
  | { kind: 'step'; index: number; title: string }
  | null
type Step = NonNullable<Track['steps']>[number]
const menus = [
  { id: 'overview', label: 'Тойм', icon: LayoutDashboard, access: ['core', 'leader', 'teacher'] },
  { id: 'posts', label: 'Нийтлэл', icon: FileText, access: ['core', 'leader'] },
  { id: 'projects', label: 'Төсөл', icon: FolderCode, access: ['core', 'leader'] },
  {
    id: 'topics',
    label: 'Сургалтын сэдэв, материал',
    icon: BookOpen,
    access: ['leader', 'teacher'],
  },
  { id: 'roadmap', label: 'Сургалтын зам удирдах', icon: Map, access: ['leader', 'teacher'] },
  {
    id: 'registrations',
    label: 'Бүртгэлийн жагсаалт',
    icon: ListChecks,
    access: ['leader', 'teacher'],
  },
  { id: 'users', label: 'Гишүүд ба эрх', icon: Users, access: ['leader', 'teacher'] },
  { id: 'activity', label: 'Үйлдлийн түүх', icon: History, access: ['core', 'leader', 'teacher'] },
] as const
export function ManageView() {
  const { user, loading } = useSession()
  const [data, setData] = useState<ManageData | null>(null)
  const [panel, setPanel] = useState<Panel>('overview')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [editor, setEditor] = useState<{ collection: EditableCollection; id?: string } | null>(null)
  const [form, setForm] = useState<EditorForm>(blankForm)
  const [formError, setFormError] = useState('')
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [trackId, setTrackId] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [stepEdit, setStepEdit] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [trainingId, setTrainingId] = useState('all')
  const [uploading, setUploading] = useState(false)
  const toast = useToast()
  const router = useRouter()
  const load = useCallback(async () => {
    setError('')
    try {
      const response = await fetch('/api/club/manage')
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setData(result)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])
  useEffect(() => {
    if (user && user.role !== 'member') void load()
    else setData(null)
  }, [user, load])
  function pickTrack(id: string) {
    const track = data?.tracks.find((t) => t.id === id)
    setTrackId(id)
    setSteps(structuredClone(track?.steps ?? []))
    setStepEdit(null)
  }
  useEffect(() => {
    if (data?.tracks.length && !trackId) {
      setTrackId(data.tracks[0].id)
      setSteps(structuredClone(data.tracks[0].steps ?? []))
    }
  }, [data, trackId])
  function field<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    setForm((old) => ({ ...old, [key]: value }))
  }
  function edit(collection: EditableCollection, record?: Post | Event | Project) {
    const r = (record ?? {}) as Partial<Post & Event & Project>
    setForm({
      ...blankForm,
      title: r.title ?? '',
      description: r.description ?? '',
      body: r.body ?? '',
      category: r.category ?? 'Клубын мэдээ',
      scope: r.scope ?? 'internal',
      date: r.date ? r.date.slice(0, 16) : '',
      location: r.location ?? '',
      material: r.material ?? '',
      technologies: r.technologies ?? '',
      link: r.link ?? '',
      image: typeof r.image === 'object' && r.image ? r.image.id : (r.image ?? ''),
      archived: r.archived ?? false,
    })
    setFormError('')
    setEditor({ collection, id: record?.id })
  }
  async function save(publish: boolean) {
    if (!editor) return
    if (!form.title.trim() || !form.description.trim()) {
      setFormError('Гарчиг болон тайлбарыг заавал бөглөнө үү.')
      return
    }
    setBusy(true)
    setFormError('')
    try {
      await clubRequest('save', { ...editor, data: form, publish })
      setEditor(null)
      toast(
        publish
          ? 'Амжилттай нийтэллээ. Нээлттэй хуудсанд харагдана.'
          : 'Нооргийг амжилттай хадгаллаа.',
      )
      await load()
      router.refresh()
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function confirmAction() {
    if (!confirm) return
    if (confirm.kind === 'step') {
      setSteps((old) => old.filter((_, i) => i !== confirm.index))
      setConfirm(null)
      setStepEdit(null)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (confirm.kind === 'role') {
        await clubRequest('role', { id: confirm.id, role: confirm.role })
        toast('Гишүүний эрх шинэчлэгдэж, үйлдлийн түүхэнд хадгалагдлаа.')
      } else {
        await clubRequest('delete', { id: confirm.id, collection: confirm.collection })
        toast('Мэдээллийг устгалаа.')
      }
      setConfirm(null)
      await load()
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  function moveStep(from: number, to: number) {
    if (to < 0 || to >= steps.length || from === to) return
    setSteps((old) => {
      const next = [...old]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setStepEdit(null)
  }
  async function publishRoadmap(publish: boolean) {
    setBusy(true)
    setError('')
    try {
      await clubRequest('roadmap', { id: trackId, steps, publish })
      toast(
        publish
          ? 'Сургалтын замыг нийтэллээ. Шинэ дараалал нээлттэй хуудсанд харагдана.'
          : 'Сургалтын замын нооргийг хадгаллаа.',
      )
      await load()
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  async function upload(file?: File) {
    if (!file) return
    setUploading(true)
    setFormError('')
    try {
      const body = new FormData()
      body.append('file', file)
      body.append('alt', form.title || 'Клубын нийтлэлийн зураг')
      const r = await fetch('/api/club/upload', { method: 'POST', body })
      const result = await r.json()
      if (!r.ok) throw new Error(result.error)
      field('image', result.doc.id)
      await load()
      toast('Зураг амжилттай нэмэгдлээ.')
    } catch (e) {
      setFormError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }
  if (loading)
    return (
      <main className="mx-auto grid max-w-7xl gap-6 px-4 pt-12 md:grid-cols-[250px_1fr] md:px-10">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </main>
    )
  if (!user)
    return (
      <main className="mx-auto max-w-2xl px-4 pt-16">
        <Card className="p-10 text-center">
          <LockKeyhole size={40} className="mx-auto text-violet" />
          <Heading as="h1" className="mt-6 text-3xl">
            Удирдлагын хэсэг
          </Heading>
          <p className="mt-4 text-sm text-muted">
            Үргэлжлүүлэхийн тулд эрх бүхий хэрэглэгчээр нэвтэрнэ үү.
          </p>
          <Button href="/login?next=/manage" className="mt-7">
            Нэвтрэх
            <ArrowUpRight size={17} />
          </Button>
        </Card>
      </main>
    )
  if (user.role === 'member') return <ForbiddenView />
  const activeMenu = menus.find((m) => m.id === panel)
  const records =
    panel === 'posts'
      ? [...(data?.posts ?? []), ...(data?.events ?? [])]
      : panel === 'projects'
        ? (data?.projects ?? [])
        : (data?.events ?? []).filter((e) => e.scope === 'internal')
  const collectionFor = (record: Post | Project | Event): EditableCollection =>
    'scope' in record ? 'events' : 'technologies' in record ? 'projects' : 'posts'
  return (
    <main className="mx-auto max-w-7xl px-4 pt-10 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-widest text-violet-dark">
            КЛУБЫН АЖЛЫН ОРОН ЗАЙ
          </p>
          <Heading as="h1" className="mt-2 text-3xl md:text-4xl">
            Сайн уу, {user.name.split(' ').at(-1)}!
          </Heading>
        </div>
        <Badge tone="mint">
          <ShieldCheck size={14} />
          {roleLabels[user.role]}
        </Badge>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[250px_1fr]">
        <Card className="p-3 lg:sticky lg:top-6">
          <div className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-1">
            {menus
              .filter((m) => (m.access as readonly string[]).includes(user.role))
              .map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant="ghost"
                  onClick={() => {
                    setPanel(id)
                    setError('')
                  }}
                  className={`justify-start rounded-3xl px-4 text-left text-xs ${panel === id ? 'clay-pressed bg-violet-soft text-violet-dark' : ''}`}
                >
                  <Icon size={17} className="shrink-0" />
                  {label}
                </Button>
              ))}
          </div>
          <Button href="/" variant="ghost" className="mt-4 w-full justify-start text-xs text-muted">
            <ArrowLeft size={16} />
            Сайт руу буцах
          </Button>
        </Card>
        <div className="min-w-0">
          {error && (
            <Card tone="peach" className="mb-5 p-5">
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
              <Button onClick={load} variant="ghost" className="mt-2 min-h-11 px-0 text-xs">
                Дахин ачаалах
              </Button>
            </Card>
          )}
          {!data ? (
            <Skeleton className="h-96" />
          ) : (
            <>
              {panel === 'overview' ? (
                <>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      {
                        label: 'Нийтлэл',
                        count: data.posts.length + data.events.length,
                        tone: 'violet' as const,
                      },
                      { label: 'Төсөл', count: data.projects.length, tone: 'mint' as const },
                      { label: 'Сургалтын зам', count: data.tracks.length, tone: 'sky' as const },
                      {
                        label: 'Бүртгэл',
                        count: data.registrations.filter((r) => r.status === 'registered').length,
                        tone: 'peach' as const,
                      },
                    ].map((stat) => (
                      <Card key={stat.label} tone={stat.tone} className="p-5">
                        <p className="text-xs font-bold">{stat.label}</p>
                        <p className="mt-3 text-4xl font-black">{stat.count}</p>
                      </Card>
                    ))}
                  </div>
                  <Card className="mt-6 p-7">
                    <Heading className="text-2xl">Шинэ санаагаа хуваалцаарай</Heading>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      Нооргоо хадгалж, бэлэн болсон үед нийтлээрэй. Таны өөрчлөлтүүд CMS-д
                      хадгалагдана.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {user.role !== 'teacher' && (
                        <Button onClick={() => edit('posts')}>
                          <Plus size={17} />
                          Шинэ нийтлэл
                        </Button>
                      )}
                      {user.role !== 'core' && (
                        <Button variant="secondary" onClick={() => setPanel('roadmap')}>
                          <Map size={17} />
                          Сургалтын зам
                        </Button>
                      )}
                    </div>
                  </Card>
                  <Card className="mt-6 p-6">
                    <Heading as="h3" className="mb-5 text-lg">
                      Сүүлийн үйлдлүүд
                    </Heading>
                    {data.activity.length ? (
                      data.activity.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className="flex gap-3 rounded-2xl bg-surface/60 p-4 [&+div]:mt-3"
                        >
                          <History size={17} className="mt-1 shrink-0 text-violet" />
                          <div>
                            <p className="text-xs font-extrabold">{a.actor}</p>
                            <p className="mt-1 text-xs text-muted">{a.action}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted">Үйлдлийн түүх хараахан байхгүй.</p>
                    )}
                  </Card>
                </>
              ) : ['posts', 'projects', 'topics'].includes(panel) ? (
                <Card className="overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div>
                      <Heading className="text-2xl">{activeMenu?.label}</Heading>
                      <p className="mt-1 text-xs text-muted">Ноорог үүсгэх, засах болон нийтлэх</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          edit(
                            panel === 'projects'
                              ? 'projects'
                              : panel === 'topics'
                                ? 'events'
                                : 'posts',
                          )
                        }
                        className="px-4 text-xs"
                      >
                        <Plus size={16} />
                        Шинээр нэмэх
                      </Button>
                      {panel === 'posts' && (
                        <Button
                          onClick={() => edit('events')}
                          variant="secondary"
                          className="px-4 text-xs"
                        >
                          <Plus size={16} />
                          Арга хэмжээ
                        </Button>
                      )}
                    </div>
                  </div>
                  {records.length ? (
                    <Table headers={['Гарчиг', 'Төрөл', 'Төлөв', 'Огноо', 'Үйлдэл']}>
                      {records.map((record) => (
                        <tr key={record.id} className="odd:bg-surface/55">
                          <td className="max-w-60 px-5 py-4 font-extrabold">{record.title}</td>
                          <td className="px-5 py-4 text-xs text-muted">
                            {'scope' in record
                              ? record.scope === 'internal'
                                ? 'Дотоод сургалт'
                                : 'Сургуулийн зар'
                              : 'technologies' in record
                                ? 'Төсөл'
                                : 'Мэдээ'}
                          </td>
                          <td className="px-5 py-4">
                            <StatusChip status={record._status ?? 'draft'} />
                          </td>
                          <td className="px-5 py-4 text-xs whitespace-nowrap text-muted">
                            {dateLabel(record.updatedAt)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <Button
                                aria-label={`${record.title} засах`}
                                variant="ghost"
                                onClick={() => edit(collectionFor(record), record)}
                                className="size-11 p-0"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                aria-label={`${record.title} устгах`}
                                variant="ghost"
                                onClick={() =>
                                  setConfirm({
                                    kind: 'delete',
                                    id: record.id,
                                    collection: collectionFor(record),
                                    title: record.title,
                                  })
                                }
                                className="size-11 p-0 text-danger"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <div className="p-6">
                      <Empty />
                    </div>
                  )}
                </Card>
              ) : panel === 'roadmap' ? (
                <>
                  <Card className="p-6">
                    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <Heading className="text-2xl">Сургалтын зам удирдах</Heading>
                        <p className="mt-2 text-xs leading-relaxed text-muted">
                          Алхмыг чирэх эсвэл сум ашиглан дарааллыг өөрчлөөрэй.
                        </p>
                      </div>
                      <Button href="/learn" target="_blank" variant="secondary" className="text-xs">
                        Нээлттэй зам
                        <ArrowUpRight size={15} />
                      </Button>
                    </div>
                    <Dropdown
                      label="Сургалтын чиглэл"
                      value={trackId}
                      onChange={(e) => pickTrack(e.target.value)}
                    >
                      {data.tracks.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.title}
                        </option>
                      ))}
                    </Dropdown>
                  </Card>
                  <div className="mt-5 space-y-4">
                    {steps.map((step, i) => (
                      <Card
                        key={step.id ?? i}
                        className={`overflow-hidden ${dragIndex === i ? 'opacity-45' : ''}`}
                      >
                        <div
                          draggable
                          onDragStart={(e) => {
                            setDragIndex(i)
                            e.dataTransfer.effectAllowed = 'move'
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            if (dragIndex !== null) moveStep(dragIndex, i)
                            setDragIndex(null)
                          }}
                          onDragEnd={() => setDragIndex(null)}
                          className="flex items-center gap-2 p-4"
                        >
                          <GripVertical size={19} className="shrink-0 cursor-grab text-muted" />
                          <span className="clay flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-soft text-sm font-black">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1 text-sm font-extrabold">
                            {step.title}
                          </span>
                          <div className="flex shrink-0">
                            <Button
                              variant="ghost"
                              onClick={() => moveStep(i, i - 1)}
                              disabled={i === 0}
                              className="size-10 min-h-11 p-0"
                              aria-label="Алхмыг дээш зөөх"
                            >
                              <ArrowUp size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => moveStep(i, i + 1)}
                              disabled={i === steps.length - 1}
                              className="size-10 min-h-11 p-0"
                              aria-label="Алхмыг доош зөөх"
                            >
                              <ArrowDown size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setStepEdit(stepEdit === i ? null : i)}
                              className="size-10 min-h-11 p-0"
                              aria-label="Алхам засах"
                            >
                              <Pencil size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() =>
                                setConfirm({ kind: 'step', index: i, title: step.title })
                              }
                              className="size-10 min-h-11 p-0 text-danger"
                              aria-label="Алхам устгах"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        {stepEdit === i && (
                          <div className="grid gap-4 bg-surface/50 p-5">
                            <Input
                              label="Алхамын гарчиг"
                              value={step.title}
                              onChange={(e) =>
                                setSteps((old) =>
                                  old.map((s, index) =>
                                    index === i ? { ...s, title: e.target.value } : s,
                                  ),
                                )
                              }
                            />
                            <Textarea
                              label="Тайлбар"
                              value={step.description}
                              onChange={(e) =>
                                setSteps((old) =>
                                  old.map((s, index) =>
                                    index === i ? { ...s, description: e.target.value } : s,
                                  ),
                                )
                              }
                            />
                            <Input
                              label="Эзэмших ур чадвар"
                              value={step.skill}
                              onChange={(e) =>
                                setSteps((old) =>
                                  old.map((s, index) =>
                                    index === i ? { ...s, skill: e.target.value } : s,
                                  ),
                                )
                              }
                            />
                            <Input
                              label="Материалын HTTPS холбоос"
                              value={step.material}
                              onChange={(e) =>
                                setSteps((old) =>
                                  old.map((s, index) =>
                                    index === i ? { ...s, material: e.target.value } : s,
                                  ),
                                )
                              }
                            />
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap justify-between gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSteps((old) => [
                          ...old,
                          {
                            id: crypto.randomUUID(),
                            title: 'Шинэ алхам',
                            description: '',
                            skill: '',
                            material: '',
                          },
                        ])
                        setStepEdit(steps.length)
                      }}
                    >
                      <Plus size={17} />
                      Алхам нэмэх
                    </Button>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="secondary"
                        disabled={busy || !trackId}
                        onClick={() => publishRoadmap(false)}
                      >
                        <Save size={16} />
                        Ноорог хадгалах
                      </Button>
                      <Button disabled={busy || !trackId} onClick={() => publishRoadmap(true)}>
                        <Send size={16} />
                        {busy ? 'Хадгалж байна...' : 'Нийтлэх'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : panel === 'users' ? (
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <Heading className="text-2xl">Гишүүд ба эрх</Heading>
                    <p className="mt-2 text-xs text-muted">
                      Эрхийн өөрчлөлт бүр баталгаажуулалттай, түүхэнд хадгалагдана.
                    </p>
                  </div>
                  <Table headers={['Гишүүн', 'Оюутны код', 'Одоогийн эрх', 'Эрх өөрчлөх']}>
                    {data.users.map((member) => (
                      <tr key={member.id} className="odd:bg-surface/55">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={member.name} className="size-10 text-xs" />
                            <span className="font-extrabold">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted">{member.studentCode}</td>
                        <td className="px-5 py-4">
                          <Badge>{roleLabels[member.role]}</Badge>
                        </td>
                        <td className="w-52 px-5 py-4">
                          <Dropdown
                            aria-label={`${member.name} эрх`}
                            disabled={member.id === user.id}
                            value={member.role}
                            onChange={(e) =>
                              setConfirm({
                                kind: 'role',
                                id: member.id,
                                role: e.target.value,
                                name: member.name,
                              })
                            }
                          >
                            {Object.entries(roleLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                  </Table>
                </Card>
              ) : panel === 'registrations' ? (
                <Card className="overflow-hidden">
                  <div className="space-y-5 p-6">
                    <div>
                      <Heading className="text-2xl">Бүртгэлийн жагсаалт</Heading>
                      <p className="mt-2 text-xs text-muted">
                        Сургалтаар шүүж харах · Зөвхөн унших
                      </p>
                    </div>
                    <Dropdown
                      label="Сургалт сонгох"
                      value={trainingId}
                      onChange={(e) => setTrainingId(e.target.value)}
                    >
                      <option value="all">Бүх сургалт</option>
                      {data.events
                        .filter((e) => e.scope === 'internal')
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title}
                          </option>
                        ))}
                    </Dropdown>
                  </div>
                  {data.registrations.filter(
                    (r) =>
                      trainingId === 'all' ||
                      (typeof r.training === 'object' ? r.training.id : r.training) === trainingId,
                  ).length ? (
                    <Table headers={['Гишүүн', 'Сургалт', 'Төлөв', 'Огноо']}>
                      {data.registrations
                        .filter(
                          (r) =>
                            trainingId === 'all' ||
                            (typeof r.training === 'object' ? r.training.id : r.training) ===
                              trainingId,
                        )
                        .map((registration) => (
                          <tr key={registration.id} className="odd:bg-surface/55">
                            <td className="px-5 py-4 font-bold">
                              {typeof registration.member === 'object'
                                ? registration.member.name
                                : 'Гишүүн'}
                            </td>
                            <td className="px-5 py-4 text-xs">
                              {typeof registration.training === 'object'
                                ? registration.training.title
                                : 'Сургалт'}
                            </td>
                            <td className="px-5 py-4">
                              <StatusChip status={registration.status} />
                            </td>
                            <td className="px-5 py-4 text-xs text-muted">
                              {dateLabel(registration.updatedAt)}
                            </td>
                          </tr>
                        ))}
                    </Table>
                  ) : (
                    <div className="p-6">
                      <Empty description="Энэ сургалтын бүртгэл хараахан байхгүй байна." />
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <div className="p-6">
                    <Heading className="text-2xl">Үйлдлийн түүх</Heading>
                    <p className="mt-2 text-xs text-muted">
                      Хэн, ямар үйлдэл, хэзээ · Зөвхөн унших
                    </p>
                  </div>
                  {data.activity.length ? (
                    <Table headers={['Хэрэглэгч', 'Үйлдэл', 'Хэзээ']}>
                      {data.activity.map((item) => (
                        <tr key={item.id} className="odd:bg-surface/55">
                          <td className="px-5 py-4 font-extrabold">{item.actor}</td>
                          <td className="max-w-sm px-5 py-4 text-xs">{item.action}</td>
                          <td className="px-5 py-4 text-xs whitespace-nowrap text-muted">
                            {dateLabel(item.createdAt)} ·{' '}
                            {new Date(item.createdAt).toLocaleTimeString('mn-MN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Asia/Ulaanbaatar',
                            })}
                          </td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <div className="p-6">
                      <Empty description="Гишүүний эрх өөрчилсний дараа үйлдэл энд харагдана." />
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      <Dialog
        open={!!editor}
        onClose={() => {
          if (!busy) setEditor(null)
        }}
        title={editor?.id ? 'Мэдээлэл засах' : 'Шинэ мэдээлэл'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void save(false)
          }}
          className="max-h-[70dvh] space-y-5 overflow-y-auto px-1 pb-2"
        >
          <Input
            name="title"
            label="Гарчиг *"
            value={form.title}
            onChange={(e) => field('title', e.target.value)}
            required
            maxLength={180}
            error={formError && !form.title ? 'Гарчиг оруулна уу.' : undefined}
          />
          {editor?.collection === 'posts' && (
            <Dropdown
              label="Ангилал"
              value={form.category}
              onChange={(e) => field('category', e.target.value)}
            >
              {['Клубын мэдээ', 'Технологи', 'Амжилт', 'Зөвлөгөө'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Dropdown>
          )}
          {editor?.collection === 'events' && (
            <>
              <Dropdown
                label="Хамрах хүрээ"
                value={form.scope}
                onChange={(e) => field('scope', e.target.value)}
              >
                <option value="internal">Дотоод сургалт</option>
                {user.role !== 'teacher' && <option value="school">Сургуулийн зар</option>}
              </Dropdown>
              <Input
                type="datetime-local"
                label="Огноо, цаг *"
                value={form.date}
                onChange={(e) => field('date', e.target.value)}
                required
              />
              <Input
                label="Байршил *"
                value={form.location}
                onChange={(e) => field('location', e.target.value)}
                required
              />
              <Input
                label="Материалын холбоос"
                placeholder="https://"
                value={form.material}
                onChange={(e) => field('material', e.target.value)}
              />
              <Toggle
                value={form.archived}
                onChange={(v) => field('archived', v)}
                label="Архивлагдсан"
              />
            </>
          )}
          <Textarea
            label="Товч тайлбар *"
            value={form.description}
            onChange={(e) => field('description', e.target.value)}
            required
          />
          {editor?.collection !== 'events' && (
            <Textarea
              label="Дэлгэрэнгүй агуулга"
              value={form.body}
              onChange={(e) => field('body', e.target.value)}
            />
          )}
          {editor?.collection === 'projects' && (
            <>
              <Input
                label="Технологи *"
                placeholder="React, TypeScript, Docker"
                value={form.technologies}
                onChange={(e) => field('technologies', e.target.value)}
              />
              <Input
                label="Төслийн холбоос"
                placeholder="https://"
                value={form.link}
                onChange={(e) => field('link', e.target.value)}
              />
            </>
          )}
          <Dropdown
            label="Нийтлэлийн зураг"
            value={form.image}
            onChange={(e) => field('image', e.target.value)}
          >
            <option value="">Зураг сонгох</option>
            {data?.media.map((m) => (
              <option key={m.id} value={m.id}>
                {m.alt}
              </option>
            ))}
          </Dropdown>
          <Input
            type="file"
            label={uploading ? 'Зураг нэмж байна...' : 'Эсвэл шинэ зураг оруулах (5 МБ хүртэл)'}
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          {formError && (
            <p role="alert" className="rounded-2xl bg-peach-soft p-3 text-xs font-bold text-danger">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={busy || uploading}
              className="flex-1 px-4 text-xs"
            >
              <Save size={15} />
              Ноорог хадгалах
            </Button>
            <Button
              disabled={busy || uploading}
              onClick={() => save(true)}
              className="flex-1 px-4 text-xs"
            >
              <Send size={15} />
              {busy ? 'Хадгалж байна...' : 'Нийтлэх'}
            </Button>
          </div>
        </form>
      </Dialog>
      <Dialog
        open={!!confirm}
        onClose={() => {
          if (!busy) setConfirm(null)
        }}
        title={confirm?.kind === 'role' ? 'Эрх өөрчлөх үү?' : 'Устгахдаа итгэлтэй байна уу?'}
      >
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-muted">
            {confirm?.kind === 'role'
              ? `${confirm.name} гишүүний эрхийг “${roleLabels[confirm.role]}” болгох гэж байна. Энэ өөрчлөлт үйлдлийн түүхэнд хадгалагдана.`
              : confirm
                ? `“${confirm.title}” мэдээллийг устгах гэж байна. ${confirm.kind === 'step' ? 'Нийтлэх хүртэл нээлттэй сургалтын зам өөрчлөгдөхгүй.' : 'Энэ үйлдлийг буцаах боломжгүй.'}`
                : ''}
          </p>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setConfirm(null)} className="flex-1">
              Болих
            </Button>
            <Button
              variant={confirm?.kind === 'role' ? 'primary' : 'danger'}
              onClick={confirmAction}
              disabled={busy}
              className="flex-1"
            >
              {busy ? 'Хадгалж байна...' : confirm?.kind === 'role' ? 'Баталгаажуулах' : 'Устгах'}
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  )
}
