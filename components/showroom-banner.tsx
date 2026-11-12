/**
 * The top banner of the customer showroom.
 */
export function ShowroomBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-950 text-white">
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 size-72 rounded-full bg-brand-700/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 -bottom-28 size-80 rounded-full bg-accent-500/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-accent-400">
          أشهر المعارض المحليّة في مكان واحد
        </p>
        <h1 className="max-w-3xl text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
          تصفَّح أفخم الأحذية من أشهر المعارض المحليّة
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-100/90 sm:text-lg">
          اختر الفئة والمعرض والمقاس والسعر، واعثر على الحذاء المناسب، وتواصل
          مباشرةً مع العارض لإتمام عملية الشراء.
        </p>
      </div>
    </section>
  )
}
