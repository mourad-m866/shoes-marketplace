import fs from 'node:fs'

const file = process.argv[2]
const content = fs.readFileSync(file, 'utf8')

const checks = {
  'html lang=ar': /<html[^>]*lang="ar"/,
  'html dir=rtl': /<html[^>]*dir="rtl"/,
  'brand logo': /خطواتك للمعارض/,
  'banner headline': /أفخم الأحذية/,
  'showroom toggle label': /معرض الزبون/,
  'seller toggle label': /لوحة العارض/,
  'search field': /البحث بالاسم/,
  'category filters': /كلاسيكي/,
  'exhibition filter': /كل المعارض/,
  'size filter': /كل المقاسات/,
  'price slider low': /aria-label="أقل سعر"/,
  'price slider high': /aria-label="أعلى سعر"/,
  'results count': /عدد النتائج/,
  'reset filters': /إعادة ضبط عوامل التصفية/,
  'empty state': /لا توجد أحذية مطابقة/,
}

const missing = []

for (const [name, pattern] of Object.entries(checks)) {
  if (pattern.test(content)) {
    console.log('OK   ', name)
  } else {
    console.log('FAIL ', name)
    missing.push(name)
  }
}

const shoeTitles = [...content.matchAll(/حذاء [^<"]{2,40}/g)].map((m) => m[0])
const unique = [...new Set(shoeTitles)]
console.log('\nshoe-like strings found:', unique.length)
for (const t of unique.slice(0, 15)) console.log('   -', t)

const stores = [...content.matchAll(/معرض [^<"]{2,40}/g)].map((m) => m[0])
console.log('\nexhibition-like strings:', [...new Set(stores)].slice(0, 10))

console.log(missing.length ? `\nMISSING: ${missing.join(', ')}` : '\nALL CHECKS PASSED')
