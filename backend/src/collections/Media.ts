import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    // Cap the stored original and convert rasters to WebP. Payload's
    // canResizeImage() excludes image/svg+xml, so vector logos pass through
    // untouched and stay sharp at any size.
    resizeOptions: {
      width: 1800,
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 900,
        withoutEnlargement: true,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
    ],
    adminThumbnail: 'thumbnail',
    // Fallback for files proxied through /api/media/file/*. Uploads get a
    // unique filename (Payload suffixes duplicates), so a long cache is safe.
    // The real fix is DO_SPACES_CDN_URL, which serves files straight off the
    // Spaces CDN and bypasses this route entirely.
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=2592000, s-maxage=31536000, stale-while-revalidate=86400')
      return headers
    },
  },
}
