// Acceptance criteria tests for the Vue 3 + Vite + Router + Pinia scaffold.
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

// --- Directory structure ---

assert(existsSync(join(root, 'src')), 'src/ directory exists')
assert(existsSync(join(root, 'src', 'main.js')), 'src/main.js exists')
assert(existsSync(join(root, 'src', 'App.vue')), 'src/App.vue exists')
assert(existsSync(join(root, 'vite.config.js')), 'vite.config.js exists')
assert(existsSync(join(root, 'src', 'router', 'index.js')), 'src/router/index.js exists')
assert(existsSync(join(root, 'src', 'assets', 'styles.css')), 'src/assets/styles.css exists')

// --- Stores ---

assert(existsSync(join(root, 'src', 'stores', 'gameStore.js')), 'src/stores/gameStore.js exists')
assert(existsSync(join(root, 'src', 'stores', 'scoreStore.js')), 'src/stores/scoreStore.js exists')
assert(existsSync(join(root, 'src', 'stores', 'userStore.js')), 'src/stores/userStore.js exists')

// --- Views ---

assert(existsSync(join(root, 'src', 'views', 'HomeView.vue')), 'src/views/HomeView.vue exists')
assert(existsSync(join(root, 'src', 'views', 'AboutView.vue')), 'src/views/AboutView.vue exists')
assert(existsSync(join(root, 'src', 'views', 'GamePage.vue')), 'src/views/GamePage.vue exists')
assert(existsSync(join(root, 'src', 'views', 'HighScoresView.vue')), 'src/views/HighScoresView.vue exists')
assert(existsSync(join(root, 'src', 'views', 'NotFoundView.vue')), 'src/views/NotFoundView.vue exists')

// --- Components ---

assert(existsSync(join(root, 'src', 'components', 'AppHeader.vue')), 'src/components/AppHeader.vue exists')
assert(existsSync(join(root, 'src', 'components', 'AppFooter.vue')), 'src/components/AppFooter.vue exists')

// --- Game stubs ---

assert(existsSync(join(root, 'src', 'games', 'snake', 'gameLogic.js')), 'src/games/snake/gameLogic.js exists')
assert(existsSync(join(root, 'src', 'games', 'tetris', 'gameLogic.js')), 'src/games/tetris/gameLogic.js exists')
assert(existsSync(join(root, 'src', 'games', 'breakout', 'gameLogic.js')), 'src/games/breakout/gameLogic.js exists')

// --- Data ---

assert(existsSync(join(root, 'src', 'data', 'gamesCatalog.js')), 'src/data/gamesCatalog.js exists')
const catalog = readFileSync(join(root, 'src', 'data', 'gamesCatalog.js'), 'utf-8')
assert(catalog.includes("id: 'snake'"), 'gamesCatalog.js has snake entry')
assert(catalog.includes("id: 'tetris'"), 'gamesCatalog.js has tetris entry')
assert(catalog.includes("id: 'breakout'"), 'gamesCatalog.js has breakout entry')

// --- index.html is Vite entry point ---

const indexHtml = readFileSync(join(root, 'index.html'), 'utf-8')
assert(indexHtml.includes('<!DOCTYPE html>'), 'index.html has HTML5 doctype')
assert(indexHtml.includes("lang=\"en\""), 'index.html has lang="en"')
assert(indexHtml.includes('<title>gameShelf</title>'), 'index.html has <title>gameShelf</title>')
assert(indexHtml.includes('<div id="app"></div>'), 'index.html has div#app')
assert(indexHtml.includes('/src/main.js'), 'index.html imports /src/main.js')

