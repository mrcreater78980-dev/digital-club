import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidateTag } from 'next/cache'

// One shared tag covers lists, details, old/new slugs, roadmaps, and related media.
function invalidateClub() {
  if (process.env.NEXT_RUNTIME) revalidateTag('club-content', { expire: 0 })
}
export const refreshClub: CollectionAfterChangeHook = async ({
  doc,
  req,
  collection,
  operation,
}) => {
  invalidateClub()
  if (req.user && ['posts', 'events', 'projects', 'tracks'].includes(collection.slug)) {
    await req.payload.create({
      collection: 'activity',
      overrideAccess: true,
      req,
      data: {
        actor: req.user.collection === 'users' ? req.user.name : 'CMS редактор',
        action: `“${doc.title}” — ${doc._status === 'published' ? 'нийтэлсэн' : operation === 'create' ? 'ноорог үүсгэсэн' : 'ноорог хадгалсан'}`,
      },
    })
  }
  return doc
}
export const deleteClub: CollectionAfterDeleteHook = async ({ doc, req, collection }) => {
  invalidateClub()
  if (req.user && ['posts', 'events', 'projects', 'tracks'].includes(collection.slug)) {
    await req.payload.create({
      collection: 'activity',
      overrideAccess: true,
      req,
      data: {
        actor: req.user.collection === 'users' ? req.user.name : 'CMS редактор',
        action: `“${doc.title}” — устгасан`,
      },
    })
  }
  return doc
}
