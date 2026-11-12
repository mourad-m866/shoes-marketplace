import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

/**
 * Read-only client used for querying published content.
 *
 * `useCdn` is enabled so reads are served from the CDN.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true, // Set to false if you need guaranteed-fresh reads
  perspective: 'published',
})
