import type { Metadata } from 'next'

import { InfoPageLayout } from '@/components/info-page-layout'

export const metadata: Metadata = {
  title: 'شروط الاستخدام',
  description: 'الشروط الأساسية لاستخدام منصة خطواتك للمعارض.',
}

const sections = [
  {
    title: 'استخدام المنصة',
    paragraphs: [
      'تتيح خطواتك للمعارض تصفح معروضات الأحذية والتعرّف على المعارض والعارضين. باستخدامك للمنصة، توافق على الالتزام بهذه الشروط وعلى استخدام الموقع بطريقة نظامية ومحترمة.',
      'يُمنع إساءة استخدام الموقع أو محاولة تعطيله أو الوصول إلى حساب أو بيانات لا تخصك.',
    ],
  },
  {
    title: 'معلومات المنتجات والمعارض',
    paragraphs: [
      'تُعرض معلومات المنتجات والأسعار والتوفر بناءً على البيانات التي يقدمها العارض. يتحمل العارض مسؤولية دقة معلوماته وتحديثها، وينبغي للزائر التحقق من التفاصيل مباشرةً مع المعرض قبل الشراء.',
    ],
  },
  {
    title: 'الطلبات والمعاملات',
    paragraphs: [
      'المنصة وسيلة للتعريف بالمعروضات والتواصل، وليست طرفًا في اتفاق البيع بين الزائر والعارض. يتفق الطرفان مباشرةً على السعر النهائي والتوفر والدفع والتسليم وأي شروط أخرى للشراء.',
    ],
  },
  {
    title: 'حسابات العارضين',
    paragraphs: [
      'يتطلب استخدام لوحة العارضين تقديم طلب ومراجعته وتفعيله من الإدارة. يتحمل العارض مسؤولية الحفاظ على سرية كود التفعيل واستخدامه بنفسه، وتخضع صلاحية الدخول لحالة طلبه.',
      'يجوز للإدارة مراجعة الطلبات أو رفضها أو إيقاف صلاحية الوصول عند الحاجة إلى ذلك.',
    ],
  },
  {
    title: 'التغييرات والتواصل',
    paragraphs: [
      'قد تتغير هذه الشروط أو خصائص المنصة عند تطوير الخدمة. ننشر النسخة المحدّثة على هذه الصفحة، ويعد استمرار استخدام المنصة بعد نشر التغييرات قبولًا بها.',
      'للاستفسارات، يمكنك التواصل معنا عبر رابط واتساب الموجود في تذييل الموقع.',
    ],
  },
]

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="معلومات قانونية"
      title="شروط الاستخدام"
      description="يرجى قراءة هذه الشروط لمعرفة إطار استخدام المنصة ودور كل من الزائر والعارض."
    >
      <div className="space-y-4">
        {sections.map((section, index) => (
          <section
            key={section.title}
            className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm font-extrabold text-amber-800">
                {index + 1}
              </span>
              <div>
                <h2 className="text-lg font-bold text-brand-950">
                  {section.title}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 text-sm leading-8 text-brand-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </InfoPageLayout>
  )
}
