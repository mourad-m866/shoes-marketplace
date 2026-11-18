import type { Metadata } from 'next'

import { InfoPageLayout } from '@/components/info-page-layout'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'كيف تتعامل منصة خطواتك للمعارض مع بيانات الزوار والعارضين.',
}

const sections = [
  {
    title: 'البيانات التي نتعامل معها',
    body: 'عند تقديم طلب تفعيل، نستخدم الاسم ورقم الهاتف واسم المعرض المقترح لمراجعة الطلب والتواصل بشأنه. وعند استخدام لوحة العارض، تُستخدم بيانات المعرض والمنتجات التي يضيفها العارض لعرضها على الزوار.',
  },
  {
    title: 'كيف نستخدم البيانات',
    body: 'نستخدم البيانات لتشغيل المنصة، ومراجعة طلبات العارضين، وإدارة صلاحية الوصول، ونشر معلومات المعارض والمنتجات التي اختار العارض عرضها.',
  },
  {
    title: 'المعلومات الظاهرة للزوار',
    body: 'قد تظهر للزوار معلومات المعرض والمنتجات التي يضيفها العارض، مثل اسم المعرض والمدينة وبيانات التواصل وتفاصيل المنتج. يرجى عدم إدخال معلومات لا ترغب في إتاحتها ضمن المعروضات العامة.',
  },
  {
    title: 'ملفات الارتباط',
    body: 'تستخدم لوحة العارض ملف ارتباط ضروريًا لحفظ جلسة الدخول والتحقق من صلاحية الوصول. لا يُستخدم هذا الملف لتسجيل الدخول إلى حسابات خارجية.',
  },
  {
    title: 'حفظ البيانات وطلبات التعديل',
    body: 'نحتفظ بالبيانات اللازمة لتشغيل الخدمة وإدارة السجلات. إذا احتجت إلى تصحيح معلوماتك أو الاستفسار عن حذف سجل، تواصل مع الإدارة عبر واتساب. لا تشارك كود التفعيل مع أي شخص.',
  },
  {
    title: 'تحديث السياسة',
    body: 'قد نحدّث هذه السياسة عند تطوير المنصة. ستُنشر أي نسخة جديدة على هذه الصفحة مع تاريخ تحديثها.',
  },
]

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      eyebrow="معلومات قانونية"
      title="سياسة الخصوصية"
      description="نوضح هنا أنواع البيانات المرتبطة باستخدام المنصة وكيفية الاستفادة منها لتقديم الخدمة."
    >
      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-sm text-brand-500">
          آخر تحديث: 18 نوفمبر 2026
        </p>
        <div className="mt-6 divide-y divide-brand-100">
          {sections.map((section) => (
            <section key={section.title} className="py-5 first:pt-0 last:pb-0">
              <h2 className="text-lg font-bold text-brand-950">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-8 text-brand-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </div>
    </InfoPageLayout>
  )
}
