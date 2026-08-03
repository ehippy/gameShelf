import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const catalogPath = path.join(repoRoot, 'src/data/gamesCatalog.js')

const gamesDir = path.join(repoRoot, 'src/games')
const testsDir = path.join(repoRoot, 'tests/games')

async function main() {
  // --- Load catalog ---
  const catalogUrl = pathToFileURL(catalogPath)
  const catalog = (await import(catalogUrl)).default

  if (!catalog || !Array.isArray(catalog)) {
    console.error('Error: could not load gamesCatalog.js')
    process.exit(2)
  }

  // --- Validate argument ---
  const slug = process.argv[2]

  if (!slug) {
    console.log('Usage: node scripts/verify-game-exists.js <slug>')
    console.log('')
    console.log('Valid slugs:')
    for (const entry of catalog) {
      console.log(`  - ${entry.slug} (${entry.title})`)
    }
    process.exit(2)
  }

  const game = catalog.find(entry => entry.slug === slug)

  if (!game) {
    console.log(`Usage: node scripts/verify-game-exists.js <slug>`)
    console.log('')
    console.log(`"${slug}" is not a valid game slug.`)
    console.log('')
    console.log('Valid slugs:')
    for (const entry of catalog) {
      console.log(`  - ${entry.slug} (${entry.title})`)
    }
    process.exit(2)
  }

  // --- Check existence ---
  const gameDir = path.join(gamesDir, slug)
  const testFile = path.join(testsDir, `${slug}.test.js`)

  const dirExists = fs.existsSync(gameDir) && fs.statSync(gameDir).isDirectory()
  const testExists = fs.existsSync(testFile)

  if (dirExists && testExists) {
    // Exit 0 — fully implemented
    console.log(`✅ Game "${game.title}" (${slug}) is fully implemented.`)
    console.log(`   src/games/${slug}/`)
    for (const f of listFiles(gameDir, slug)) {
      console.log(`   ${f}`)
    }
    console.log(`   tests/games/${slug}.test.js (${formatBytes(fs.statSync(testFile).size)})`)
    process.exit(0)
  }

  // Exit 1 — partially implemented
  console.log(`⚠️  Game "${game.title}" (${slug}) is partially implemented.`)
  if (!dirExists) {
    console.log(`   Missing: src/games/${slug}/`)
  }
  if (!testExists) {
    console.log(`   Missing: tests/games/${slug}.test.js`)
  }
  process.exit(1)
}

function formatBytes(bytes) {
  return `${bytes} byte${bytes !== 1 ? 's' : ''}`
}

/**
 * Recursively list files in a directory, returning their relative paths and sizes.
 * Paths are relative to src/games/<slug>/ (e.g. "gameLogic.js" or "utils/helper.js").
 */
function listFiles(dir) {
  const lines = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      lines.push(...listFiles(fullPath))
    } else {
      const rel = path.relative(dir, fullPath)
      lines.push(`${rel} (${formatBytes(fs.statSync(fullPath).size)})`)
    }
  }
  return lines
}

main()
