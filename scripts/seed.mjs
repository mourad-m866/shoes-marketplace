/**
 * Seeds the Sanity dataset with demo exhibitions and shoes.
 *
 * Usage: node scripts/seed.mjs
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2026-11-11',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})

const exhibitions = [
  {
    _type: 'exhibition',
    storeName: 'معرض الأصالة للأحذية',
    sellerName: 'أحمد🇸🇾',
    city: 'دمشق',
    phone: '+963 11 234 5678',
    description:
      'معرض متخصص بالأحذية الكلاسيكية والجلدية الفاخرة، مع خدمة توصيل لجميع المحافظات.',
  },
  {
    _type: 'exhibition',
    storeName: 'خطوات أكتيف',
    sellerName: 'سارة الأحمد',
    city: 'حلب',
    phone: '+963 21 987 6543',
    description: 'أحذية رياضية وكاجوال للرجال والنساء، مع خصومات أسبوعية.',
  },
  {
    _type: 'exhibition',
    storeName: 'بيت الأحذية الحديث',
    sellerName: 'محمود دياب',
    city: 'اللاذقية',
    phone: '+963 41 555 1122',
    description: 'أحدث موديلات الأحذية النسائية والأطفال مع أسعار منافسة.',
  },
]

const shoes = [
  {
    title: 'حذاء رياضي جلد طبيعي',
    category: 'رياضي',
    price: 89.5,
    sizes: [40, 41, 42, 43, 44],
    description: 'حذاء رياضي من الجلد الطبيعي مع نعل مرن ومبطّن، مثالي للاستخدام اليومي.',
    isAvailable: true,
    exhibition: 0,
  },
  {
    title: 'حذاء رياضي خفيف للجري',
    category: 'رياضي',
    price: 65,
    sizes: [39, 40, 41, 42],
    description: 'خفيف الوزن ومناسب للجري والتمارين في الجيم.',
    isAvailable: true,
    exhibition: 1,
  },
  {
    title: 'حذاء كلاسيكي جلد أسود',
    category: 'كلاسيكي',
    price: 120,
    sizes: [40, 41, 42, 43, 44, 45],
    description: 'حذاء كلاسيكي أنيق من الجلد الأسود اللامع يناسب المناسبات الرسمية.',
    isAvailable: true,
    exhibition: 0,
  },
  {
    title: 'حذاء كلاسيكي بيج',
    category: 'كلاسيكي',
    price: 110,
    sizes: [41, 42, 43],
    description: 'لون بيج هادئ مع تصميم كلاسيكي مريح.',
    isAvailable: false,
    exhibition: 0,
  },
  {
    title: 'حذاء كاجوال قماش',
    category: 'كاجوال',
    price: 45,
    sizes: [38, 39, 40, 41],
    description: 'حذاء كاجوال خفيف من القماش، مثالي للإطلالات اليومية.',
    isAvailable: true,
    exhibition: 1,
  },
  {
    title: 'حذاء كاجوال رياضي أبيض',
    category: 'كاجوال',
    price: 52,
    sizes: [40, 41, 42, 43, 44],
    description: 'أبيض نظيف مع نعل مريح يناسب المشاوير الطويلة.',
    isAvailable: true,
    exhibition: 1,
  },
  {
    title: 'حذاء نسائي كعب متوسط',
    category: 'نسائي',
    price: 78,
    sizes: [36, 37, 38, 39],
    description: 'كعب متوسط مريح مع لمسة عصرية تناسب السهرة.',
    isAvailable: true,
    exhibition: 2,
  },
  {
    title: 'حذاء نسائي رياضي وردي',
    category: 'نسائي',
    price: 58,
    sizes: [36, 37, 38],
    description: 'لون وردي جريء مع نعل مرن.',
    isAvailable: true,
    exhibition: 2,
  },
  {
    title: 'حذاء أطفال رياضي ملوّن',
    category: 'أطفال',
    price: 25,
    sizes: [28, 29, 30, 31],
    description: 'حذاء رياضي للأطفال بألوان زاهية ورباط سهل.',
    isAvailable: true,
    exhibition: 2,
  },
  {
    title: 'حذاء أطفال كلاسيكي أبيض',
    category: 'أطفال',
    price: 29.9,
    sizes: [27, 28, 29, 30, 31],
    description: 'أبيض أنيق للمناسبات، مع نعل مبطّن مريح.',
    isAvailable: true,
    exhibition: 2,
  },
]

async function run() {
  const createdExhibitions = []

  for (const exhibition of exhibitions) {
    const created = await client.create(exhibition)
    createdExhibitions.push(created._id)
    console.log('exhibition created:', created._id)
  }

  for (const shoe of shoes) {
    const {exhibition, ...rest} = shoe
    await client.create({
      ...rest,
      _type: 'shoe',
      exhibition: {
        _type: 'reference',
        _ref: createdExhibitions[exhibition],
      },
    })
    console.log('shoe created:', rest.title)
  }

  console.log('done')
}

run().catch((error) => {
  console.error('SEED FAILED:', error.message)
  process.exit(1)
})
