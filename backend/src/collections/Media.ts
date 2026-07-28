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
  },
}
