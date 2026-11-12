'use client'

import { useMemo, useState } from 'react'

import { ExhibitionInfoCard } from '@/components/seller/exhibition-info-card'
import { ExhibitionSelect } from '@/components/seller/exhibition-select'
import { ShoeFormModal } from '@/components/seller/shoe-form-modal'
import { ShoesTable } from '@/components/seller/shoes-table'
import type { Exhibition, Shoe } from '@/lib/types'

interface SellerDashboardProps {
  exhibitions: Exhibition[]
  shoes: Shoe[]
}

/**
 * The seller (البائع) control panel: pick the exhibition you manage, review
 * its info card, add new shoes and edit or delete the existing ones.
 */
export function SellerDashboard({exhibitions, shoes}: SellerDashboardProps) {
  const [selectedId, setSelectedId] = useState<string>(
    () => exhibitions[0]?._id ?? '',
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null)

  const selectedExhibition = useMemo(
    () => exhibitions.find((exhibition) => exhibition._id === selectedId),
    [exhibitions, selectedId],
  )

  const exhibitionShoes = useMemo(
    () => shoes.filter((shoe) => shoe.exhibitionId === selectedId),
    [selectedId, shoes],
  )

  function openCreateModal() {
    setEditingShoe(null)
    setIsModalOpen(true)
  }

  function openEditModal(shoe: Shoe) {
    setEditingShoe(shoe)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingShoe(null)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-950 sm:text-3xl">
            لوحة العارض (البائع)
          </h1>
          <p className="mt-2 text-sm text-brand-600">
            أدر معروضاتك، أضف أحذية جديدة، وحذّف ما لم تعد تعرضه.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={exhibitions.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          إضافة حذاء جديد للمعرض
        </button>
      </div>

      <div className="mt-6">
        <ExhibitionSelect
          exhibitions={exhibitions}
          selectedId={selectedId}
          onChange={setSelectedId}
        />
      </div>

      <div className="mt-6">
        <ExhibitionInfoCard exhibition={selectedExhibition} />
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-brand-950">
            الأحذية المعروضة
            {selectedExhibition ? ` — ${selectedExhibition.storeName}` : ''}
          </h2>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            {exhibitionShoes.length} منتج
          </span>
        </div>

        <ShoesTable shoes={exhibitionShoes} onEdit={openEditModal} />
      </div>

      <ShoeFormModal
        open={isModalOpen}
        onClose={closeModal}
        exhibitions={exhibitions}
        editingShoe={editingShoe}
      />
    </section>
  )
}
