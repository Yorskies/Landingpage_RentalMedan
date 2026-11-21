import {defineField, defineType, type NumberRule} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'

// At least one of the two prices must be set (a unit may be offered with one package only)
const needsOnePrice = (other: 'priceSelfDrive' | 'priceWithDriver') => (rule: NumberRule) =>
  rule.min(0).custom((value, context) =>
    value == null && (context.document as Record<string, unknown> | undefined)?.[other] == null
      ? 'Isi minimal satu harga (Lepas Kunci atau Dengan Supir)'
      : true,
  )

export const car = defineType({
  name: 'car',
  title: 'Armada Mobil',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({name: 'name', title: 'Nama Mobil', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}}),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      options: {list: ['City Car', 'MPV Keluarga', 'SUV Premium', 'Minibus']},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Foto Armada',
      description: 'Foto landscape 4:3, minimal 1200px lebar',
      type: 'image',
      options: {hotspot: true},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'imageAlt',
      title: 'Deskripsi Foto (untuk SEO & aksesibilitas)',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'isAvailable', title: 'Status Tersedia', type: 'boolean', initialValue: true}),
    defineField({name: 'isFeatured', title: 'Tampilkan Badge Favorit', type: 'boolean', initialValue: false}),
    defineField({
      name: 'priceSelfDrive',
      title: 'Harga Lepas Kunci (Rp / Hari)',
      description: 'Kosongkan jika unit ini tidak disewakan lepas kunci',
      type: 'number',
      validation: needsOnePrice('priceWithDriver'),
    }),
    defineField({
      name: 'priceWithDriver',
      title: 'Harga Dengan Supir (Rp / Hari)',
      description: 'Kosongkan jika unit ini tidak disewakan dengan supir',
      type: 'number',
      validation: needsOnePrice('priceSelfDrive'),
    }),
    defineField({
      name: 'transmission',
      title: 'Transmisi',
      type: 'string',
      options: {list: ['Automatic (AT)', 'Manual (MT)', 'AT / MT']},
    }),
    defineField({name: 'fuelType', title: 'Bahan Bakar', type: 'string', options: {list: ['Bensin', 'Diesel', 'Hybrid']}}),
    defineField({name: 'seats', title: 'Kapasitas Kursi', type: 'number', validation: (rule) => rule.required().min(1)}),
    defineField({
      name: 'driverNote',
      title: 'Catatan Paket Supir',
      type: 'string',
      initialValue: 'Termasuk supir 12 jam, belum termasuk BBM & Tol',
    }),
    defineField({
      name: 'selfDriveNote',
      title: 'Catatan Lepas Kunci',
      type: 'string',
      initialValue: 'Sewa 24 jam, syarat & ketentuan berlaku',
    }),
    defineField({
      name: 'orderRank',
      title: 'Urutan Tampil (Angka kecil tampil duluan)',
      type: 'number',
      initialValue: 10,
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'category', media: 'image'}},
})
