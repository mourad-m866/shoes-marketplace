import fs from 'node:fs'

const content = fs.readFileSync(process.argv[2], 'utf8')

// Pull every <img ...> tag and report the src/srcset widths.
const imgs = [...content.matchAll(/<img[^>]*>/g)].map((m) => m[0])

console.log('img tags:', imgs.length)

for (const tag of imgs.slice(0, 3)) {
  console.log('\n---\n' + tag.slice(0, 700))
}

const widths = new Set()
for (const m of content.matchAll(/[?&]w=(\d+)/g)) widths.add(m[1])
console.log('\nwidths present in html:', [...widths].sort((a, b) => a - b).join(', '))
