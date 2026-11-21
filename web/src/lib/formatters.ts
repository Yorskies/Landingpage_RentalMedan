export type PackageType = 'lepas_kunci' | 'dengan_supir'

/** 550000 -> "Rp 550.000" (dot thousands separator, no ICU dependency) */
export function formatIDR(amount: number): string {
  return `Rp ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
}

/** wa.me link with a URL-encoded message. Phone must be digits in 62xxx format. */
export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

/** Lowest daily price across both packages, or null when no car has a price. */
export function getMinPrice(cars: { priceSelfDrive?: number | null; priceWithDriver?: number | null }[]): number | null {
  const prices = cars.flatMap((c) => [c.priceSelfDrive, c.priceWithDriver]).filter((p): p is number => typeof p === 'number' && p > 0)
  return prices.length ? Math.min(...prices) : null
}

export const PACKAGE_LABEL: Record<PackageType, string> = { lepas_kunci: 'Lepas Kunci', dengan_supir: 'Dengan Supir' }

/** Pre-filled WhatsApp message for a catalog car; asks about the schedule when the unit is rented out. */
export function buildCarMessage(name: string, pkg: PackageType, price: number, isAvailable: boolean): string {
  const unit = `${name} (Paket ${PACKAGE_LABEL[pkg]} - ${formatIDR(price)}/hari)`
  return isAvailable
    ? `Halo Admin, saya melihat dari website. Apakah unit ${unit} tersedia untuk disewa?`
    : `Halo Admin, saya melihat dari website. Kapan unit ${unit} tersedia kembali untuk disewa?`
}
