import type { CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import { refreshClub, deleteClub } from '@/lib/club-hooks'
import { staff } from '@/lib/club-access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  hooks: { afterChange: [refreshClub], afterDelete: [deleteClub] },
  upload: {
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
      return headers
    },
  },
}
