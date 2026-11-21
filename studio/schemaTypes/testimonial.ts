import {defineField, defineType} from 'sanity'
import {CommentIcon} from '@sanity/icons/Comment'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimoni',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({name: 'name', title: 'Nama', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'role', title: 'Profesi / Asal Kota', type: 'string'}),
    defineField({name: 'quote', title: 'Isi Testimoni', type: 'text', rows: 4, validation: (rule) => rule.required().max(280)}),
    defineField({name: 'rating', title: 'Rating', type: 'number', initialValue: 5, validation: (rule) => rule.required().integer().min(1).max(5)}),
    defineField({name: 'orderRank', title: 'Urutan Tampil', type: 'number', initialValue: 10}),
  ],
  preview: {select: {title: 'name', subtitle: 'role'}},
})
