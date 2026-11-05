import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { pathToFileURL } from 'node:url'

const assetDirectory = resolve(process.argv[2] || '.output/public/_nuxt')
const manifestPath = resolve(process.argv[3] || '.nuxt/dist/server/client.manifest.mjs')
const rawBudget = 180 * 1024
const gzipBudget = 60 * 1024
const themeEntries = {
  'service-studio': [
    'themes/service-studio/ServiceStudioShell.vue',
    'themes/service-studio/ServiceStudioPageFrame.vue',
  ],
  'informational-editorial': [
    'themes/informational-editorial/InformationalEditorialShell.vue',
    'themes/informational-editorial/InformationalEditorialPageFrame.vue',
  ],
  'commerce-market': [
    'themes/commerce-market/CommerceMarketShell.vue',
    'themes/commerce-market/CommerceMarketPageFrame.vue',
  ],
}

if (!existsSync(assetDirectory) || !existsSync(manifestPath)) {
  console.error(`Theme build inputs not found: ${assetDirectory} and ${manifestPath}`)
  console.error('Build the production artifact before checking theme bundle budgets, then pass its asset directory and client manifest.')
  process.exit(1)
}

const files = new Map(readdirSync(assetDirectory)
  .filter(file => /\.(?:css|js|mjs)$/.test(file))
  .map(file => ({ file, path: resolve(assetDirectory, file) }))
  .filter(asset => statSync(asset.path).isFile())
  .map(asset => [asset.file, asset]))
const manifest = (await import(`${pathToFileURL(manifestPath).href}?theme-budget=${Date.now()}`)).default

let failed = false
for (const [theme, entries] of Object.entries(themeEntries)) {
  const assetNames = new Set()
  for (const entry of entries) {
    const chunk = manifest[entry]
    if (!chunk?.isDynamicEntry || !chunk.file) {
      console.error(`${theme}: ${entry} is not a lazy-loaded client entry`)
      failed = true
      continue
    }
    assetNames.add(chunk.file)
    for (const css of chunk.css ?? []) assetNames.add(css)
  }

  const assets = [...assetNames].map(name => files.get(name)).filter(Boolean)
  if (assets.length !== assetNames.size) {
    console.error(`${theme}: one or more manifest assets are missing from the production output`)
    failed = true
    continue
  }

  const rawBytes = assets.reduce((total, asset) => total + statSync(asset.path).size, 0)
  const gzipBytes = assets.reduce((total, asset) => total + gzipSync(readFileSync(asset.path)).byteLength, 0)
  const summary = assets.map(asset => asset.file).join(', ')
  console.log(`${theme}: ${(rawBytes / 1024).toFixed(1)} KiB raw, ${(gzipBytes / 1024).toFixed(1)} KiB gzip (${summary})`)

  if (rawBytes > rawBudget || gzipBytes > gzipBudget) {
    console.error(`${theme}: exceeds the ${rawBudget / 1024} KiB raw / ${gzipBudget / 1024} KiB gzip budget`)
    failed = true
  }
}

if (failed) process.exit(1)
