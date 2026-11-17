import type { CollectionConfig, Field } from 'payload'
import { editors, educators, published, hasRole } from '@/lib/club-access'
import { refreshClub, deleteClub } from '@/lib/club-hooks'

const sharedFields: Field[] = [
  { name: 'title', type: 'text', required: true, maxLength: 180 },
  { name: 'slug', type: 'slug', useAsSlug: 'title' },
  { name: 'description', type: 'textarea', required: true },
  { name: 'image', type: 'upload', relationTo: 'media' },
]
const hooks = { afterChange: [refreshClub], afterDelete: [deleteClub] }
const access = { read: published, create: editors, update: editors, delete: editors }
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'title', group: 'Клубын агуулга' },
  access,
  hooks,
  versions: { drafts: true },
  fields: [
    ...sharedFields,
    {
      name: 'category',
      type: 'select',
      required: true,
      options: ['Клубын мэдээ', 'Технологи', 'Амжилт', 'Зөвлөгөө'],
      defaultValue: 'Клубын мэдээ',
    },
    { name: 'date', type: 'date', required: true },
    { name: 'body', type: 'textarea' },
  ],
}
export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'title', group: 'Клубын агуулга' },
  access: {
    ...access,
    create: ({ req }) => hasRole(req.user, ['core', 'leader', 'teacher']),
    update: ({ req }) =>
      hasRole(req.user, ['core', 'leader']) ||
      (hasRole(req.user, ['teacher']) ? { scope: { equals: 'internal' } } : false),
    delete: ({ req }) =>
      hasRole(req.user, ['core', 'leader']) ||
      (hasRole(req.user, ['teacher']) ? { scope: { equals: 'internal' } } : false),
  },
  hooks: {
    ...hooks,
    beforeChange: [
      ({ data, req }) => {
        if (
          req.user?.collection === 'users' &&
          req.user.role === 'teacher' &&
          data.scope === 'school'
        )
          throw new Error('Багш зөвхөн дотоод сургалт удирдана.')
        return data
      },
    ],
  },
  versions: { drafts: true },
  fields: [
    ...sharedFields,
    {
      name: 'scope',
      type: 'select',
      required: true,
      options: ['internal', 'school'],
      defaultValue: 'internal',
    },
    { name: 'date', type: 'date', required: true },
    { name: 'location', type: 'text', required: true },
    {
      name: 'material',
      type: 'text',
      access: {
        read: ({ req }) => req.user?.collection === 'users' || req.user?.collection === 'admins',
      },
    },
    { name: 'archived', type: 'checkbox', defaultValue: false },
  ],
}
export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title', group: 'Клубын агуулга' },
  access,
  hooks,
  versions: { drafts: true },
  fields: [
    ...sharedFields,
    { name: 'technologies', type: 'text', required: true },
    { name: 'link', type: 'text' },
    { name: 'body', type: 'textarea' },
  ],
}
export const Tracks: CollectionConfig = {
  slug: 'tracks',
  admin: { useAsTitle: 'title', group: 'Сургалт' },
  access: { read: published, create: educators, update: educators, delete: educators },
  hooks,
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'slug', useAsSlug: 'title' },
    { name: 'description', type: 'textarea', required: true },
    {
      name: 'color',
      type: 'select',
      options: ['sky', 'mint', 'peach', 'violet', 'yellow'],
      required: true,
    },
    {
      name: 'icon',
      type: 'select',
      options: ['docker', 'cloud', 'git', 'design', 'ai'],
      required: true,
    },
    {
      name: 'steps',
      type: 'array',
      required: true,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'skill', type: 'text', required: true },
        {
          name: 'material',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) =>
            !value || /^https:\/\//.test(value) || 'HTTPS холбоос оруулна уу.',
        },
      ],
    },
  ],
}
