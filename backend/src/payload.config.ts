import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// DigitalOcean Spaces is S3-compatible. Uploads only move off local disk when
// all four vars are set, so local dev keeps working without credentials — but
// local disk is ephemeral, so production must have these.
const {
  DO_SPACES_BUCKET,
  DO_SPACES_REGION,
  DO_SPACES_KEY,
  DO_SPACES_SECRET,
  DO_SPACES_ENDPOINT,
  DO_SPACES_CDN_URL,
} = process.env

const spacesEnabled = Boolean(
  DO_SPACES_BUCKET && DO_SPACES_REGION && DO_SPACES_KEY && DO_SPACES_SECRET,
)

// Spaces exposes one endpoint per region; the explicit var wins if set.
const spacesEndpoint = DO_SPACES_ENDPOINT || `https://${DO_SPACES_REGION}.digitaloceanspaces.com`

if (!spacesEnabled && process.env.NODE_ENV === 'production') {
  console.warn(
    '[storage] DO Spaces is not configured — uploads will write to local disk, which does not survive a redeploy.',
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: spacesEnabled
    ? [
        s3Storage({
          collections: {
            media: {
              // The Space is shared with other projects (nook/, tenants/,
              // tipsytrails/ ...), so keep portfolio uploads namespaced.
              prefix: 'portfolio',
              // With a CDN configured, serve straight off it. Otherwise keep
              // routing through Payload, which works whatever the bucket ACL is.
              ...(DO_SPACES_CDN_URL
                ? {
                    disablePayloadAccessControl: true,
                    generateFileURL: ({ filename, prefix }) =>
                      [DO_SPACES_CDN_URL.replace(/\/+$/, ''), prefix, filename]
                        .filter(Boolean)
                        .join('/'),
                  }
                : {}),
            },
          },
          bucket: DO_SPACES_BUCKET!,
          acl: 'public-read',
          config: {
            endpoint: spacesEndpoint,
            region: DO_SPACES_REGION!,
            credentials: {
              accessKeyId: DO_SPACES_KEY!,
              secretAccessKey: DO_SPACES_SECRET!,
            },
          },
        }),
      ]
    : [],
})
