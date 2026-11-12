import fs from 'node:fs'

const file = process.argv[2]
const content = fs.readFileSync(file, 'utf8')

const checks = {
  'seller heading': /لوحة العارض \(البائع\)/,
  'exhibition select label': /المعرض الحالي/,
  'add shoe button': /\+ إضافة حذاء جديد للمعرض/,
  'info card seller': /البائع:/,
  'info card phone': /\+963/,
  'shoes table heading': /الأحذية المعروضة/,
  'table image column': />الصورة</,
  'table category column': />الفئة</,
  'table price column': />السعر</,
  'table sizes column': />المقاسات</,
  'table status column': />الحالة</,
  'table actions column': />الإجراءات</,
  'edit action': /تعديل/,
  'delete action': /حذف/,
  'available badge': /متاح/,
  'unavailable badge': /غير متاح/,
  'product count': /منتج/,
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

const titles = [...new Set([...content.matchAll(/حذاء [^<"\\]{2,40}/g)].map((m) => m[0]))]
console.log('\nshoe titles rendered:', titles.length)
for (const t of titles) console.log('   -', t)

console.log(missing.length ? `\nMISSING: ${missing.join(', ')}` : '\nALL CHECKS PASSED')
