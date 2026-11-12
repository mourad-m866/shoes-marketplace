import { Suspense } from 'react'

import { SellerDashboard } from '@/components/seller/seller-dashboard'
import { SellerAccessGate } from '@/components/seller/seller-access-gate'
import { SiteHeader } from '@/components/site-header'
import { getApprovedSellerExhibition } from '@/lib/seller-session'
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
  const exhibition = await getApprovedSellerExhibition()

  return exhibition ? (
    <SellerDashboard
      exhibitions={[exhibition]}
      shoes={await getSellerShoes(exhibition._id)}
    />
  ) : (
    <SellerAccessGate />
  )
}
