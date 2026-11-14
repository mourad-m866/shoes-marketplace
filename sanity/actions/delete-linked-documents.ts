'use client'

import {useState} from 'react'
import {useToast} from '@sanity/ui/toast'
import {
  useClient,
  type DocumentActionComponent,
  type DocumentActionProps,
} from 'sanity'

import {apiVersion} from '../env'

type DeletableType = 'activationRequest' | 'exhibition'

function useDeleteLinkedDocuments(
  props: DocumentActionProps,
  documentType: DeletableType,
) {
  const client = useClient({apiVersion}).withConfig({
    perspective: 'raw',
    useCdn: false,
  })
  const toast = useToast()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const documentId = props.id.replace(/^drafts\./, '')
  const isExhibition = documentType === 'exhibition'

  async function deleteDocumentAndLinkedRecords() {
    setIsConfirmOpen(false)
    setIsDeleting(true)

    try {
      const targetIds = await client.fetch<string[]>(
        '*[_id in $ids]._id',
        {ids: [documentId, `drafts.${documentId}`]},
      )
      const transaction = client.transaction()

      if (isExhibition) {
        const shoeIds = await client.fetch<string[]>(
          '*[_type == "shoe" && exhibition._ref == $exhibitionId]._id',
          {exhibitionId: documentId},
        )
        const activationRequestIds = await client.fetch<string[]>(
          '*[_type == "activationRequest" && exhibition._ref == $exhibitionId]._id',
          {exhibitionId: documentId},
        )

        for (const id of shoeIds) transaction.delete(id)
        for (const id of activationRequestIds) {
          transaction.patch(id, {unset: ['exhibition']})
        }
      } else {
        const exhibitionIds = await client.fetch<string[]>(
          '*[_type == "exhibition" && activationRequest._ref == $requestId]._id',
          {requestId: documentId},
        )

        for (const id of exhibitionIds) {
          transaction.patch(id, {unset: ['activationRequest']})
        }
      }

      for (const id of targetIds) transaction.delete(id)
      await transaction.commit()
      toast.push({
        status: 'success',
        title: isExhibition ? 'تم حذف المعرض وأحذيته' : 'تم حذف طلب التفعيل',
      })
      props.onComplete()
    } catch (cause) {
      console.error(`[delete${documentType}] failed`, cause)
      toast.push({
        status: 'error',
        title: 'تعذّر حذف المستند',
        description:
          cause instanceof Error
            ? cause.message
            : 'حدث خطأ غير متوقع أثناء الحذف. يرجى المحاولة مرة أخرى.',
        duration: 10000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    label: isExhibition ? 'حذف المعرض وأحذيته' : 'حذف طلب التفعيل',
    title: isDeleting ? 'جارٍ الحذف…' : undefined,
    tone: 'critical' as const,
    disabled: isDeleting || (!props.draft && !props.published),
    onHandle: () => setIsConfirmOpen(true),
    dialog: isConfirmOpen
      ? {
          type: 'confirm' as const,
          tone: 'critical' as const,
          message: isExhibition
            ? 'سيتم حذف المعرض وجميع الأحذية المرتبطة به، مع فك ارتباط طلب التفعيل إن وجد. لا يمكن التراجع عن هذا الإجراء.'
            : 'سيتم حذف طلب التفعيل وفك ارتباطه بالمعرض إن وجد. لن يُحذف المعرض.',
          confirmButtonText: isExhibition ? 'حذف المعرض والأحذية' : 'حذف الطلب',
          onConfirm: deleteDocumentAndLinkedRecords,
          onCancel: () => setIsConfirmOpen(false),
        }
      : (false as const),
  }
}

export const DeleteExhibitionAction: DocumentActionComponent = (props) =>
  useDeleteLinkedDocuments(props, 'exhibition')

export const DeleteActivationRequestAction: DocumentActionComponent = (props) =>
  useDeleteLinkedDocuments(props, 'activationRequest')

DeleteExhibitionAction.action = 'delete'
DeleteActivationRequestAction.action = 'delete'
