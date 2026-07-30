// Acceptance criteria tests for the gameShelf clean-slate state.
// Runs via `npm test`.

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const root = dirname(__filename)

let passed = 0
let failed = 0

function assert(condition, label) {
  if (condition) {
    passed++
  } else {
    failed++
    console.error(`FAIL: ${label}`)
  }
}

// --- Removals ---

// 1. All game files in games/ removed
const gamesDir = join(root, 'games')
const gameHtmlFiles = readdirSync(gamesDir).filter(f => f.endsWith('.html'))
assert(gameHtmlFiles.length === 0, 'No .html files in games/')

// 2. games/ directory exists but is empty (no .html files)
assert(existsSync(gamesDir), 'games/ directory exists')

// 3. repo/ directory removed
assert(!existsSync(join(root, 'repo')), 'repo/ directory does not exist')

// 4. about.html removed
assert(!existsSync(join(root, 'about.html')), 'about.html does not exist')

// 5. Vue.js src/ directory removed
assert(!existsSync(join(root, 'src')), 'src/ directory does not exist')

// 6. vite.config.js removed
assert(!existsSync(join(root, 'vite.config.js')), 'vite.config.js does not exist')

// 7. package-lock.json removed
assert(!existsSync(join(root, 'package-lock.json')), 'package-lock.json does not exist')

// 8. No test files (test-*.sh, test-*.js, tests/*.cjs)
const testFiles = []
for (const entry of readdirSync(root)) {
  if (entry.startsWith('test-') && (entry.endsWith('.sh') || entry.endsWith('.js'))) {
    testFiles.push(entry)
  }
}
assert(testFiles.length === 0, 'No test-*.sh or test-*.js files in root')

// --- index.html content ---

const indexHtml = readFileSync(join(root, 'index.html'), 'utf-8')

assert(indexHtml.includes('<title>gameShelf</title>'), 'index.html has <title>gameShelf</title>')
assert(indexHtml.includes("gameShelf"), 'index.html has gameShelf branding')
assert(indexHtml.includes('hero'), 'index.html has hero section')
assert(indexHtml.includes("What's New"), 'index.html has What\'s New section')
assert(indexHtml.includes("coming soon") || indexHtml.includes("Coming soon") || indexHtml.includes("Coming Soon"), 'What\'s New shows Coming Soon placeholder')

// No game cards, carousel, search, filter, or random button
assert(!indexHtml.includes('game-card'), 'index.html has no game-card references')
assert(!indexHtml.includes('carousel'), 'index.html has no carousel references')
assert(!indexHtml.includes('search'), 'index.html has no search references')
assert(!indexHtml.includes('filter'), 'index.html has no filter references')
assert(!indexHtml.includes('games-grid'), 'index.html has no games-grid class')

// Footer with exact required text
assert(indexHtml.includes('All games built in browser — no downloads required'), 'Footer contains required text')

// --- styles.css content ---

const stylesCss = readFileSync(join(root, 'styles.css'), 'utf-8')

assert(stylesCss.includes('#0f0f23') || stylesCss.includes('#0f0f23'), 'styles.css has dark background')
assert(stylesCss.includes('color') && stylesCss.match(/color:\s*#\w/), 'styles.css has light text')
assert(stylesCss.includes('sticky'), 'styles.css has sticky header')
assert(stylesCss.includes('responsive') || stylesCss.includes('@media'), 'styles.css has responsive layout')

// No game-card, carousel, filter styles
assert(!stylesCss.includes('game-card'), 'styles.css has no game-card styles')
assert(!stylesCss.includes('carousel'), 'styles.css has no carousel styles')
assert(!stylesCss.includes('.filter'), 'styles.css has no filter styles')
assert(!stylesCss.includes('search'), 'styles.css has no search styles')

// --- script.js content ---

const scriptJs = readFileSync(join(root, 'script.js'), 'utf-8')

// Should be minimal — no game list, search, filter, carousel logic
assert(!scriptJs.includes('gameList') && !scriptJs.includes('filter'), 'script.js has no game list generation')
assert(!scriptJs.includes('search') && !scriptJs.includes('filter'), 'script.js has no search/filter logic')
assert(!scriptJs.includes('carousel'), 'script.js has no carousel logic')
assert(!scriptJs.includes('addEventListener'), 'script.js has no event listeners (or minimal stub)')

// --- package.json content ---

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))

assert(pkg.name === 'gameShelf', 'package.json name is "gameShelf"')
assert(pkg.description === 'A collection of browser-based games', 'package.json description is correct')
assert(pkg.type === 'module', 'package.json type is "module"')
assert(!pkg.dependencies, 'package.json has no dependencies')
assert(!pkg.devDependencies, 'package.json has no devDependencies')

// No Vue-related entries
assert(!pkg.name.includes('vue'), 'no Vue references in package.json')
assert(!JSON.stringify(pkg).includes('vite'), 'no Vite in package.json')

// --- .gitignore ---

const gitignore = readFileSync(join(root, '.gitignore'), 'utf-8')
assert(gitignore.includes('node_modules/'), '.gitignore includes node_modules/')

// --- AGENTS.md ---

const agentsMd = readFileSync(join(root, 'AGENTS.md'), 'utf-8')
assert(agentsMd.includes('Project Goal'), 'AGENTS.md has Project Goal section')
assert(agentsMd.includes('Adding a New Game'), 'AGENTS.md has Adding a New Game section')
assert(agentsMd.includes('Registering the Game'), 'AGENTS.md has Registering the Game section')
assert(agentsMd.includes('Known Issues'), 'AGENTS.md has Known Issues section')
assert(agentsMd.includes('node_modules/'), 'AGENTS.md mentions node_modules/ issue')
assert(agentsMd.includes('footer'), 'AGENTS.md mentions footer styling')

// --- README.md ---

const readme = readFileSync(join(root, 'README.md'), 'utf-8')
assert(readme.includes('gameShelf'), 'README.md mentions gameShelf')
assert(readme.includes('Getting Started'), 'README.md has Getting Started section')

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
