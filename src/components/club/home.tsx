import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CodeXml,
  FolderCode,
  Heart,
  Rocket,
  Sparkles,
  Users,
} from 'lucide-react'
import { Avatar, Badge, Button, Card, Empty, Heading } from '@/components/clay/ui'
import { TrackCard, NewsCard, EventCard, ProjectCard } from './content-cards'
import type { ClubContent } from '@/lib/club-content'

const benefits = [
  {
    icon: BrainCircuit,
    title: 'Ирээдүйн технологи',
    text: 'AI, үүлэн технологийг хамтдаа',
    tone: 'violet' as const,
  },
  {
    icon: CodeXml,
    title: 'Кодоор бүтээе',
    text: 'Сууриас нь бодит ур чадварт',
    tone: 'mint' as const,
  },
  {
    icon: Rocket,
    title: 'Бодит төсөл',
    text: 'Санаагаа ажил хэрэг болгоё',
    tone: 'peach' as const,
  },
  { icon: Users, title: 'Хамтдаа илүү', text: 'Нэг баг, олон шинэ боломж', tone: 'sky' as const },
]
export function SectionTitle({
  eyebrow,
  title,
  href,
  link = 'Бүгдийг үзэх',
}: {
  eyebrow: string
  title: string
  href?: string
  link?: string
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-extrabold tracking-[.14em] text-violet-dark">{eyebrow}</p>
        <Heading className="text-3xl leading-tight md:text-4xl">{title}</Heading>
      </div>
      {href && (
        <Link
          href={href}
          className="flex min-h-11 items-center gap-2 text-sm font-extrabold text-violet-dark"
        >
          {link}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  )
}
export function HomeView({ content }: { content: ClubContent }) {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <section className="relative grid items-center pt-10 pb-8 md:min-h-[580px] md:grid-cols-[1.05fr_1.1fr] md:pt-8 md:pb-5">
        <div className="pointer-events-none absolute -top-10 -left-24 -z-10 size-96 rounded-full bg-peach/10 blur-3xl" />
        <div className="relative z-10 md:pt-2">
          <Badge className="clay bg-paper px-3.5 py-2 text-[10px] md:text-[11px]">
            <span className="size-2 rounded-full bg-mint" />
            ШУТИС · Дархан-Уул аймаг дахь Технологийн сургууль
          </Badge>
          <Heading
            as="h1"
            className="mt-6 text-[42px] leading-[1.16] font-black tracking-[-.045em] md:mt-7 md:text-[56px]"
          >
            Санаагаа
            <br />
            <span className="text-violet md:whitespace-nowrap">дижитал ирээдүй</span>
            <br />
            болгоё!
            <Sparkles
              className="ml-3 inline-block -translate-y-2 text-yellow"
              size={40}
              strokeWidth={2.7}
              fill="currentColor"
            />
          </Heading>
          <p className="mt-5 max-w-md text-[15px] leading-[1.8] text-muted md:text-base">
            Суралц. Турш. Бүтээ. Технологид дуртай оюутнуудын хамт олон чамайг хүлээж байна.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="/learn" className="px-6">
              Сургалтын чиглэл үзэх
              <ArrowRight size={17} />
            </Button>
            <Button href="/login" variant="secondary" className="px-7">
              Нэвтрэх
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-3">
              {['Энхжин', 'Тэмүүлэн', 'Номин', 'Билгүүн'].map((name, i) => (
                <Avatar
                  key={name}
                  name={name}
                  tone={(['peach', 'mint', 'sky', 'violet'] as const)[i]}
                  className="size-9 border-3 border-surface text-xs"
                />
              ))}
            </div>
            <div>
              <p className="text-xs font-extrabold">Сониуч сэтгэлтэй, нэг зорилготой.</p>
              <p className="mt-0.5 text-[10px] text-muted">Хамтдаа суралцаж, хамтдаа бүтээе.</p>
            </div>
          </div>
        </div>
        <div className="relative -mx-4 mt-1 md:-mr-9 md:-ml-8 md:mt-0">
          <div className="absolute inset-16 -z-10 rounded-full bg-violet/10 blur-3xl" />
          <Image
            src="/clay-world.svg"
            width={700}
            height={590}
            priority
            alt="Зөөлөн шаварлаг зөөврийн компьютер, пуужин, найрсаг робот болон технологийн дүрсүүд"
            className="animate-float h-auto w-full"
          />
          <span className="clay absolute top-[25%] right-[7%] flex rotate-6 items-center gap-2 rounded-full bg-paper px-4 py-2 text-[10px] font-extrabold md:right-0">
            <span className="size-2 rounded-full bg-mint" />
            Том санаа эндээс эхэлнэ
          </span>
          <span className="clay absolute bottom-[13%] left-[17%] flex -rotate-6 items-center gap-2 rounded-full bg-paper px-4 py-2 text-[10px] font-extrabold">
            <Heart size={14} className="text-violet" fill="currentColor" />
            Алдаа гарга. Дахин турш.
          </span>
        </div>
      </section>
      <section
        aria-label="Клубын давуу тал"
        className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"
      >
        {benefits.map(({ icon: Icon, title, text, tone }) => (
          <Card
            key={title}
            className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:gap-4 lg:px-5 lg:py-6"
          >
            <span
              className={`clay flex size-13 shrink-0 items-center justify-center rounded-2xl ${tone === 'violet' ? 'bg-violet-soft' : tone === 'mint' ? 'bg-mint-soft' : tone === 'peach' ? 'bg-peach-soft' : 'bg-sky-soft'}`}
            >
              <Icon size={25} strokeWidth={2.4} />
            </span>
            <div>
              <Heading as="h3" className="text-sm">
                {title}
              </Heading>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{text}</p>
            </div>
          </Card>
        ))}
      </section>
      <section className="mt-16 md:mt-20">
        <SectionTitle
          eyebrow="ӨӨРИЙН ЗАМАА СОНГООРОЙ"
          title="Юунаас эхлэх вэ?"
          href="/learn"
          link="Сургалтын зам үзэх"
        />
        <p className="-mt-3 mb-7 text-sm text-muted">
          Сонирхлоо дагаад, алхам алхмаар ур чадвараа хөгжүүл.
        </p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-5">
          {content.tracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
          {!content.tracks.length && <Empty />}
        </div>
        <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs text-muted">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-violet" />
          Энэ нь чиглэл заасан зам бөгөөд заавал дагах шаардлагагүй.
        </p>
      </section>
      <section className="mt-16 md:mt-20">
        <SectionTitle eyebrow="КЛУБТ ЮУ ШИНЭ БАЙНА?" title="Шинэ мэдээ, шинэ боломж" href="/news" />
        <div className="grid gap-5 md:grid-cols-3">
          {content.posts.slice(0, 3).map((post) => (
            <NewsCard key={post.id} post={post} />
          ))}
          {!content.posts.length && <Empty />}
        </div>
      </section>
      <section className="mt-16 md:mt-20">
        <SectionTitle
          eyebrow="ХУАНЛИДАА ТЭМДЭГЛЭЭРЭЙ"
          title="Удахгүй болох үйл явдал"
          href="/events"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {content.events
            .filter((e) => !e.archived && new Date(e.date) > new Date())
            .slice(0, 2)
            .map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
        </div>
      </section>
      <section className="mt-16 md:mt-20">
        <SectionTitle
          eyebrow="БИДНИЙ БҮТЭЭСЭН ЗҮЙЛС"
          title="Санаанаас бодит бүтээл рүү"
          href="/projects"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {content.projects.slice(0, 3).map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
          {!content.projects.length && <Empty />}
        </div>
      </section>
      <section className="mt-16 md:mt-20">
        <Card
          tone="violet"
          className="relative overflow-hidden p-7 md:flex md:items-center md:justify-between md:gap-10 md:p-11"
        >
          <div className="relative z-10 max-w-xl">
            <Badge className="clay bg-paper">Хэн нэгдэж болох вэ?</Badge>
            <Heading className="mt-5 text-3xl leading-tight md:text-4xl">
              Мэргэжил нэг.
              <br />
              Мөрөөдөл хязгааргүй.
            </Heading>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Кибер аюулгүй байдал, Мэдээллийн систем, Программ хангамжийн 1–4-р курсын оюутан бүрд
              нээлттэй. Туршлага биш, суралцах хүсэл л чухал.
            </p>
            <Button href="/about" variant="secondary" className="mt-6">
              Клубтэй танилцах
              <ArrowRight size={17} />
            </Button>
          </div>
          <div className="relative mt-9 flex flex-col gap-4 md:mt-0 md:w-80">
            {[
              'Мэдлэгээ хуваалцах хамт олон',
              'Бодитоор турших шинэ боломж',
              'Хамтдаа өсөх бүтээлч орчин',
            ].map((text, i) => (
              <Card
                key={text}
                className={`flex items-center gap-3 p-4 ${i === 1 ? 'md:translate-x-4' : 'md:-rotate-2'}`}
              >
                <span className="clay flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-soft">
                  <Check size={18} />
                </span>
                <span className="text-sm font-extrabold">{text}</span>
              </Card>
            ))}
          </div>
        </Card>
      </section>
    </main>
  )
}
