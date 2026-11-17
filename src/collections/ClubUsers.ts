import type { CollectionConfig } from 'payload'
import { JWTAuthentication } from 'payload'
import { educators, hasRole, roleAccess, staff } from '@/lib/club-access'
import { refreshClub, deleteClub } from '@/lib/club-hooks'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 8,
    lockTime: 300000,
    strategies: [
      {
        name: 'club-users-jwt',
        authenticate: async (args) => {
          const result = await JWTAuthentication(args)
          return result.user?.collection === 'users' ? result : { user: null }
        },
      },
    ],
  },
  admin: { useAsTitle: 'name', group: 'Гишүүнчлэл' },
  access: {
    create: educators,
    read: ({ req }) =>
      hasRole(req.user, ['core', 'leader', 'teacher']) ||
      (req.user?.collection === 'users' ? { id: { equals: req.user.id } } : false),
    update: educators,
    delete: educators,
    admin: () => false,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'studentCode', type: 'text', unique: true, required: true, index: true },
    {
      name: 'role',
      type: 'select',
      options: ['member', 'core', 'leader', 'teacher'],
      defaultValue: 'member',
      required: true,
      saveToJWT: true,
      access: { create: roleAccess, update: roleAccess },
    },
    {
      name: 'major',
      type: 'select',
      options: ['Программ хангамж', 'Мэдээллийн систем', 'Кибер аюулгүй байдал'],
      required: true,
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation === 'update' && previousDoc.role !== doc.role) {
          await req.payload.create({
            collection: 'activity',
            overrideAccess: true,
            req,
            data: {
              actor: req.user?.collection === 'users' ? req.user.name : 'CMS редактор',
              action: `${doc.name}: эрхийг ${previousDoc.role} → ${doc.role} болгож өөрчилсөн`,
            },
          })
          const profiles = await req.payload.find({
            collection: 'members',
            where: { account: { equals: doc.id } },
            overrideAccess: true,
            req,
          })
          for (const profile of profiles.docs)
            await req.payload.update({
              collection: 'members',
              id: profile.id,
              data: { role: doc.role },
              overrideAccess: true,
              req,
            })
        }
        return doc
      },
    ],
  },
}
export const Members: CollectionConfig = {
  slug: 'members',
  admin: { useAsTitle: 'name', group: 'Гишүүнчлэл' },
  access: { read: () => true, create: educators, update: educators, delete: educators },
  hooks: { afterChange: [refreshClub], afterDelete: [deleteClub] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      options: ['member', 'core', 'leader', 'teacher'],
      required: true,
    },
    { name: 'major', type: 'text', required: true },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    {
      name: 'account',
      type: 'relationship',
      relationTo: 'users',
      access: { read: ({ req }) => hasRole(req.user, ['leader', 'teacher']) },
    },
  ],
}
export const Registrations: CollectionConfig = {
  slug: 'registrations',
  admin: { group: 'Сургалт' },
  access: {
    create: ({ req }) => req.user?.collection === 'users',
    read: ({ req }) =>
      hasRole(req.user, ['leader', 'teacher']) ||
      (req.user?.collection === 'users' ? { member: { equals: req.user.id } } : false),
    update: ({ req }) =>
      req.user?.collection === 'users' ? { member: { equals: req.user.id } } : false,
    delete: educators,
  },
  fields: [
    { name: 'member', type: 'relationship', relationTo: 'users', required: true },
    { name: 'training', type: 'relationship', relationTo: 'events', required: true },
    { name: 'key', type: 'text', unique: true, required: true, admin: { readOnly: true } },
    {
      name: 'status',
      type: 'select',
      options: ['registered', 'cancelled'],
      defaultValue: 'registered',
      required: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc }) => {
        if (req.user?.collection === 'users') data.member = req.user.id
        const trainingId =
          typeof (data.training ?? originalDoc?.training) === 'object'
            ? (data.training ?? originalDoc?.training).id
            : (data.training ?? originalDoc?.training)
        const training = await req.payload.findByID({
          collection: 'events',
          id: trainingId,
          overrideAccess: false,
          user: req.user,
          req,
        })
        if (
          training.scope !== 'internal' ||
          training.archived ||
          training._status !== 'published' ||
          new Date(training.date) < new Date()
        )
          throw new Error('Энэ сургалтад бүртгүүлэх боломжгүй.')
        const memberId =
          typeof data.member === 'object' ? data.member.id : (data.member ?? originalDoc?.member)
        data.key = `${memberId}:${training.id}`
        return data
      },
    ],
  },
}
export const Activity: CollectionConfig = {
  slug: 'activity',
  admin: { group: 'Гишүүнчлэл' },
  access: { read: staff, create: () => false, update: () => false, delete: () => false },
  fields: [
    { name: 'actor', type: 'text', required: true },
    { name: 'action', type: 'text', required: true },
  ],
}
