'use client'
import { useState } from 'react'
import { Check, CodeXml, Heart, Plus, Sparkles } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ChatBubble,
  Dialog,
  Dropdown,
  Empty,
  Heading,
  Input,
  ProgressStep,
  Skeleton,
  StatusChip,
  Table,
  Tabs,
  Toggle,
  useToast,
  tones,
  type Tone,
} from '@/components/clay/ui'
import { PageHeading } from './pages'
export function DesignSystemView() {
  const [open, setOpen] = useState(false)
  const [toggle, setToggle] = useState(true)
  const [tab, setTab] = useState('1')
  const toast = useToast()
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-10">
      <PageHeading
        eyebrow="DIGITAL CLUB · ДИЗАЙНЫ СИСТЕМ"
        title="Зөөлөн хэлбэр. Нэгдсэн туршлага."
        description="Өнгө, бичвэр, гүн болон дахин ашиглах clay бүрэлдэхүүнүүдийн сан."
      />
      <div className="space-y-7">
        <Card className="p-7">
          <Heading className="mb-6 text-2xl">Өнгөний палитр</Heading>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {(Object.keys(tones) as Tone[]).map((tone, i) => (
              <Card tone={tone} key={tone} className="p-6">
                <span className="text-sm font-extrabold">
                  {
                    ['Нил ягаан', 'Гааны ногоон', 'Тоорын улбар', 'Нарны шар', 'Тэнгэрийн цэнхэр'][
                      i
                    ]
                  }
                </span>
              </Card>
            ))}
          </div>
        </Card>
        <div className="grid gap-7 md:grid-cols-2">
          <Card className="p-7">
            <Heading className="mb-5 text-2xl">Товч ба төлөв</Heading>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast('Үндсэн товч ажиллаж байна.')}>
                <Plus size={16} />
                Үндсэн
              </Button>
              <Button variant="secondary" onClick={() => toast('Хоёрдогч товч ажиллаж байна.')}>
                Хоёрдогч
              </Button>
              <Button variant="ghost" onClick={() => toast('Энгийн товч ажиллаж байна.')}>
                Энгийн
              </Button>
              <Button disabled>Идэвхгүй</Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Badge>
                <Sparkles size={13} />
                Тэмдэглэгээ
              </Badge>
              <StatusChip status="published" />
              <StatusChip status="draft" />
              <StatusChip status="registered" />
            </div>
          </Card>
          <Card className="space-y-5 p-7">
            <Heading className="text-2xl">Оролт ба сонголт</Heading>
            <Input label="Оюутны код" placeholder="DC24001" />
            <Input
              label="Алдаатай оролт"
              placeholder="Кодоо оруулна уу"
              error="Энэ талбарыг заавал бөглөнө үү."
            />
            <Dropdown label="Сургалтын чиглэл">
              <option>Docker</option>
              <option>Cloud Computing</option>
            </Dropdown>
            <Toggle value={toggle} onChange={setToggle} label="Мэдэгдэл идэвхжүүлэх" />
          </Card>
        </div>
        <Card className="p-7">
          <Heading className="mb-6 text-2xl">Гүний түвшин</Heading>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="clay rounded-clay bg-surface p-8 text-center font-bold">Өргөгдсөн</div>
            <div className="clay-pressed rounded-clay bg-surface p-8 text-center font-bold">
              Дарсан
            </div>
            <div className="clay-floating rounded-clay bg-violet-soft p-8 text-center font-bold">
              Хөвөгч
            </div>
          </div>
        </Card>
        <div className="grid gap-7 md:grid-cols-2">
          <Card className="space-y-6 p-7">
            <Heading className="text-2xl">Таб, алхам, хэрэглэгч</Heading>
            <Tabs
              items={[
                { value: '1', label: 'Дотоод сургалт' },
                { value: '2', label: 'Сургуулийн зар' },
              ]}
              value={tab}
              onChange={setTab}
            />
            <div className="flex gap-5">
              <ProgressStep number={1} active />
              <ProgressStep number={2} active={false} />
              <ProgressStep number={3} active={false} />
            </div>
            <div className="flex gap-3">
              <Avatar name="Э. Энхжин" />
              <Avatar name="Б. Тэмүүлэн" tone="mint" />
              <Avatar name="Н. Номин" tone="peach" />
            </div>
          </Card>
          <Card className="space-y-5 p-7">
            <Heading className="text-2xl">Харилцах бүрэлдэхүүн</Heading>
            <ChatBubble>Сайн уу! Юу сонирхож байна вэ?</ChatBubble>
            <ChatBubble own>Docker сургалтын зам үзье.</ChatBubble>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setOpen(true)}>Харилцах цонх</Button>
              <Button variant="secondary" onClick={() => toast('Үйлдэл амжилттай боллоо.')}>
                <Check size={15} />
                Амжилтын мэдэгдэл
              </Button>
            </div>
          </Card>
        </div>
        <Card className="overflow-hidden p-3">
          <Heading className="p-4 text-2xl">Хүснэгт</Heading>
          <Table headers={['Нэр', 'Төрөл', 'Төлөв']}>
            <tr>
              <td className="p-5 font-bold">Docker-ийн анхны алхам</td>
              <td className="p-5 text-sm">Дотоод сургалт</td>
              <td className="p-5">
                <StatusChip status="published" />
              </td>
            </tr>
          </Table>
        </Card>
        <div className="grid gap-7 md:grid-cols-2">
          <Empty />
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-12" />
            <Skeleton className="h-8 w-2/3" />
          </div>
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)} title="Өөрчлөлтөө хадгалах уу?">
        <p className="text-sm text-muted">
          Харилцах цонх нь гарын товчлуур, Escape болон харагдах фокустай.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Болих
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
              toast('Өөрчлөлт хадгалагдлаа.')
            }}
          >
            Хадгалах
          </Button>
        </div>
      </Dialog>
    </main>
  )
}
