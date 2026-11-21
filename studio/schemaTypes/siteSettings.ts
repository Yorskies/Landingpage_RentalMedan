import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'

const stringList = (name: string, title: string, max?: number) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [defineArrayMember({type: 'string'})],
    validation: max ? (rule) => rule.max(max) : undefined,
  })

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Pengaturan Situs',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({name: 'brandName', title: 'Nama Brand', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'whatsappNumber',
      title: 'Nomor WhatsApp Admin (Format: 628xxx)',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(/^62\d{8,13}$/).error('Format harus 628xxxxxxxxx (tanpa +, spasi, atau 0 di depan)'),
    }),
    defineField({name: 'officeAddress', title: 'Alamat Garasi / Kantor Medan', type: 'text', rows: 3}),
    defineField({name: 'operatingHours', title: 'Jam Operasional', type: 'string'}),
    stringList('keyTermsHighlights', 'Poin Penting Syarat (tampil di atas accordion, mis. overtime, deposit)', 4),
    stringList('termsSelfDrive', 'Syarat Sewa Lepas Kunci'),
    stringList('termsWithDriver', 'Ketentuan Sewa Dengan Supir'),
    stringList('cancellationPolicy', 'Kebijakan Pembatalan & Deposit'),
  ],
  preview: {prepare: () => ({title: 'Pengaturan Situs'})},
})
