'use client'
import { AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Button, Card, Heading } from '@/components/clay/ui'
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 pt-16">
      <Card className="p-10 text-center">
        <AlertCircle size={44} className="mx-auto text-violet" />
        <Heading as="h1" className="mt-6 text-2xl">
          Түр зуурын алдаа гарлаа
        </Heading>
        <p className="mt-4 text-sm text-muted">
          Мэдээллийг ачаалж чадсангүй. Дахин оролдоод үзээрэй.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw size={16} />
            Дахин оролдох
          </Button>
          <Button href="/" variant="secondary">
            <ArrowLeft size={16} />
            Нүүр хуудас
          </Button>
        </div>
      </Card>
    </main>
  )
}
