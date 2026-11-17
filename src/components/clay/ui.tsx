'use client'

import Link from 'next/link'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  createElement,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Check, ChevronDown, Inbox, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

export type Tone = 'violet' | 'mint' | 'peach' | 'yellow' | 'sky'
export const tones: Record<Tone, string> = {
  violet: 'bg-violet-soft',
  mint: 'bg-mint-soft',
  peach: 'bg-peach-soft',
  yellow: 'bg-yellow-soft',
  sky: 'bg-sky-soft',
}
export function Heading({
  as = 'h2',
  children,
  className = '',
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  children: ReactNode
  className?: string
}) {
  return createElement(as, { className: `font-extrabold tracking-tight ${className}` }, children)
}
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  target?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}
export function Button({
  href,
  target,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = twMerge(
    `inline-flex min-h-12 min-w-11 items-center justify-center gap-2.5 rounded-full px-6 py-3 text-sm font-extrabold lift disabled:opacity-45 disabled:hover:translate-y-0 ${variant === 'primary' ? 'bg-violet-dark text-white clay-violet' : variant === 'ghost' ? 'bg-transparent' : variant === 'danger' ? 'bg-peach-soft text-danger clay' : 'bg-paper clay'} ${className}`,
  )
  return href ? (
    <Link
      href={href}
      target={target}
      rel={target ? 'noopener noreferrer' : undefined}
      className={base}
    >
      {children}
    </Link>
  ) : (
    <button type="button" className={base} {...props}>
      {children}
    </button>
  )
}
export function Card({
  children,
  className = '',
  tone,
}: {
  children: ReactNode
  className?: string
  tone?: Tone
}) {
  return (
    <div className={twMerge(`rounded-clay clay ${tone ? tones[tone] : 'bg-paper'} ${className}`)}>
      {children}
    </div>
  )
}
export function Badge({
  children,
  tone = 'violet',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={twMerge(
        `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold ${tones[tone]} ${className}`,
      )}
    >
      {children}
    </span>
  )
}
export function StatusChip({ status }: { status: string }) {
  return (
    <Badge tone={status === 'published' || status === 'registered' ? 'mint' : 'peach'}>
      <span
        className={`size-1.5 rounded-full ${status === 'published' || status === 'registered' ? 'bg-emerald-700' : 'bg-orange-700'}`}
      />
      {(
        {
          published: 'Нийтлэгдсэн',
          draft: 'Ноорог',
          registered: 'Бүртгэгдсэн',
          cancelled: 'Цуцалсан',
        } as Record<string, string>
      )[status] ?? status}
    </Badge>
  )
}
export function Input({
  label,
  error,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const id = props.id ?? props.name
  return (
    <label className={`block space-y-2 text-sm font-bold ${className}`} htmlFor={id}>
      {label && <span>{label}</span>}
      <input
        id={id}
        className="clay-pressed min-h-12 w-full rounded-3xl bg-surface px-5 py-3 font-medium outline-none placeholder:text-muted focus:ring-2 focus:ring-violet/50"
        {...props}
        aria-invalid={!!error}
      />
      {error && <span className="block text-xs text-danger">{error}</span>}
    </label>
  )
}
export function Textarea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block space-y-2 text-sm font-bold">
      <span>{label}</span>
      <textarea
        className="clay-pressed min-h-32 w-full rounded-3xl bg-surface px-5 py-3 font-medium outline-none focus:ring-2 focus:ring-violet/50"
        {...props}
      />
    </label>
  )
}
export function Dropdown({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2 text-sm font-bold">
      {label && <span>{label}</span>}
      <span className="relative block">
        <select
          className="clay-pressed min-h-12 w-full appearance-none rounded-3xl bg-surface py-3 pr-10 pl-5 outline-none"
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-4 right-4" />
      </span>
    </label>
  )
}
export function Tabs({
  items,
  value,
  onChange,
  label = 'Ангилал',
}: {
  items: { value: string; label: string; icon?: ReactNode }[]
  value: string
  onChange: (v: string) => void
  label?: string
}) {
  return (
    <div role="tablist" aria-label={label} className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <Button
          key={item.value}
          role="tab"
          aria-selected={value === item.value}
          variant={value === item.value ? 'primary' : 'secondary'}
          onClick={() => onChange(item.value)}
          className="px-5"
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </div>
  )
}
export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex min-h-12 items-center gap-3 text-sm font-bold"
    >
      <span
        className={`clay-pressed flex h-8 w-14 items-center rounded-full p-1 ${value ? 'bg-violet' : 'bg-violet-soft'}`}
      >
        <span
          className={`clay size-6 rounded-full bg-paper transition-transform ${value ? 'translate-x-6' : ''}`}
        />
      </span>
      {label}
    </button>
  )
}
export function Avatar({
  name,
  className = '',
  tone = 'violet',
}: {
  name: string
  className?: string
  tone?: Tone
}) {
  return (
    <span
      aria-label={name}
      className={twMerge(
        `clay inline-flex size-12 shrink-0 items-center justify-center rounded-full text-base font-black ${tones[tone]} ${className}`,
      )}
    >
      {name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')}
    </span>
  )
}
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open && !ref.current?.open) ref.current?.showModal()
    else if (!open) ref.current?.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="clay-floating w-[calc(100%-2rem)] max-w-lg rounded-clay bg-paper p-6 md:p-8"
      aria-label={title}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <Heading as="h3" className="text-2xl">
          {title}
        </Heading>
        <Button
          variant="ghost"
          onClick={onClose}
          aria-label="Хаах"
          className="size-11 shrink-0 p-0"
        >
          <X size={20} />
        </Button>
      </div>
      {children}
    </dialog>
  )
}
const ToastContext = createContext<(message: string) => void>(() => {})
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4500)
      return () => clearTimeout(timer)
    }
  }, [message])
  return (
    <ToastContext.Provider value={setMessage}>
      {children}
      {message && (
        <div
          role="status"
          className="clay-floating animate-enter fixed right-4 bottom-28 left-4 z-[80] flex items-center gap-3 rounded-3xl bg-mint-soft px-5 py-4 text-sm font-bold md:bottom-8 md:left-auto md:max-w-md"
        >
          <Check className="shrink-0" size={20} />
          {message}
          <Button
            variant="ghost"
            onClick={() => setMessage('')}
            aria-label="Мэдэгдэл хаах"
            className="min-h-11 p-1"
          >
            <X size={16} />
          </Button>
        </div>
      )}
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)
export function Empty({
  title = 'Мэдээлэл олдсонгүй',
  description = 'Шинэ мэдээлэл удахгүй нэмэгдэнэ.',
}: {
  title?: string
  description?: string
}) {
  return (
    <Card className="col-span-full flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="clay flex size-20 items-center justify-center rounded-3xl bg-violet-soft">
        <Inbox size={32} />
      </span>
      <Heading as="h3" className="text-xl">
        {title}
      </Heading>
      <p className="text-sm text-muted">{description}</p>
    </Card>
  )
}
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-label="Ачаалж байна"
      className={`clay animate-pulse rounded-clay bg-violet-soft ${className}`}
    />
  )
}
export function ProgressStep({ number, active }: { number: number; active: boolean }) {
  return (
    <span
      className={`clay flex size-16 shrink-0 items-center justify-center rounded-3xl text-2xl font-black ${active ? 'clay-violet bg-violet text-white' : 'bg-paper'}`}
    >
      {number}
    </span>
  )
}
export function ChatBubble({ children, own = false }: { children: ReactNode; own?: boolean }) {
  return (
    <div
      className={`max-w-[90%] rounded-3xl px-4 py-3 text-sm ${own ? 'ml-auto bg-violet-dark text-white' : 'clay bg-paper'}`}
    >
      {children}
    </div>
  )
}
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl text-left text-sm">
        <thead>
          <tr className="text-xs text-muted">
            {headers.map((h) => (
              <th key={h} className="px-5 py-4 font-extrabold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
