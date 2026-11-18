import type { Metadata } from 'next'
import Link from 'next/link'

import { InfoPageLayout } from '@/components/info-page-layout'

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description:
    'إجابات عن تصفح معارض الأحذية واستخدام بوابة العارضين في خطواتك للمعارض.',
}

const buyerQuestions = [
  {
    question: 'كيف أبحث عن حذاء مناسب؟',
    answer:
      'من صفحة معرض الزبون، استخدم خيارات التصفية بحسب الفئة والمعرض والمقاس والسعر، ثم استعرض المنتجات المتاحة.',
  },
  {
    question: 'كيف أشتري منتجًا معروضًا؟',
    answer:
      'المنصة تعرض المنتجات وتفاصيل المعرض. تواصل مباشرةً مع العارض للتأكد من المقاس والتوفر والسعر وترتيب الشراء.',
  },
  {
    question: 'هل السعر والتوفر مضمونان؟',
    answer:
      'المعلومات يضيفها العارض وقد تتغير. يُرجى التأكد من السعر والتوفر والتفاصيل مع المعرض قبل إتمام الشراء.',
  },
]

const sellerQuestions = [
  {
    question: 'كيف أبدأ باستخدام بوابة العارضين؟',
    answer:
      'قدّم طلب تفعيل من صفحة العارضين. بعد مراجعة الإدارة وموافقتها، أدخل كود التفعيل الذي يصلك عبر واتساب لفتح اللوحة.',
  },
  {
    question: 'ماذا أفعل إذا رُفض طلبي؟',
    answer:
      'يمكنك إعادة إرسال الطلب من صفحة العارضين باستخدام رقم الهاتف نفسه. بعد المراجعة والموافقة، ستحتاج إلى كود تفعيل جديد.',
  },
  {
    question: 'كيف أضيف أو أعدّل منتجًا؟',
    answer:
      'بعد تفعيل حسابك، افتح لوحة العارض لإضافة المنتجات أو تعديلها وإدارة المعروضات المرتبطة بمعرضك.',
  },
]

function QuestionList({
  questions,
}: {
  questions: {question: string; answer: string}[]
}) {
  return (
    <div className="mt-5 space-y-3">
      {questions.map(({question, answer}) => (
        <details
          key={question}
          className="group rounded-2xl border border-brand-100 bg-white p-5 shadow-sm open:border-amber-200"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-brand-950 marker:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
            {question}
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition group-open:rotate-45 group-open:bg-amber-100 group-open:text-amber-800"
            >
              +
            </span>
          </summary>
          <p className="mt-4 border-t border-brand-100 pt-4 text-sm leading-7 text-brand-600">
            {answer}
          </p>
        </details>
      ))}
    </div>
  )
}

export default function FaqPage() {
  return (
    <InfoPageLayout
      eyebrow="مركز المساعدة"
      title="الأسئلة الشائعة"
      description="معلومات تساعدك على تصفح المعروضات أو البدء كعارض على المنصة."
    >
      <section aria-labelledby="buyers-title">
        <h2 id="buyers-title" className="text-xl font-extrabold text-brand-950">
          للزوار والمشترين
        </h2>
        <QuestionList questions={buyerQuestions} />
      </section>

      <section aria-labelledby="sellers-title" className="mt-10">
        <h2 id="sellers-title" className="text-xl font-extrabold text-brand-950">
          للعارضين
        </h2>
        <QuestionList questions={sellerQuestions} />
      </section>

      <p className="mt-8 rounded-2xl bg-brand-100/70 p-5 text-sm leading-7 text-brand-700">
        هل تحتاج إلى مساعدة إضافية؟{' '}
        <Link
          href="/seller"
          className="font-bold text-brand-900 underline decoration-amber-500 underline-offset-4"
        >
          تفضل بزيارة بوابة العارضين
        </Link>{' '}
        أو تواصل معنا عبر واتساب من أسفل الصفحة.
      </p>
    </InfoPageLayout>
  )
}
