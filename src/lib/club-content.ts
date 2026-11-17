import { unstable_cache } from 'next/cache'
import { getPayloadClient, findBySlug } from '@/lib/payload'
import type { Post, Event, Project, Track, Member } from '@/payload-types'

export const getClubContent = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const [posts, events, projects, tracks, members] = await Promise.all([
      payload.find({
        collection: 'posts',
        overrideAccess: false,
        limit: 100,
        sort: '-date',
        depth: 1,
      }),
      payload.find({
        collection: 'events',
        overrideAccess: false,
        limit: 100,
        sort: 'date',
        depth: 1,
      }),
      payload.find({ collection: 'projects', overrideAccess: false, limit: 100, depth: 1 }),
      payload.find({
        collection: 'tracks',
        overrideAccess: false,
        limit: 10,
        sort: 'createdAt',
        depth: 1,
      }),
      payload.find({
        collection: 'members',
        overrideAccess: false,
        limit: 100,
        sort: 'createdAt',
        depth: 1,
      }),
    ])
    return {
      posts: posts.docs,
      events: events.docs,
      projects: projects.docs,
      tracks: tracks.docs,
      members: members.docs,
    }
  },
  ['digital-club-content-v1'],
  { tags: ['club-content'] },
)

export const getClubDetail = unstable_cache(
  async (type: 'posts' | 'events' | 'projects', slug: string) => findBySlug(type, slug),
  ['club-detail'],
  { tags: ['club-content'] },
)
export type ClubContent = {
  posts: Post[]
  events: Event[]
  projects: Project[]
  tracks: Track[]
  members: Member[]
}
