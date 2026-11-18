import type { Metadata } from 'next'
import Link from 'next/link'

import { InfoPageLayout } from '@/components/info-page-layout'

export const metadata: Metadata = {
  title: 'من نحن',
  description:
    'تعرّف على خطواتك للمعارض، المنصة التي تجمع معارض الأحذية المحلية ومعروضاتها في مكان واحد.',
}

const values = [
  {
    number: '١',
    title: 'اكتشاف أسهل',
    description:
      'تصفح معروضات متعددة، واستخدم الفلاتر للوصول إلى الفئة والمقاس والمعرض المناسب.',
  },
  {
    number: '٢',
    title: 'تواصل مباشر',
    description:
      'تعرّف على المعرض والعارض، ثم تواصل معه مباشرةً للاستفسار وإتمام الشراء.',
  },
  {
    number: '٣',
    title: 'مساحة للعارضين',
    description:
      'تساعد لوحة العارضين المعارض المفعّلة على إدارة معلوماتها وإضافة منتجاتها.',
  },
]

export default function AboutPage() {
  return (
    <InfoPageLayout
      eyebrow="خطواتك للمعارض"
      title="اكتشف معرضك القادم"
      description="منصة تجمع معارض الأحذية المحلية ومعروضاتها في تجربة تصفح واحدة، وتقرّب المسافة بينك وبين العارض."
    >
      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-base leading-8 text-brand-700 sm:text-lg">
          نؤمن أن العثور على الحذاء المناسب يبدأ باكتشاف الخيارات المتاحة. لذلك
          أنشأنا خطواتك للمعارض لتكون نافذة سهلة لاستعراض الأحذية والتعرّف على
          المعارض والعارضين المحليين، من دون أن تفقد التواصل المباشر معهم.
        </p>
        <p className="mt-5 text-base leading-8 text-brand-700 sm:text-lg">
          تعرض المنصة معلومات المنتجات كما يضيفها العارضون، وتتيح للزوار تصفحها
          بحسب الفئة والمعرض والمقاس والسعر. وعند اختيارك، تتواصل مع العارض
          مباشرةً للتأكد من التفاصيل وإتمام عملية الشراء.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => (
          <article
            key={value.number}
            className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-amber-100 text-sm font-extrabold text-amber-800">
              {value.number}
            </span>
            <h2 className="mt-4 text-lg font-bold text-brand-950">
              {value.title}
            </h2>
            <p className="mt-2 text-sm leading-7 text-brand-600">
              {value.description}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl bg-brand-950 p-6 text-white sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-xl font-bold">هل تدير معرض أحذية؟</h2>
          <p className="mt-2 text-sm leading-7 text-brand-100">
            تعرّف على بوابة العارضين وخطوات طلب تفعيل معرضك.
          </p>
        </div>
        <Link
          href="/seller"
          className="inline-flex shrink-0 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-brand-950 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
        >
          بوابة العارضين
        </Link>
      </div>
    </InfoPageLayout>
  )
}
