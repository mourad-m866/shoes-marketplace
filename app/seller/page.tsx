import { Suspense } from 'react'

import { SellerDashboard } from '@/components/seller/seller-dashboard'
import { SellerAccessGate } from '@/components/seller/seller-access-gate'
import { SiteHeader } from '@/components/site-header'
import { getSellerAccess } from '@/lib/seller-session'
import { getSellerShoes } from '@/sanity/lib/data'

export const metadata = {
  title: 'لوحة العارض (البائع)',
}

export default function SellerPage() {
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
          <SellerPageContent />
        </Suspense>
      </main>
    </div>
  )
}

async function SellerPageContent() {
  const access = await getSellerAccess()

  return access.status === 'approved' ? (
    <SellerDashboard
      exhibitions={[access.exhibition]}
      shoes={await getSellerShoes(access.exhibition._id)}
    />
  ) : (
    <>
      {access.status === 'rejected' && (
        <p
          role="alert"
          className="mx-auto mt-8 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold leading-7 text-rose-800"
        >
          تم رفض طلب تفعيل معرضك من الإدارة. لا يمكنك الوصول إلى لوحة التحكم أو
          إدارة المنتجات. يمكنك تعديل بياناتك وإرسال طلب جديد أدناه.
        </p>
      )}
      <SellerAccessGate />
    </>
  )
}
