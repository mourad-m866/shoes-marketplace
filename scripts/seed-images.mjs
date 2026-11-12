/**
 * Uploads a placeholder image for every seeded shoe and exhibition logo so
 * the storefront renders real Sanity images.
 *
 * Usage: node scripts/seed-images.mjs
 */
import { createRequire } from 'node:module'

import { createClient } from '@sanity/client'

const require = createRequire(import.meta.url)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-11-11',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})

/** Builds a tiny valid PNG with a solid colour. */
function solidPng(hex, size = 400) {
  const zlib = require('node:zlib')

  const crcTable = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    crcTable[n] = c >>> 0
  }
  const crc32 = (buf) => {
    let c = 0xffffffff
    for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
    return (c ^ 0xffffffff) >>> 0
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4)
    len.writeUInt32BE(data.length)
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(typeAndData))
    return Buffer.concat([len, typeAndData, crc])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // truecolour
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc((size * 3 + 1) * size)
  let offset = 0
  for (let y = 0; y < size; y++) {
    raw[offset++] = 0
    for (let x = 0; x < size; x++) {
      raw[offset++] = hex[0]
      raw[offset++] = hex[1]
      raw[offset++] = hex[2]
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const PALETTE = [
  [0x4f, 0x77, 0xb0],
  [0xe5, 0xb3, 0x2a],
  [0x33, 0x4c, 0x78],
  [0x12, 0x1b, 0x2d],
  [0xa4, 0xbb, 0xdb],
  [0xf2, 0xc9, 0x4c],
]

async function upload(buffer, filename) {
  const asset = await client.assets.upload('image', buffer, {
    filename,
    contentType: 'image/png',
  })
  return asset._id
}

async function run() {
  const exhibitions = await client.fetch(
    '*[_type == "exhibition"] | order(storeName asc){_id, storeName}',
  )
  const shoes = await client.fetch('*[_type == "shoe"] | order(title asc){_id, title}')

  for (const [index, exhibition] of exhibitions.entries()) {
    const assetId = await upload(
      solidPng(PALETTE[index % PALETTE.length]),
      `${exhibition._id}.png`,
    )
    await client
      .patch(exhibition._id)
      .set({
        logo: {
          _type: 'image',
          asset: {_type: 'reference', _ref: assetId},
        },
      })
      .commit()
    console.log('logo set:', exhibition.storeName, '->', assetId)
  }

  for (const [index, shoe] of shoes.entries()) {
    const assetId = await upload(
      solidPng(PALETTE[index % PALETTE.length]),
      `${shoe._id}.png`,
    )
    await client
      .patch(shoe._id)
      .set({
        image: {
          _type: 'image',
          asset: {_type: 'reference', _ref: assetId},
        },
      })
      .commit()
    console.log('image set:', shoe.title, '->', assetId)
  }

  console.log('done')
}

run().catch((error) => {
  console.error('FAILED:', error.message)
  process.exit(1)
})
