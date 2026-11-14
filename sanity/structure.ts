import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('المحتوى')
    .items([
      S.listItem()
        .title('المعارض')
        .child(
          S.documentTypeList('exhibition').title('المعارض'),
        ),
      S.divider(),
      S.documentTypeListItem('shoe').title('الأحذية'),
      S.documentTypeListItem('activationRequest').title('طلبات تحتاج التفعيل'),
    ])
