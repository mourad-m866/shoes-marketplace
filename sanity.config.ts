'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\app\studio\[[...tool]]\page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'
import {
  DeleteActivationRequestAction,
  DeleteExhibitionAction,
} from './sanity/actions/delete-linked-documents'
import {SendActivationEmailAction} from './sanity/actions/send-activation-email'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  document: {
    actions: (previous, context) => {
      if (context.schemaType === 'exhibition') {
        return previous.map((action) =>
          action.action === 'delete' ? DeleteExhibitionAction : action,
        )
      }

      if (context.schemaType === 'activationRequest') {
        return [
          ...previous.map((action) =>
            action.action === 'delete' ? DeleteActivationRequestAction : action,
          ),
          SendActivationEmailAction,
        ]
      }

      return previous
    },
  },
  plugins: [
    structureTool({structure}),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
