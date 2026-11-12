import fs from 'node:fs'

const content = fs.readFileSync(process.argv[2], 'utf8')

const images = [...content.matchAll(/\/_next\/image\?url=([^&"]+)/g)].map((m) =>
  decodeURIComponent(m[1]),
)

const sanityImages = images.filter((u) => u.includes('cdn.sanity.io'))

console.log('total next/image urls:', images.length)
console.log('sanity cdn images    :', sanityImages.length)
console.log('sample:', sanityImages[0] ?? 'none')

const broken = [...content.matchAll(/src="([^"]*cdn\.sanity[^"]*)"/g)].map((m) => m[1])
console.log('raw sanity src attrs :', broken.length)

// Image optimizer URLs should be relative to /_next/image
const optimized = [...content.matchAll(/srcSet="([^"]+)"/g)]
  .flatMap((m) => m[1].split(', '))
  .filter((s) => s.includes('cdn.sanity.io'))
console.log('optimized variants   :', optimized.length)
if (optimized[0]) console.log('sample srcSet entry   :', optimized[0].slice(0, 140))
