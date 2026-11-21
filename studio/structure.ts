import {CogIcon} from '@sanity/icons/Cog'
import type {StructureResolver} from 'sanity/structure'

const SINGLETONS = ['siteSettings']

// Singleton = fixed document ID in Structure (the schema has no such option)
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Konten Website')
    .items([
      S.listItem()
        .title('Pengaturan Situs')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Pengaturan Situs')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => !SINGLETONS.includes(item.getId() as string)),
    ])
