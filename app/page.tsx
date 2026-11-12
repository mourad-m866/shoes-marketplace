import { Showroom } from '@/components/showroom'
import { ShowroomBanner } from '@/components/showroom-banner'
import { SiteHeader } from '@/components/site-header'
import { getExhibitions, getShoes } from '@/sanity/lib/data'

export const metadata = {
  title: 'معرض الزبون',
}

export default async function HomePage() {
  const [shoes, exhibitions] = await Promise.all([getShoes(), getExhibitions()])

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="flex-1">
        <ShowroomBanner />
        <Showroom shoes={shoes} exhibitions={exhibitions} />
      </main>
    </div>
  )
}
