import {CollectionConfig} from "payload";

export const Projects: CollectionConfig = {
    slug: 'projects',
    admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'status', 'slug'],
    },
    access: {
        read: () => true,
    },
    fields: [
        {
            name: 'title',
            label: 'Project Name (Internal & SEO)',
            type: 'text',
            required: true,
        },
        {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
            required: true,
            label: 'Project Logo',
            admin: {
                description: 'Upload the white/transparent logo used in the header.',
            },
        },
        {
            name: 'slug', // e.g., "cluely" (used for the URL /projects/cluely)
            type: 'text',
            required: true,
            unique: true,
            admin: {
                position: 'sidebar',
            },
        },
        {
            // The subtitle shown in both views
            // e.g. "Live AI meeting assistant..." or "Bringing the viral pop-up..."
            name: 'subtitle',
            type: 'text',
        },
        {
            name: 'featuredImage',
            type: 'upload',
            relationTo: 'media', // This links to the Media collection we fixed earlier
            required: true,
        },
        {
            // Link to the live site (e.g. "Visit Cluely ->")
            name: 'liveLink',
            type: 'text',
            label: 'Live Website URL',
            admin: {
                description: 'Legacy single link. Prefer "Links" below; this still renders if Links is empty.',
            },
        },
        {
            name: 'order',
            type: 'number',
            admin: {
                position: 'sidebar',
                description: 'Lower shows first. Projects without a number come after, newest first.',
            },
        },
        {
            name: 'isConcept',
            type: 'checkbox',
            label: 'Concept project',
            defaultValue: false,
            admin: {
                position: 'sidebar',
                description: 'Shows a "Concept" badge — for work that was not built for a real client.',
            },
        },
        {
            // Several destinations per project, e.g. App Store + web app + GitHub.
            name: 'links',
            type: 'array',
            labels: {
                singular: 'Link',
                plural: 'Links',
            },
            admin: {
                description: 'Shown at the top of the case study. App Store links get an App Store-style button.',
            },
            fields: [
                {
                    type: 'row',
                    fields: [
                        {
                            name: 'label',
                            type: 'text',
                            required: true,
                            admin: {
                                description: 'e.g. "Download on the App Store", "Open the web app".',
                            },
                        },
                        {
                            name: 'url',
                            type: 'text',
                            required: true,
                        },
                        {
                            name: 'kind',
                            type: 'select',
                            required: true,
                            defaultValue: 'web',
                            options: [
                                {label: 'App Store', value: 'appstore'},
                                {label: 'Website', value: 'web'},
                                {label: 'GitHub', value: 'github'},
                                {label: 'Other', value: 'other'},
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: 'tabs',
            tabs: [
                {
                    label: 'Card Details',
                    fields: [
                        {
                            // The short text for the listing page (Image 1)
                            name: 'shortDescription',
                            type: 'textarea',
                            label: 'Listing Summary',
                            required: true,
                        },
                        {
                            // Custom text for the link (e.g. "Bijou case study ->")
                            // If empty, you can default to "View Project" in code
                            name: 'cardLinkText',
                            type: 'text',
                        }
                    ],
                },
                {
                    label: 'Project Details',
                    fields: [
                        {
                            // The main "About the project" content (Image 2)
                            name: 'content',
                            type: 'richText',
                            label: 'About the Project',
                        },
                        {
                            // "Provided services" list (Brand Identity, Web Design, etc.)
                            name: 'services',
                            type: 'array',
                            fields: [
                                {
                                    name: 'serviceName',
                                    type: 'text',
                                },
                            ],
                        },
                        {
                            // "Technology stack" list (React, TypeScript, etc.)
                            name: 'techStack',
                            type: 'array',
                            fields: [
                                {
                                    name: 'techName',
                                    type: 'text',
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'Testimonial',
                    fields: [
                        {
                            name: 'testimonial',
                            type: 'group',
                            admin: {
                                description: 'Optional. Leave the quote empty to hide it.',
                            },
                            fields: [
                                {
                                    name: 'quote',
                                    type: 'textarea',
                                },
                                {
                                    name: 'name',
                                    type: 'text',
                                },
                                {
                                    name: 'role',
                                    type: 'text',
                                    admin: {
                                        description: 'e.g. "Founder, Nap Atlas".',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'Gallery',
                    fields: [
                        {
                            // Extra shots shown further down the case study page,
                            // e.g. the web app, the admin console, mobile screens.
                            name: 'gallery',
                            type: 'array',
                            label: 'Gallery',
                            labels: {
                                singular: 'Image',
                                plural: 'Images',
                            },
                            admin: {
                                description: 'Screens shown below the write-up. Drag to reorder.',
                            },
                            fields: [
                                {
                                    name: 'image',
                                    type: 'upload',
                                    relationTo: 'media',
                                    required: true,
                                },
                                {
                                    // Rendered under the image
                                    name: 'caption',
                                    type: 'text',
                                    admin: {
                                        description: 'e.g. "Admin console — cafe moderation".',
                                    },
                                },
                                {
                                    name: 'wide',
                                    type: 'checkbox',
                                    label: 'Full width',
                                    admin: {
                                        description: 'Span the whole row instead of sharing it. Good for dashboards; leave off for phone screens.',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
}