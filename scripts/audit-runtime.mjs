import { copyFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const manifestPath = resolve(process.argv[2] || '.output/server/package.json')

if (!existsSync(manifestPath)) {
  console.error(`Runtime manifest not found: ${manifestPath}`)
  console.error('Run npm run build before auditing the production runtime.')
  process.exit(1)
}

const auditDirectory = mkdtempSync(join(tmpdir(), 'ssu-runtime-audit-'))

const runNpm = (args) => {
  const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd: auditDirectory,
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) {
    throw result.error
  }

  return result.status ?? 1
}

try {
  copyFileSync(manifestPath, join(auditDirectory, basename(manifestPath)))

  console.log(`Auditing generated runtime manifest: ${manifestPath}`)

  const lockStatus = runNpm([
    'install',
    '--package-lock-only',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
  ])

  if (lockStatus !== 0) {
    process.exitCode = lockStatus
  } else {
    process.exitCode = runNpm(['audit', '--omit=dev'])
  }
} finally {
  rmSync(auditDirectory, { recursive: true, force: true })
}
