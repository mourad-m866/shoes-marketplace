import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { SellerDashboard } from '@/components/seller/seller-dashboard'
import { SellerAccessGate } from '@/components/seller/seller-access-gate'
import { SiteHeader } from '@/components/site-header'
import { getSellerAccess } from '@/lib/seller-session'
import { getSellerShoes } from '@/sanity/lib/data'

export const metadata = {
  title: 'لوحة العارض (البائع)',
}

export default function SellerPage({
  searchParams,
}: {
  searchParams: Promise<{access?: string | string[]}>
}) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <p role="status" className="mx-auto max-w-7xl px-4 py-10 text-brand-600">
              جارٍ التحقق من صلاحية الدخول…
            </p>
          }
        >
          <SellerPageContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  )
}

async function SellerPageContent({
  searchParams,
}: {
  searchParams: Promise<{access?: string | string[]}>
}) {
  const params = await searchParams
  const showRejectedNotice = params.access === 'rejected'
  const access = await getSellerAccess()

  if (access.status === 'rejected' && !showRejectedNotice) {
    redirect('/seller/revoke')
  }

  return access.status === 'approved' ? (
    <SellerDashboard
      exhibitions={[access.exhibition]}
      shoes={await getSellerShoes(access.exhibition._id)}
    />
  ) : (
    <>
      {(access.status === 'rejected' || showRejectedNotice) && (
        <p
          role="alert"
          className="mx-auto mt-8 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold leading-7 text-rose-800"
        >
          تم رفض طلب تفعيل معرضك وإلغاء جلستك. لا يمكنك الوصول إلى لوحة التحكم أو
          إدارة المنتجات. أعد إرسال الطلب، وبعد مراجعته ستحتاج إلى إدخال كود
          التفعيل الجديد الذي يصلك عبر واتساب.
        </p>
      )}
      <SellerAccessGate />
    </>
  )
}
