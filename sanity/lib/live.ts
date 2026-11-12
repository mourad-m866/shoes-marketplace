import { defineLive } from 'next-sanity/live'

import { client } from './client'

/**
 * `defineLive` wires the Sanity client into the Live Content API so cached
 * pages refresh automatically when content changes in Sanity.
 *
 * `strict: true` forces every `sanityFetch()` call to state its `perspective`
 * and `stega` explicitly. This is required by Cache Components, where
 * `cookies()` / `draftMode()` cannot be read inside a `'use cache'` boundary.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  strict: true,
})
