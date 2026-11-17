import { ArrowLeft, Search } from 'lucide-react'
import { Button, Card, Heading } from '@/components/clay/ui'
export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 pt-16">
      <Card className="p-10 text-center">
        <span className="clay-floating mx-auto flex size-24 items-center justify-center rounded-clay bg-sky-soft">
          <Search size={40} />
        </span>
        <Heading as="h1" className="mt-8 text-4xl">
          404
        </Heading>
        <Heading className="mt-2 text-2xl">Мэдээлэл олдсонгүй</Heading>
        <p className="mt-4 text-sm text-muted">
          Энэ хуудас байхгүй эсвэл хараахан нийтлэгдээгүй байна.
        </p>
        <Button href="/" className="mt-7">
          <ArrowLeft size={16} />
          Нүүр хуудас руу
        </Button>
      </Card>
    </main>
  )
}
