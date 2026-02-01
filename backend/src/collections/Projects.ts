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
            ],
        },
    ],
}