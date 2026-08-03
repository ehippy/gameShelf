#!/usr/bin/env node

import fs, { readFileSync } from 'node:fs'
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

  const slugs = catalog.map(entry => ({
    slug: entry.slug,
    title: entry.title
  }))

  // --- Validate argument ---
  const slug = process.argv[2]

  if (!slug) {
    console.log('Usage: node scripts/verify-game-exists.js <slug>')
    console.log('')
    console.log('Valid slugs:')
    for (const entry of slugs) {
      console.log(`  - ${entry.slug} (${entry.title})`)
    }
    process.exit(2)
  }

  const game = slugs.find(entry => entry.slug === slug)

  if (!game) {
    console.log(`Error: "${slug}" is not a valid game slug.`)
    console.log('')
    console.log('Valid slugs:')
    for (const entry of slugs) {
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
    const dirSize = getDirSize(gameDir)
    const testSize = fs.statSync(testFile).size
    console.log(`✅ Game "${game.title}" (${slug}) is fully implemented.`)
    console.log(`   ${gameDir}/         (${formatBytes(dirSize)})`)
    console.log(`   ${testFile}  (${formatBytes(testSize)})`)
    process.exit(0)
  }

  // Exit 1 — partially implemented
  console.log(`⚠️  Game "${game.title}" (${slug}) is partially implemented.`)
  if (!dirExists) {
    console.log(`   Missing: ${gameDir}/`)
  }
  if (!testExists) {
    console.log(`   Missing: ${testFile}`)
  }
  process.exit(1)
}

function formatBytes(bytes) {
  return `${bytes} byte${bytes === 1 ? '' : 's'}`
}

function getDirSize(dir) {
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      total += getDirSize(fullPath)
    } else {
      total += fs.statSync(fullPath).size
    }
  }
  return total
}

main()
