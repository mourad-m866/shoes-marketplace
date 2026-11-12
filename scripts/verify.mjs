import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-11-11',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})

const rows = await client.fetch(`
  *[_type == "shoe"] | order(_createdAt desc)[0...3] {
    _id, title, price, category, sizes, isAvailable,
    "exhibition": exhibition->storeName
  }
`)

console.log(JSON.stringify(rows, null, 2))