// --- package.json ---

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))
assert(pkg.name === 'gameShelf', 'package.json name is "gameShelf"')
assert(pkg.description === 'A collection of browser-based games', 'package.json description is correct')
assert(pkg.type === 'module', 'package.json type is "module"')
assert(pkg.scripts && pkg.scripts.dev === 'vite', 'package.json dev script runs vite')
assert(pkg.scripts && pkg.scripts.build === 'vite build', 'package.json build script runs vite build')
assert(pkg.scripts && pkg.scripts.preview === 'vite preview', 'package.json preview script runs vite preview')
assert(pkg.scripts && pkg.scripts.test === 'node test-acceptance.js', 'package.json test script runs node test-acceptance.js')
assert(pkg.devDependencies && pkg.devDependencies.vue, 'package.json has vue dependency')
assert(pkg.devDependencies && pkg.devDependencies['vue-router'], 'package.json has vue-router dependency')
assert(pkg.devDependencies && pkg.devDependencies.pinia, 'package.json has pinia dependency')

// --- vite.config.js ---

const viteConfig = readFileSync(join(root, 'vite.config.js'), 'utf-8')
assert(viteConfig.includes('defineConfig'), 'vite.config.js uses defineConfig')
assert(viteConfig.includes("@vitejs/plugin-vue"), 'vite.config.js imports from @vitejs/plugin-vue')
assert(viteConfig.includes("'/gameShelf/'"), 'vite.config.js sets base to /gameShelf/')
assert(viteConfig.includes('plugins'), 'vite.config.js exports config with plugins')
assert(viteConfig.includes('fileURLToPath'), 'vite.config.js uses fileURLToPath')

// --- router/index.js routes ---

const router = readFileSync(join(root, 'src', 'router', 'index.js'), 'utf-8')
assert(router.includes("path: '/'"), 'router has / route')
assert(router.includes("path: '/about'"), 'router has /about route')
assert(router.includes("path: '/game/:id'"), 'router has /game/:id route')
assert(router.includes("path: '/highscores'"), 'router has /highscores route')
assert(router.includes(':pathMatch(.*)*'), 'router has catch-all route')

// --- stores content ---

const gameStore = readFileSync(join(root, 'src', 'stores', 'gameStore.js'), 'utf-8')
assert(gameStore.includes('useGameStore'), 'gameStore exports useGameStore')
assert(gameStore.includes('catalog'), 'gameStore has catalog state')
assert(gameStore.includes('addGame'), 'gameStore has addGame action')
assert(gameStore.includes('removeGame'), 'gameStore has removeGame action')
assert(gameStore.includes('getGameById'), 'gameStore has getGameById action')

const scoreStore = readFileSync(join(root, 'src', 'stores', 'scoreStore.js'), 'utf-8')
assert(scoreStore.includes('useScoreStore'), 'scoreStore exports useScoreStore')
assert(scoreStore.includes('highScores'), 'scoreStore has highScores state')
assert(scoreStore.includes('addScore'), 'scoreStore has addScore action')
assert(scoreStore.includes('getHighScores'), 'scoreStore has getHighScores action')

const userStore = readFileSync(join(root, 'src', 'stores', 'userStore.js'), 'utf-8')
assert(userStore.includes('useUserStore'), 'userStore exports useUserStore')
assert(userStore.includes('username'), 'userStore has username state')
assert(userStore.includes('lastPlayedGame'), 'userStore has lastPlayedGame state')
assert(userStore.includes('setUserName'), 'userStore has setUserName action')
assert(userStore.includes('setLastPlayedGame'), 'userStore has setLastPlayedGame action')

// --- .github/workflows/deploy.yml ---

const deployYml = readFileSync(join(root, '.github', 'workflows', 'deploy.yml'), 'utf-8')
assert(deployYml.includes('npm ci'), 'deploy.yml runs npm ci')
assert(deployYml.includes('npm run build'), 'deploy.yml runs npm run build')
assert(deployYml.includes('./dist/'), 'deploy.yml uploads ./dist/')

// --- .gitignore ---

const gitignore = readFileSync(join(root, '.gitignore'), 'utf-8')
assert(gitignore.includes('node_modules/'), '.gitignore includes node_modules/')
assert(gitignore.includes('dist/'), '.gitignore includes dist/')
assert(gitignore.includes('.env'), '.gitignore includes .env')
assert(gitignore.includes('.env.*'), '.gitignore includes .env.*')

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
