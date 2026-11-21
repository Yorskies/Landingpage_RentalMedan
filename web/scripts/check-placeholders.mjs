// Go-live gate: fails if the built site still contains Stitch/mock placeholder content (plan §2.3, §5).
// Usage: npm run build && npm run check:placeholders
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const FORBIDDEN = [
  '12 Unit', '4.9/5', '8116543210', '81234567890', 'PT Medan Drive VIP', // invented by the Stitch drafts
  '6280000000000', '(contoh)', '(Contoh)', 'FOTO CONTOH', 'Pelanggan Contoh', '/mock/', // built-in mock data
]

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? htmlFiles(p) : p.endsWith('.html') ? [p] : []
  })

const hits = htmlFiles('dist').flatMap((file) => {
  const html = readFileSync(file, 'utf8')
  return FORBIDDEN.filter((p) => html.includes(p)).map((p) => `${file}: "${p}"`)
})

if (hits.length) {
  console.error(`Placeholder content found in build:\n  ${hits.join('\n  ')}\nSet PUBLIC_USE_MOCK_DATA=false and fill Sanity before going live.`)
  process.exit(1)
}
console.log('OK: no placeholder content in dist/')
