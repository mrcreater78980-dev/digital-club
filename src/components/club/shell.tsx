'use client'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CodeXml,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Newspaper,
  Phone,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ChatBubble,
  Dialog,
  Heading,
  Input,
  ToastProvider,
} from '@/components/clay/ui'
import { navigation, roleLabels } from '@/lib/club-types'
import { SessionProvider, clubRequest, useSession } from './session'

function Logo() {
  return (
    <Link
      href="/"
      aria-label="Digital Club — Нүүр"
      className="flex shrink-0 items-center gap-2 md:gap-2.5"
    >
      <span className="clay-violet flex size-9 items-center justify-center rounded-2xl bg-violet text-white md:size-11">
        <CodeXml className="size-6 md:size-7" strokeWidth={2.7} />
      </span>
      <span className="text-base font-black tracking-tight md:text-xl">
        Digital<span className="text-violet"> Club</span>
      </span>
    </Link>
  )
}
const mobileIcons = [Home, Newspaper, CalendarDays, BookOpen]
function Header() {
  const path = usePathname()
  const { user, refresh } = useSession()
  const [sheet, setSheet] = useState(false)
  const [account, setAccount] = useState(false)
  return (
    <>
      <header className="relative z-40 mx-auto mt-5 w-[calc(100%-2rem)] max-w-7xl md:mt-7 md:w-[calc(100%-5rem)]">
        <nav
          aria-label="Үндсэн цэс"
          className="clay flex min-h-18 items-center justify-between gap-2 rounded-full bg-paper/95 px-4 py-3 md:min-h-20 md:gap-4 md:px-5 lg:px-7"
        >
          <Logo />
          <div className="hidden items-center gap-1 xl:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-2.5 text-[13px] font-extrabold transition-colors ${path === item.href || (item.href !== '/' && path.startsWith(item.href)) ? 'clay-pressed bg-violet-soft text-violet-dark' : 'hover:bg-violet-soft/60'}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setAccount(!account)}
                  className="gap-2 px-1"
                  aria-expanded={account}
                  aria-label="Хэрэглэгчийн цэс"
                >
                  <Avatar name={user.name} className="size-10" />
                  <span className="hidden text-left leading-tight md:block">
                    <span className="block text-xs">{user.name}</span>
                    <span className="text-[10px] text-violet-dark">{roleLabels[user.role]}</span>
                  </span>
                  <ChevronDown size={14} />
                </Button>
                {account && (
                  <Card className="absolute top-full right-0 mt-3 w-60 p-3">
                    <Badge>{roleLabels[user.role]}</Badge>
                    {user.role !== 'member' && (
                      <Button href="/manage" variant="ghost" className="mt-2 w-full justify-start">
                        <LayoutDashboard size={17} />
                        Удирдлага
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={async () => {
                        await clubRequest('logout', {})
                        await refresh()
                        setAccount(false)
                      }}
                    >
                      <LogOut size={17} />
                      Гарах
                    </Button>
                  </Card>
                )}
              </div>
            ) : (
              <Button href="/login" className="min-h-11 px-4 text-[11px] md:px-6 md:text-sm">
                Нэвтрэх
                <ArrowUpRight className="hidden md:block" size={16} />
              </Button>
            )}
            <Button
              variant="ghost"
              className="size-11 p-0 xl:hidden"
              onClick={() => setSheet(true)}
              aria-label="Цэс нээх"
            >
              <Menu size={23} />
            </Button>
          </div>
        </nav>
      </header>
      <Dialog open={sheet} onClose={() => setSheet(false)} title="Хаашаа очих вэ?">
        <div className="grid gap-2">
          {navigation.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              onClick={() => setSheet(false)}
              className={`rounded-3xl px-5 py-3 font-bold ${path === item.href ? 'clay-pressed bg-violet-soft' : 'hover:bg-surface'}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/training"
            onClick={() => setSheet(false)}
            className="rounded-3xl px-5 py-3 font-bold"
          >
            Дотоод сургалт
          </Link>
          {user && user.role !== 'member' && (
            <Link
              href="/manage"
              onClick={() => setSheet(false)}
              className="rounded-3xl px-5 py-3 font-bold"
            >
              Удирдлага
            </Link>
          )}
        </div>
      </Dialog>
      <nav
        aria-label="Гар утасны цэс"
        className="clay-floating fixed right-3 bottom-3 left-3 z-40 flex items-center justify-around rounded-full bg-paper/95 px-2 py-2 backdrop-blur-lg md:hidden"
      >
        {navigation.slice(0, 4).map((item, i) => {
          const Icon = mobileIcons[i]
          return (
            <Link
              href={item.href}
              key={item.href}
              className={`flex min-h-12 min-w-14 flex-col items-center justify-center rounded-3xl px-2 py-1 text-[9px] font-extrabold ${path === item.href ? 'clay-pressed bg-violet-soft text-violet-dark' : 'text-muted'}`}
            >
              <Icon size={20} strokeWidth={2.3} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <Button
          variant="ghost"
          onClick={() => setSheet(true)}
          className="flex min-h-12 min-w-12 flex-col gap-0 p-1 text-[9px]"
        >
          <Menu size={20} />
          Бусад
        </Button>
      </nav>
    </>
  )
}
function Footer() {
  return (
    <footer className="mx-auto mt-20 max-w-7xl px-4 pb-28 md:px-10 md:pb-8">
      <Card className="px-7 py-9 md:px-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Сониуч оюутнуудын бүтээлч орон зай.
              <br />
              Хамтдаа суралцаж, дижитал ирээдүйг бүтээе.
            </p>
          </div>
          <div>
            <Heading as="h3" className="text-sm">
              Холбоо барих
            </Heading>
            <p className="mt-4 text-sm text-muted">Сургалтын мастер Г.Уянга</p>
            <Link
              href="tel:99063222"
              className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-extrabold"
            >
              <Phone size={15} />
              99063222
            </Link>
            <p className="mt-2 text-xs text-muted">ШУТИС, Дархан-Уул аймаг дахь ТС</p>
          </div>
          <div>
            <Heading as="h3" className="text-sm">
              Хамтдаа бүтээцгээе
            </Heading>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>#ДижиталКлуб</Badge>
              <Badge tone="mint">#ШУТИС</Badge>
              <Badge tone="peach">#ДаТС</Badge>
            </div>
            <Link
              href="/about"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-violet-dark"
            >
              Бидний тухай
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <p>© 2026 Digital Club. Суралц. Турш. Бүтээ.</p>
          <p>Зохиомол жишээ өгөгдөл бүхий туршилтын сайт.</p>
        </div>
      </Card>
    </footer>
  )
}
function Chatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<
    { own?: boolean; text: string; href?: string; label?: string }[]
  >([])
  async function ask(question: string) {
    if (!question.trim()) return
    setMessages((previous) => [...previous, { own: true, text: question }])
    setInput('')
    try {
      const response = await fetch(`/api/club/chat?question=${encodeURIComponent(question)}`)
      const result = await response.json()
      if (!response.ok) throw new Error()
      setMessages((previous) => [...previous, result])
    } catch {
      setMessages((previous) => [
        ...previous,
        { text: 'Мэдээлэл авч чадсангүй. Түр хүлээгээд дахин оролдоно уу.' },
      ])
    }
  }
  return (
    <>
      {open && (
        <Card className="clay-floating animate-enter fixed right-4 bottom-44 z-50 flex max-h-[70dvh] w-[calc(100%-2rem)] max-w-96 flex-col overflow-hidden md:right-8 md:bottom-28">
          <div className="flex items-center justify-between bg-violet-soft px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="clay flex size-10 items-center justify-center rounded-2xl bg-paper">
                <Sparkles size={22} className="text-violet-dark" />
              </span>
              <div>
                <Heading as="h3" className="text-sm">
                  Дижитал туслах
                </Heading>
                <p className="text-[10px] text-muted">Клубын мэдээлэлд хөтөлнө</p>
              </div>
            </div>
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              className="size-11 p-0"
              aria-label="Чат хаах"
            >
              <X size={19} />
            </Button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            <ChatBubble>Сайн уу! Би Digital Club-ийн туслах. Юу сонирхож байна вэ?</ChatBubble>
            {messages.map((message, i) => (
              <ChatBubble key={i} own={message.own}>
                {message.text}
                {message.href && (
                  <Link
                    href={message.href}
                    onClick={() => setOpen(false)}
                    className="mt-3 flex items-center gap-1 font-extrabold text-violet-dark underline decoration-violet/30 underline-offset-4"
                  >
                    {message.label}
                    <ArrowUpRight size={14} />
                  </Link>
                )}
              </ChatBubble>
            ))}
            {!messages.length && (
              <div className="flex flex-wrap gap-2">
                {[
                  'Дотоод сургалтын хуваарь',
                  'Docker roadmap',
                  'Сургуулийн арга хэмжээний зар',
                ].map((q) => (
                  <Button
                    key={q}
                    variant="secondary"
                    onClick={() => ask(q)}
                    className="min-h-11 px-3 py-2 text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
            className="flex items-center gap-2 p-4 pt-1"
          >
            <Input
              aria-label="Асуултаа бичих"
              placeholder="Асуултаа бичээрэй..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1"
            />
            <Button type="submit" aria-label="Илгээх" className="size-12 shrink-0 p-0">
              <Send size={19} />
            </Button>
          </form>
        </Card>
      )}
      <div className="fixed right-5 bottom-24 z-50 flex items-center gap-3 md:right-8 md:bottom-8">
        {!open && (
          <span className="clay hidden rounded-full bg-paper px-4 py-2.5 text-xs font-bold lg:block">
            Асуух зүйл байна уу?
          </span>
        )}
        <Button
          aria-label={open ? 'Чат хаах' : 'Чатбот нээх'}
          onClick={() => setOpen(!open)}
          className="clay-floating size-15 min-h-15 rounded-full p-0"
        >
          {open ? <X size={26} /> : <MessageCircle size={27} strokeWidth={2.4} />}
        </Button>
      </div>
    </>
  )
}
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <Header />
        {children}
        <Footer />
        <Chatbot />
      </ToastProvider>
    </SessionProvider>
  )
}
