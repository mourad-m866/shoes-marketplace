import fs from 'node:fs'

const content = fs.readFileSync(process.argv[2], 'utf8')

// The "+" lives in its own span, and React splits text with comment markers,
// so search for the button's text content with those separators removed.
const text = content.replace(/<!--.*?-->/g, '')

const needles = [
  'إضافة حذاء جديد للمعرض',
  'غير متاح',
  'متاح',
  'المعرض الحالي',
  'المعرض الأصالة',
  'بيت الأحذية الحديث',
  'خطوات أكتيف',
]

for (const needle of needles) {
  console.log(text.includes(needle) ? 'FOUND   ' : 'ABSENT  ', needle)
}

const selectMatch = text.match(
  /<select[^>]*id="exhibition-select"[\s\S]{0,600}?<\/select>/,
)
console.log('\n--- exhibition select ---')
console.log(selectMatch ? selectMatch[0].slice(0, 600) : 'not found')

console.log('\n--- add button block ---')
const btnIndex = text.indexOf('إضافة حذاء جديد للمعرض')
console.log(btnIndex >= 0 ? text.slice(btnIndex - 320, btnIndex + 60) : 'not found')
