'use client'

import { useMemo, useState } from 'react'

import { ShoeCard } from '@/components/shoe-card'
import { ALL_CATEGORIES, CATEGORY_FILTERS, formatPrice } from '@/lib/constants'
import type { Exhibition, Shoe } from '@/lib/types'

interface ShowroomProps {
  shoes: Shoe[]
  exhibitions: Exhibition[]
}

interface PriceRange {
  min: number
  max: number
}

export function Showroom({shoes, exhibitions}: ShowroomProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)
  const [exhibitionId, setExhibitionId] = useState<string>('all')
  const [size, setSize] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<PriceRange>({min: 0, max: 0})

  const bounds = useMemo<PriceRange>(() => {
    if (shoes.length === 0) return {min: 0, max: 0}

    const prices = shoes.map((shoe) => shoe.price)
    const min = Math.floor(Math.min(...prices))
    const max = Math.ceil(Math.max(...prices))

    return {min, max}
  }, [shoes])

  const activeRange = useMemo<PriceRange>(
    () => ({
      min: priceRange.max === 0 ? bounds.min : priceRange.min,
      max: priceRange.max === 0 ? bounds.max : priceRange.max,
    }),
    [bounds, priceRange],
  )

  const availableSizes = useMemo(() => {
    const unique = new Set<number>()
    for (const shoe of shoes) {
      for (const shoeSize of shoe.sizes ?? []) unique.add(shoeSize)
    }

    return [...unique].sort((a, b) => a - b)
  }, [shoes])

  const filteredShoes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return shoes.filter((shoe) => {
      if (category !== ALL_CATEGORIES && shoe.category !== category) {
        return false
      }

      if (exhibitionId !== 'all' && shoe.exhibitionId !== exhibitionId) {
        return false
      }

      if (size !== 'all' && !(shoe.sizes ?? []).includes(Number(size))) {
        return false
      }

      if (shoe.price < activeRange.min || shoe.price > activeRange.max) {
        return false
      }

      if (normalizedQuery) {
        const haystack = [
          shoe.title,
          shoe.category,
          shoe.exhibitionName ?? '',
          shoe.exhibitionCity ?? '',
        ]
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(normalizedQuery)) return false
      }

      return true
    })
  }, [activeRange, category, exhibitionId, query, shoes, size])

  const hasActiveFilters =
    query !== '' ||
    category !== ALL_CATEGORIES ||
    exhibitionId !== 'all' ||
    size !== 'all' ||
    activeRange.min !== bounds.min ||
    activeRange.max !== bounds.max

  function resetFilters() {
    setQuery('')
    setCategory(ALL_CATEGORIES)
    setExhibitionId('all')
    setSize('all')
    setPriceRange({min: 0, max: 0})
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <label
                htmlFor="shoe-search"
                className="mb-1.5 block text-sm font-semibold text-brand-800"
              >
                البحث بالاسم
              </label>
              <input
                id="shoe-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث عن حذاء أو معرض…"
                className="w-full rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
              <div>
                <label
                  htmlFor="exhibition-filter"
                  className="mb-1.5 block text-sm font-semibold text-brand-800"
                >
                  المعرض
                </label>
                <select
                  id="exhibition-filter"
                  value={exhibitionId}
                  onChange={(event) => setExhibitionId(event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 lg:w-56"
                >
                  <option value="all">كل المعارض</option>
                  {exhibitions.map((exhibition) => (
                    <option key={exhibition._id} value={exhibition._id}>
                      {exhibition.storeName} — {exhibition.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="size-filter"
                  className="mb-1.5 block text-sm font-semibold text-brand-800"
                >
                  المقاس
                </label>
                <select
                  id="size-filter"
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 lg:w-40"
                >
                  <option value="all">كل المقاسات</option>
                  {availableSizes.map((availableSize) => (
                    <option key={availableSize} value={availableSize}>
                      {availableSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-brand-800">
              الفئة
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_FILTERS.map((filterCategory) => {
                const isActive = category === filterCategory

                return (
                  <button
                    key={filterCategory}
                    type="button"
                    onClick={() => setCategory(filterCategory)}
                    aria-pressed={isActive}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brand-900 text-white shadow-sm'
                        : 'border border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50'
                    }`}
                  >
                    {filterCategory}
                  </button>
                )
              })}
            </div>
          </div>

          <PriceRangeFilter
            bounds={bounds}
            value={activeRange}
            onChange={setPriceRange}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-brand-700">
          عدد النتائج:{' '}
          <span className="text-brand-950">{filteredShoes.length}</span> من{' '}
          <span className="text-brand-950">{shoes.length}</span>
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
          >
            إعادة ضبط عوامل التصفية
          </button>
        )}
      </div>

      {filteredShoes.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-brand-200 bg-white p-12 text-center">
          <p className="text-lg font-bold text-brand-900">
            لا توجد أحذية مطابقة لعوامل التصفية
          </p>
          <p className="mt-2 text-sm text-brand-500">
            جرّب توسيع نطاق السعر أو اختيار فئة أخرى.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredShoes.map((shoe) => (
            <ShoeCard key={shoe._id} shoe={shoe} />
          ))}
        </div>
      )}
    </section>
  )
}

interface PriceRangeFilterProps {
  bounds: PriceRange
  value: PriceRange
  onChange: (range: PriceRange) => void
}

/**
 * Dual-handle price range slider.
 *
 * The two native `<input type="range">` elements are stacked on top of a
 * custom track. The layout is RTL, so the lower bound sits on the right and
 * the fill is positioned from the right edge.
 */
function PriceRangeFilter({bounds, value, onChange}: PriceRangeFilterProps) {
  const {min, max} = bounds
  const span = max - min || 1

  if (max === 0) {
    return null
  }

  const lowFraction = (value.min - min) / span
  const highFraction = (value.max - min) / span

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-brand-800">السعر</span>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          {formatPrice(value.min)} — {formatPrice(value.max)}
        </span>
      </div>

      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-100" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-600"
          style={{
            right: `${lowFraction * 100}%`,
            width: `${(highFraction - lowFraction) * 100}%`,
          }}
        />

        <input
          type="range"
          aria-label="أقل سعر"
          min={min}
          max={max}
          step={1}
          value={value.min}
          onChange={(event) => {
            const nextMin = Math.min(
              Number(event.target.value),
              value.max,
            )
            onChange({min: nextMin, max: value.max})
          }}
          className="range-slider absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2"
          style={{zIndex: value.min > min ? 4 : 5}}
        />

        <input
          type="range"
          aria-label="أعلى سعر"
          min={min}
          max={max}
          step={1}
          value={value.max}
          onChange={(event) => {
            const nextMax = Math.max(
              Number(event.target.value),
              value.min,
            )
            onChange({min: value.min, max: nextMax})
          }}
          className="range-slider absolute inset-x-0 top-1/2 h-6 w-full -translate-y-1/2"
          style={{zIndex: 5}}
        />
      </div>
    </div>
  )
}
