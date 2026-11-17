import path from 'path'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Posts, Events, Projects, Tracks } from './collections/ClubContent'
import { Users, Members, Registrations, Activity } from './collections/ClubUsers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// LOCAL хувилбар: Figma Cloud-ийн buildFigmaConfig-ийн оронд стандарт Payload + SQLite.
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'local-dev-secret-change-me',
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || 'file:./club.db' },
  }),
  editor: lexicalEditor(),
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    importMap: { baseDir: path.resolve(dirname) },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Media,
    Folders,
    Tags,
    Users,
    Members,
    Posts,
    Events,
    Projects,
    Tracks,
    Registrations,
    Activity,
  ],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
})
