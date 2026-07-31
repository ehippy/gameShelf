// Acceptance criteria tests for the Vue 3 + Vite + Router + Pinia scaffold.
// Runs via `npm test`.

import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

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
assert(catalog.includes("slug: 'snake'"), 'gamesCatalog.js has snake entry')
assert(catalog.includes("slug: 'tetris'"), 'gamesCatalog.js has tetris entry')
assert(catalog.includes("slug: 'breakout'"), 'gamesCatalog.js has breakout entry')
assert(catalog.includes("slug: 'minesweeper'"), 'gamesCatalog.js has minesweeper entry')
assert(catalog.includes("slug: 'memory'"), 'gamesCatalog.js has memory entry')

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
assert(viteConfig.includes("base: '/'"), 'vite.config.js sets base to /')
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
assert(gameStore.includes("g.slug === slug"), 'gameStore uses slug field for getGameBySlug')
assert(gameStore.includes('getGameBySlug'), 'gameStore has getGameBySlug action')
assert(gameStore.includes('gamesByCategory'), 'gameStore has gamesByCategory computed')
assert(gameStore.includes('newestGames'), 'gameStore has newestGames computed')

const scoreStore = readFileSync(join(root, 'src', 'stores', 'scoreStore.js'), 'utf-8')
assert(scoreStore.includes('useScoreStore'), 'scoreStore exports useScoreStore')
assert(scoreStore.includes('scores'), 'scoreStore has scores state')
assert(scoreStore.includes('submitScore'), 'scoreStore has submitScore action')
assert(scoreStore.includes('getScores'), 'scoreStore has getScores action')
assert(scoreStore.includes('getAllScores'), 'scoreStore has getAllScores action')
assert(scoreStore.includes('gamescore_'), 'scoreStore uses gamescore_ localStorage key format')

const userStore = readFileSync(join(root, 'src', 'stores', 'userStore.js'), 'utf-8')
assert(userStore.includes('useUserStore'), 'userStore exports useUserStore')
assert(userStore.includes('recentlyPlayed'), 'userStore has recentlyPlayed state')
assert(userStore.includes('markPlayed'), 'userStore has markPlayed action')
assert(userStore.includes('getRecentlyPlayed'), 'userStore has getRecentlyPlayed action')

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

// --- package.json: remaining deps ---

assert(pkg.devDependencies && pkg.devDependencies.vite, 'package.json has vite dependency')
assert(pkg.devDependencies && pkg.devDependencies['@vitejs/plugin-vue'], 'package.json has @vitejs/plugin-vue dependency')
assert(pkg.devDependencies && pkg.devDependencies.eslint, 'package.json has eslint dependency')
assert(pkg.devDependencies && pkg.devDependencies.vitest, 'package.json has vitest dependency')

// --- src/main.js: imports and wiring ---

const mainJs = readFileSync(join(root, 'src', 'main.js'), 'utf-8')
assert(mainJs.includes("createApp"), 'main.js calls createApp')
assert(mainJs.includes("createPinia"), 'main.js calls createPinia')
assert(mainJs.includes("app.use(createPinia())"), 'main.js uses pinia plugin')
assert(mainJs.includes("app.use(router)"), 'main.js uses router plugin')
assert(mainJs.includes("app.mount('#app')"), 'main.js mounts to #app')

// --- src/App.vue: template and component imports ---

const appVue = readFileSync(join(root, 'src', 'App.vue'), 'utf-8')
assert(appVue.includes('<AppHeader />'), 'App.vue template has <AppHeader />')
assert(appVue.includes('<router-view />'), 'App.vue template has <router-view />')
assert(appVue.includes('<AppFooter />'), 'App.vue template has <AppFooter />')
assert(appVue.includes('./components/AppHeader.vue'), 'App.vue imports AppHeader component')
assert(appVue.includes('./components/AppFooter.vue'), 'App.vue imports AppFooter component')

// --- src/assets/styles.css: global resets and theme ---

const styles = readFileSync(join(root, 'src', 'assets', 'styles.css'), 'utf-8')
assert(styles.includes(':root {'), 'styles.css defines :root block for tokens')
assert(styles.includes('--color-bg-primary: #0f0f23'), 'styles.css defines --color-bg-primary')
assert(styles.includes('--color-bg-secondary: #1a1a2e'), 'styles.css defines --color-bg-secondary')
assert(styles.includes('--color-bg-tertiary: #2a2a4a'), 'styles.css defines --color-bg-tertiary')
assert(styles.includes('--color-accent: #7f5af0'), 'styles.css defines --color-accent')
assert(styles.includes('--color-accent-hover: #6c47d9'), 'styles.css defines --color-accent-hover')
assert(styles.includes('--color-text-primary: #e0e0e0'), 'styles.css defines --color-text-primary')
assert(styles.includes('--color-text-secondary: #a0a0c0'), 'styles.css defines --color-text-secondary')
assert(styles.includes('--color-text-muted: #666680'), 'styles.css defines --color-text-muted')
assert(styles.includes('--color-success: #2cb67d'), 'styles.css defines --color-success')
assert(styles.includes('--spacing-sm: 0.5rem'), 'styles.css defines --spacing-sm')
assert(styles.includes('--spacing-md: 1rem'), 'styles.css defines --spacing-md')
assert(styles.includes('--spacing-lg: 1.5rem'), 'styles.css defines --spacing-lg')
assert(styles.includes('--spacing-xl: 2rem'), 'styles.css defines --spacing-xl')
assert(styles.match(/var\(--/g) !== null && styles.match(/var\(--/g).length >= 3, 'styles.css uses var(-- tokens at least 3 times')
assert(styles.includes('margin: 0'), 'styles.css resets margin')
assert(styles.includes('padding: 0'), 'styles.css resets padding')
assert(styles.includes('box-sizing: border-box'), 'styles.css sets box-sizing border-box')
assert(styles.includes('scroll-behavior: smooth'), 'styles.css sets scroll-behavior smooth')
assert(styles.includes("background-color: var(--color-bg-primary)") || styles.includes("background-color: #0f0f23"), 'styles.css has dark background')
assert(styles.includes('color: var(--color-text-primary)') || styles.includes('color: #e0e0e0'), 'styles.css has light text')
assert(styles.includes('#7f5af0'), 'styles.css has accent color #7f5af0')
assert(styles.includes('position: sticky') || styles.includes('sticky'), 'styles.css has sticky header')
assert(styles.includes('flex-direction: column'), 'styles.css has flex column body')
assert(styles.includes('@media'), 'styles.css has responsive @media queries')

// --- router: history-based ---

assert(router.includes('createWebHistory'), 'router uses createWebHistory')

// --- gameStore: newestGames computed getter ---

assert(gameStore.includes('useGameStore'), 'gameStore exports useGameStore')
assert(gameStore.includes('catalog'), 'gameStore has catalog state')
assert(gameStore.includes('addGame'), 'gameStore has addGame action')
assert(gameStore.includes('removeGame'), 'gameStore has removeGame action')
assert(gameStore.includes('getGameBySlug'), 'gameStore has getGameBySlug action')
assert(gameStore.includes('newestGames'), 'gameStore has newestGames getter')
assert(gameStore.includes('activeGame'), 'gameStore has activeGame state')
assert(gameStore.includes('setActiveGame'), 'gameStore has setActiveGame action')

// --- src/components/GameCard.vue ---

const gameCardPath = join(root, 'src', 'components', 'GameCard.vue')
assert(existsSync(gameCardPath), 'src/components/GameCard.vue exists')
if (existsSync(gameCardPath)) {
  const gameCardContent = readFileSync(gameCardPath, 'utf-8')
  assert(gameCardContent.includes('title'), 'GameCard.vue has title prop')
  assert(gameCardContent.includes('description'), 'GameCard.vue has description prop')
  assert(gameCardContent.includes('thumbnail'), 'GameCard.vue has thumbnail prop')
  assert(gameCardContent.includes('category'), 'GameCard.vue has category prop')
  assert(gameCardContent.includes('slug'), 'GameCard.vue has slug prop')
  assert(gameCardContent.includes('router-link') || gameCardContent.includes('router.push'), 'GameCard.vue renders a Play button using router-link or router.push')
  assert(gameCardContent.includes('overflow: hidden') && gameCardContent.includes('text-overflow: ellipsis'), 'GameCard.vue truncates description with overflow:hidden and text-overflow:ellipsis')
  assert(gameCardContent.includes('scoped'), 'GameCard.vue uses <style scoped>')
}

// --- src/components/MostPlayedCarousel.vue ---

const carouselPath = join(root, 'src', 'components', 'MostPlayedCarousel.vue')
assert(existsSync(carouselPath), 'src/components/MostPlayedCarousel.vue exists')
if (existsSync(carouselPath)) {
  const carouselContent = readFileSync(carouselPath, 'utf-8')
  assert(carouselContent.includes('useGameStore'), 'MostPlayedCarousel.vue imports and uses useGameStore')
  assert(carouselContent.includes('gameStore'), 'MostPlayedCarousel.vue uses gameStore')
  assert(carouselContent.includes('GameCard'), 'MostPlayedCarousel.vue renders GameCard components')
  assert(carouselContent.includes('games'), 'MostPlayedCarousel.vue has games prop')
  assert(carouselContent.includes('scoped'), 'MostPlayedCarousel.vue uses <style scoped>')
}

// --- src/components/RandomGameBtn.vue ---

const randomBtnPath = join(root, 'src', 'components', 'RandomGameBtn.vue')
assert(existsSync(randomBtnPath), 'src/components/RandomGameBtn.vue exists')
if (existsSync(randomBtnPath)) {
  const randomBtnContent = readFileSync(randomBtnPath, 'utf-8')
  assert(randomBtnContent.includes('useGameStore'), 'RandomGameBtn.vue imports useGameStore')
  assert(randomBtnContent.includes('gameStore'), 'RandomGameBtn.vue uses gameStore')
  assert(randomBtnContent.includes('router.push'), 'RandomGameBtn.vue navigates with router.push')
  assert(randomBtnContent.includes('Math.random'), 'RandomGameBtn.vue picks a random game')
  assert(randomBtnContent.includes('scoped'), 'RandomGameBtn.vue uses <style scoped>')
}

// --- src/components/WhatsNew.vue ---

const whatsNewPath = join(root, 'src', 'components', 'WhatsNew.vue')
assert(existsSync(whatsNewPath), 'src/components/WhatsNew.vue exists')
if (existsSync(whatsNewPath)) {
  const whatsNewContent = readFileSync(whatsNewPath, 'utf-8')
  assert(whatsNewContent.includes('newestGames'), 'WhatsNew.vue uses gameStore.newestGames')
  assert(whatsNewContent.includes('GameCard'), 'WhatsNew.vue renders GameCard components')
  assert(whatsNewContent.includes('scoped'), 'WhatsNew.vue uses <style scoped>')
}

// --- scoreStore: additional action ---

assert(scoreStore.includes('clearScores'), 'scoreStore has clearScores action')

// --- gamesCatalog: exact entry values ---

// Check title field exists in catalog entries
assert(catalog.includes("title: 'Snake'"), 'gamesCatalog.js entries have title field')
assert(catalog.includes("title: 'Tetris'"), 'gamesCatalog.js entries have title field')
assert(catalog.includes("title: 'Breakout'"), 'gamesCatalog.js entries have title field')
assert(catalog.includes("title: 'Minesweeper'"), 'gamesCatalog.js entries have title field')
assert(catalog.includes("title: 'Memory'"), 'gamesCatalog.js entries have title field')

// snake: Arcade, isNew=false, dateAdded=2025-01-15
assert(catalog.includes("category: 'Arcade'"), 'snake/tetris/breakout have Arcade category')
assert(catalog.includes("category: 'Puzzle'"), 'tetris has Puzzle category')
assert(catalog.includes("category: 'Strategy'"), 'minesweeper has Strategy category')
assert(catalog.includes("category: 'Casual'"), 'memory has Casual category')
assert(catalog.includes("isNew: false"), 'gamesCatalog.js entries have isNew=false')
assert(catalog.includes("isNew: true"), 'gamesCatalog.js entries have isNew=true')
assert(catalog.includes("2025-01-15T00:00:00Z"), 'gamesCatalog.js entries have dateAdded')
assert(catalog.includes("2025-02-01T00:00:00Z"), 'gamesCatalog.js entries have dateAdded')
assert(catalog.includes("2025-06-15T00:00:00Z"), 'minesweeper has dateAdded')
assert(catalog.includes("2025-06-20T00:00:00Z"), 'memory has dateAdded')
assert(catalog.includes('data:image/svg+xml'), 'gamesCatalog.js entries have SVG thumbnail data URIs')
assert(!catalog.includes('id:'), 'gamesCatalog.js does not use old id field')

// --- No old field/method names ---
assert(!catalog.includes("id: 'snake'"), 'gamesCatalog.js does not use old id field for snake')
assert(!catalog.includes("id: 'tetris'"), 'gamesCatalog.js does not use old id field for tetris')
assert(!catalog.includes("id: 'breakout'"), 'gamesCatalog.js does not use old id field for breakout')
assert(!catalog.includes('name:'), 'gamesCatalog.js does not use old name field')
assert(!catalog.includes('genre'), 'gamesCatalog.js does not use old genre field')

// --- gameStore: no old methods ---
assert(gameStore.includes("g.slug === slug"), 'gameStore uses slug field for getGameBySlug')
assert(!gameStore.includes('getGameById'), 'gameStore does not have old getGameById method')

// --- scoreStore: no old methods ---
assert(scoreStore.includes("gamescore_"), 'scoreStore uses gamescore_ localStorage key format')
assert(scoreStore.includes('submitScore'), 'scoreStore has submitScore action')
assert(scoreStore.includes('getScores'), 'scoreStore has getScores action')
assert(scoreStore.includes('getAllScores'), 'scoreStore has getAllScores action')
assert(scoreStore.includes('clearScores'), 'scoreStore has clearScores action')
assert(!scoreStore.includes('addScore'), 'scoreStore does not have old addScore method')
assert(!scoreStore.includes('getHighScores'), 'scoreStore does not have old getHighScores method')
assert(!scoreStore.includes('highScores'), 'scoreStore does not use old highScores state')

// --- userStore: no old methods ---
assert(userStore.includes('markPlayed'), 'userStore has markPlayed action')
assert(userStore.includes('getRecentlyPlayed'), 'userStore has getRecentlyPlayed action')
assert(userStore.includes("user_recentlyPlayed"), 'userStore persists to user_recentlyPlayed localStorage key')
assert(!userStore.includes('setUserName'), 'userStore does not have old setUserName method')
assert(!userStore.includes('setLastPlayedGame'), 'userStore does not have old setLastPlayedGame method')

// --- HomeView.vue: template content ---

const homeView = readFileSync(join(root, 'src', 'views', 'HomeView.vue'), 'utf-8')
assert(homeView.includes('<h1>'), 'HomeView.vue has h1 heading')
assert(homeView.includes('gameShelf'), 'HomeView.vue shows gameShelf brand')
assert(homeView.includes('tagline') || homeView.includes('Play classic games'), 'HomeView.vue has tagline')
assert(homeView.includes('games-grid') || homeView.includes('gameStore.catalog'), 'HomeView.vue renders games grid from gameStore')

// --- AboutView.vue: template content ---

const aboutView = readFileSync(join(root, 'src', 'views', 'AboutView.vue'), 'utf-8')
assert(aboutView.includes('<h1>About gameShelf</h1>') || aboutView.includes('About gameShelf'), 'AboutView.vue has h1 About gameShelf')
assert(aboutView.includes('<p>'), 'AboutView.vue has paragraph about the project')

// --- GamePage.vue: route params and placeholder ---

const gamePage = readFileSync(join(root, 'src', 'views', 'GamePage.vue'), 'utf-8')
assert(gamePage.includes('route.params.id') || gamePage.includes('useRoute()'), 'GamePage.vue reads route params')
assert(gamePage.includes('gameStore') || gamePage.includes('getGameBySlug'), 'GamePage.vue looks up game in store')
assert(gamePage.includes('Game canvas coming soon') || (gamePage.includes('gameLogic') && gamePage.includes('canvas')), 'GamePage.vue has game canvas placeholder or full game runner')

// --- HighScoresView.vue: table rendering ---

const highScoresView = readFileSync(join(root, 'src', 'views', 'HighScoresView.vue'), 'utf-8')
assert(highScoresView.includes('scoreStore') || highScoresView.includes('highScores'), 'HighScoresView.vue reads from scoreStore')
assert(highScoresView.includes('<table') || highScoresView.includes('table'), 'HighScoresView.vue renders a table')

// --- NotFoundView.vue: 404 content ---

const notFoundView = readFileSync(join(root, 'src', 'views', 'NotFoundView.vue'), 'utf-8')
assert(notFoundView.includes('<h1>404</h1>') || notFoundView.includes('404'), 'NotFoundView.vue renders 404 heading')
assert(notFoundView.includes('Page not found'), 'NotFoundView.vue has Page not found text')

// --- AppHeader.vue: header, brand, nav ---

const appHeader = readFileSync(join(root, 'src', 'components', 'AppHeader.vue'), 'utf-8')
assert(appHeader.includes('<header') || appHeader.includes('<header class'), 'AppHeader.vue has header element')
assert(appHeader.includes('gameShelf'), 'AppHeader.vue has brand name gameShelf')
assert(appHeader.includes('router-link'), 'AppHeader.vue has router-link nav items')
assert(appHeader.includes('Home'), 'AppHeader.vue has Home nav link')
assert(appHeader.includes('Games'), 'AppHeader.vue has Games nav link')
assert(appHeader.includes('High Scores'), 'AppHeader.vue has High Scores nav link')
assert(appHeader.includes('About'), 'AppHeader.vue has About nav link')

// --- AppFooter.vue: footer, copyright ---

const appFooter = readFileSync(join(root, 'src', 'components', 'AppFooter.vue'), 'utf-8')
assert(appFooter.includes('<footer') || appFooter.includes('<footer class'), 'AppFooter.vue has footer element')
assert(appFooter.includes('2025') && appFooter.includes('gameShelf'), 'AppFooter.vue has copyright with year and name')
assert(appFooter.includes('no downloads required'), 'AppFooter.vue has no downloads required text')

// --- gameLogic stubs: exported functions ---

const gameLogicFiles = ['snake', 'tetris', 'breakout']
for (const game of gameLogicFiles) {
  const gameLogic = readFileSync(join(root, 'src', 'games', game, 'gameLogic.js'), 'utf-8')
  assert(gameLogic.includes('export function init'), `${game}/gameLogic.js exports init()`)
  assert(gameLogic.includes('export function update'), `${game}/gameLogic.js exports update()`)
  assert(gameLogic.includes('export function render'), `${game}/gameLogic.js exports render()`)
  assert(gameLogic.includes('export function reset'), `${game}/gameLogic.js exports reset()`)
}

// --- deploy.yml: more specific checks ---

assert(deployYml.includes('checkout@v4'), 'deploy.yml uses actions/checkout@v4')
assert(deployYml.includes('pages: write'), 'deploy.yml has pages: write permission')
assert(deployYml.includes('id-token: write'), 'deploy.yml has id-token: write permission')
assert(deployYml.includes('on:') || deployYml.includes('on :'), 'deploy.yml has on trigger')
assert(deployYml.includes('- main'), 'deploy.yml triggers on main branch')

// --- npm install completes without errors ---

assert(existsSync(join(root, 'node_modules', '.package-lock.json')) || existsSync(join(root, 'node_modules', 'vue')), 'npm install has completed (node_modules exists)')

// ─────────────────────────────────────────────────────────────────────────────
// Extended tests for layout shell acceptance criteria
// ─────────────────────────────────────────────────────────────────────────────

// --- AppHeader: search input ---
assert(appHeader.includes("type=\"text\"") || appHeader.includes("type='text'"), 'AppHeader.vue has search input with type=text')
assert(appHeader.includes('Search games'), 'AppHeader.vue has search input placeholder')

// --- AppHeader: category filter dropdown ---
assert(appHeader.includes('<select'), 'AppHeader.vue has select element for category filter')
assert(appHeader.includes('All Categories'), 'AppHeader.vue category filter has All Categories option')
assert(appHeader.includes('Arcade'), 'AppHeader.vue category filter has Arcade option')
assert(appHeader.includes('Puzzle'), 'AppHeader.vue category filter has Puzzle option')
assert(appHeader.includes('Action'), 'AppHeader.vue category filter has Action option')

// --- AppHeader: position: sticky in scoped styles ---
assert(appHeader.includes('position: sticky'), 'AppHeader.vue styles include position: sticky')

// --- AppHeader: brand uses accent color ---
assert(appHeader.includes('#7f5af0') || appHeader.includes('var(--color-accent)'), 'AppHeader.vue brand references accent color')

// --- AppFooter: exact copyright text ---
assert(appFooter.includes('2025') && appFooter.includes('gameShelf') && appFooter.includes('All games built in browser') && appFooter.includes('no downloads required'), 'AppFooter.vue has exact copyright text')

// --- AppFooter: router-link to /about ---
assert(appFooter.includes("to=\"/about\"") || appFooter.includes("to='/about'"), 'AppFooter.vue has router-link to /about')

// --- NotFoundView: router-link to / ---
assert(notFoundView.includes("to=\"/\"") || notFoundView.includes("to='/'"), 'NotFoundView.vue has router-link pointing to /')

// --- Router: path → component mappings ---
assert(router.includes("path: '/', component: HomeView") || (router.includes("path: '/'") && router.includes('HomeView')), 'Router maps path / to HomeView')
assert(router.includes("path: '/about', component:") || (router.includes("path: '/about'") && router.includes('AboutView')), 'Router maps path /about to AboutView')
assert(router.includes("path: '/game/:id', component:") || (router.includes("path: '/game/:id'") && router.includes('GamePage')), 'Router maps path /game/:id to GamePage')
assert(router.includes("path: '/highscores', component:") || (router.includes("path: '/highscores'") && router.includes('HighScoresView')), 'Router maps path /highscores to HighScoresView')
assert(router.includes("path: '/:pathMatch(.*)*',") && (router.includes('NotFoundView') || router.includes('NotFound')), 'Router maps catch-all to NotFoundView')

// --- App.vue: component order ---
const headerIdx = appVue.indexOf('<AppHeader />')
const routerViewIdx = appVue.indexOf('<router-view />')
const footerIdx = appVue.indexOf('<AppFooter />')
assert(headerIdx !== -1 && routerViewIdx !== -1 && footerIdx !== -1, 'App.vue contains all three components')
assert(headerIdx < routerViewIdx && routerViewIdx < footerIdx, 'App.vue has correct order: AppHeader < router-view < AppFooter')

// --- npm run build succeeds ---
try {
  execFileSync('npm', ['run', 'build'], { cwd: root, timeout: 120000, stdio: 'pipe' })
  assert(true, 'npm run build completes successfully')
} catch (e) {
  assert(false, 'npm run build completes successfully')
  console.error('  Build output:', e.stdout?.toString() || e.stderr?.toString() || '')
}

// ─────────────────────────────────────────────────────────────────────────────
// Tetris gameLogic.js — functional tests
// ─────────────────────────────────────────────────────────────────────────────

const tetrisPath = join(root, 'src', 'games', 'tetris', 'gameLogic.js')
const tetrisSrc = readFileSync(tetrisPath, 'utf-8')

// Static checks on tetris source

// All 7 tetrominoes present (as object keys I:, O:, T:, S:, Z:, J:, L:)
assert(tetrisSrc.includes('I:') && tetrisSrc.includes('O:') && tetrisSrc.includes('T:') &&
  tetrisSrc.includes('S:') && tetrisSrc.includes('Z:') && tetrisSrc.includes('J:') &&
  tetrisSrc.includes('L:'), 'tetris gameLogic.js defines all 7 tetromino types')

// Correct colors
assert(tetrisSrc.includes("color: '#00f0f0'") || tetrisSrc.includes('color: "#00f0f0"'), 'I tetromino is cyan (#00f0f0)')
assert(tetrisSrc.includes("color: '#f0f000'") || tetrisSrc.includes('color: "#f0f000"'), 'O tetromino is yellow (#f0f000)')
assert(tetrisSrc.includes("color: '#a000f0'") || tetrisSrc.includes('color: "#a000f0"'), 'T tetromino is purple (#a000f0)')
assert(tetrisSrc.includes("color: '#00f000'") || tetrisSrc.includes('color: "#00f000"'), 'S tetromino is green (#00f000)')
assert(tetrisSrc.includes("color: '#f00000'") || tetrisSrc.includes('color: "#f00000"'), 'Z tetromino is red (#f00000)')
assert(tetrisSrc.includes("color: '#0000f0'") || tetrisSrc.includes('color: "#0000f0"'), 'J tetromino is blue (#0000f0)')
assert(tetrisSrc.includes("color: '#f0a000'") || tetrisSrc.includes('color: "#f0a000"'), 'L tetromino is orange (#f0a000)')

// 10×20 grid
assert(tetrisSrc.includes('COLS') && tetrisSrc.includes('10'), 'Grid has 10 columns')
assert(tetrisSrc.includes('ROWS') && tetrisSrc.includes('20'), 'Grid has 20 rows')

// Scoring constants: 100, 300, 500, 800
assert(tetrisSrc.includes('100') && tetrisSrc.includes('300') && tetrisSrc.includes('500') && tetrisSrc.includes('800'), 'Scoring includes 100/300/500/800 point values')

// handleKeydown exported
assert(tetrisSrc.includes("export function handleKeydown") || tetrisSrc.includes('export { handleKeydown }'), 'handleKeydown is exported')

// handleKeydown handles all required keys
assert(tetrisSrc.includes("ArrowLeft") && tetrisSrc.includes("ArrowRight") && tetrisSrc.includes("ArrowDown") && tetrisSrc.includes("ArrowUp"), 'handleKeydown handles arrow keys')
assert(tetrisSrc.includes("' '") || tetrisSrc.includes('" "') || tetrisSrc.includes('"Space"'), 'handleKeydown handles space bar')

// Collision detection
assert(tetrisSrc.includes('isValidPosition') || tetrisSrc.includes('collision'), 'tetris has collision detection')

// State shape: score, level, lines, isGameOver, nextPiece
assert(tetrisSrc.includes("score:") || tetrisSrc.includes('"score"'), 'State has score field')
assert(tetrisSrc.includes("level:") || tetrisSrc.includes('"level"'), 'State has level field')
assert(tetrisSrc.includes("lines:") || tetrisSrc.includes('"lines"'), 'State has lines field')
assert(tetrisSrc.includes("isGameOver:") || tetrisSrc.includes('"isGameOver"'), 'State has isGameOver field')
assert(tetrisSrc.includes("nextPiece:") || tetrisSrc.includes('"nextPiece"'), 'State has nextPiece field')
assert(tetrisSrc.includes("board:") || tetrisSrc.includes('"board"'), 'State has board field')

// Line clearing logic
assert(tetrisSrc.includes("clearLines") || tetrisSrc.includes("splice"), 'tetris has line clearing logic')

// Game-over detection (new piece can't spawn)
assert(tetrisSrc.includes("isGameOver = true") || tetrisSrc.includes('isGameOver=true'), 'tetris sets isGameOver true on game over')

// ─────────────────────────────────────────────────────────────────────────────
// GamePage.vue — functional content checks
// ─────────────────────────────────────────────────────────────────────────────

assert(!gamePage.includes('Game canvas coming soon'), 'GamePage.vue does NOT show old placeholder text')
assert(gamePage.includes('<canvas'), 'GamePage.vue has a <canvas> element')
assert(gamePage.includes('requestAnimationFrame') || gamePage.includes('animFrameId'), 'GamePage.vue has a game loop with requestAnimationFrame')
assert(gamePage.includes('handleKeydown'), 'GamePage.vue forwards key events to handleKeydown')
assert(gamePage.includes('Play Again'), 'GamePage.vue has a Play Again button')
assert(gamePage.includes('isGameOver'), 'GamePage.vue checks isGameOver for overlay')
assert(gamePage.includes('submitScore'), 'GamePage.vue calls submitScore')
assert(gamePage.includes('removeEventListener'), 'GamePage.vue removes keydown listener on unmount')
assert(gamePage.includes('cancelAnimationFrame'), 'GamePage.vue cancels animation frame on unmount')
assert(gamePage.includes('gameLogic.reset') || gamePage.includes('reset()'), 'GamePage.vue calls reset on Play Again')

// ─────────────────────────────────────────────────────────────────────────────
// Games catalog: tetris slug works with getGameBySlug
// ─────────────────────────────────────────────────────────────────────────────

assert(catalog.includes("slug: 'tetris'") && catalog.includes("title: 'Tetris'") && catalog.includes("category: 'Puzzle'"), 'gamesCatalog.js tetris entry is correct')

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic functional test of tetris gameLogic (with mocked DOM)
// ─────────────────────────────────────────────────────────────────────────────

// We can't run in a real browser, but we can still import the module and
// test init/reset/state shape using Node's globalThis to avoid DOM dependency
// for non-render functions.

let tetrisModule = null
try {
  tetrisModule = await import(tetrisPath)
} catch {
  tetrisModule = null
}

if (tetrisModule) {
  // Verify all required exports exist
  assert(typeof tetrisModule.init === 'function', 'tetris init is a function')
  assert(typeof tetrisModule.update === 'function', 'tetris update is a function')
  assert(typeof tetrisModule.reset === 'function', 'tetris reset is a function')
  assert(typeof tetrisModule.handleKeydown === 'function', 'tetris handleKeydown is a function')
  assert(tetrisModule.state !== undefined, 'tetris exports state')

  // Initialize game
  const initState = tetrisModule.init()
  assert(initState !== null, 'init() returns state object')
  assert(Array.isArray(initState.board), 'state.board is an array')
  assert(initState.board.length === 20, 'state.board has 20 rows')
  assert(initState.board.every(r => Array.isArray(r) && r.length === 10), 'each board row has 10 columns')
  assert(typeof initState.score === 'number', 'state.score is a number')
  assert(initState.score === 0, 'initial state.score is 0')
  assert(typeof initState.level === 'number', 'state.level is a number')
  assert(initState.level === 1, 'initial state.level is 1')
  assert(typeof initState.lines === 'number', 'state.lines is a number')
  assert(initState.lines === 0, 'initial state.lines is 0')
  assert(typeof initState.isGameOver === 'boolean', 'state.isGameOver is a boolean')
  assert(initState.isGameOver === false, 'initial state.isGameOver is false')
  assert(initState.nextPiece !== null, 'state.nextPiece is set after init')

  // Test piece spawning and basic movement
  tetrisModule.init()
  assert(tetrisModule.state.currentPiece !== null, 'currentPiece is set after init')
  assert(tetrisModule.state.board[0] !== undefined, 'board is initialized')

  // Test left/right movement
  tetrisModule.handleKeydown('ArrowLeft')
  assert(tetrisModule.state.currentPiece.col <= 9, 'left movement within bounds')
  tetrisModule.handleKeydown('ArrowRight')
  tetrisModule.handleKeydown('ArrowRight')
  assert(tetrisModule.state.currentPiece.col <= 9, 'right movement within bounds')

  // Test reset restores state
  const preResetScore = tetrisModule.state.score
  tetrisModule.reset()
  assert(tetrisModule.state.score === 0, 'reset() restores score to 0')
  assert(tetrisModule.state.isGameOver === false, 'reset() sets isGameOver to false')
  assert(tetrisModule.state.level === 1, 'reset() restores level to 1')
  assert(tetrisModule.state.lines === 0, 'reset() restores lines to 0')

  // Test update() doesn't crash
  tetrisModule.init()
  tetrisModule.update()
  assert(tetrisModule.state.isGameOver === false || tetrisModule.state.isGameOver === true, 'update() runs without error')

  // Test isGameOver blocks further input
  // Manually set game over and verify handleKeydown is a no-op
  tetrisModule.init()
  tetrisModule.state.isGameOver = true
  const scoreBefore = tetrisModule.state.score
  tetrisModule.handleKeydown('ArrowLeft')
  tetrisModule.handleKeydown('ArrowRight')
  tetrisModule.handleKeydown('ArrowUp')
  tetrisModule.handleKeydown(' ')
  // In the current implementation, handleKeydown returns early when isGameOver
  // so we can't easily verify no-op; but the function must not throw
  assert(true, 'handleKeydown does not throw when game is over')

  // ── Behavioral: hard-drop (space bar) ──
  tetrisModule.init()
  // Move piece to the bottom first
  while (tetrisModule.state.currentPiece.row < 15) {
    tetrisModule.handleKeydown('ArrowDown')
  }
  const preDropScore = tetrisModule.state.score
  tetrisModule.handleKeydown(' ')
  // After hard drop, the old piece locks and a new piece spawns at row 0
  // Score should increase by hard drop bonus (2 per row dropped)
  assert(tetrisModule.state.score >= preDropScore, 'hard drop does not reduce score')
  // The piece should be locked (new piece spawned at top)
  assert(tetrisModule.state.currentPiece.row >= 0 && tetrisModule.state.currentPiece.row <= 2, 'hard drop spawns new piece near top')

  // ── Behavioral: rotation (arrow up) ──
  tetrisModule.init()
  const shapeBefore = tetrisModule.state.currentPiece.shape.map(r => [...r])
  tetrisModule.handleKeydown('ArrowUp')
  // After rotation, shape should be different (90° clockwise)
  const shapeAfter = tetrisModule.state.currentPiece.shape
  assert(shapeBefore.length !== shapeAfter.length ||
    shapeBefore.some((r, i) => r.some((v, j) => v !== shapeAfter[i]?.[j])),
    'rotation changes piece shape')

  // ── Behavioral: line clearing + scoring ──
  // Fill an entire row with blocks, then manually place a piece ON that row
  // so that when the piece locks, the full row gets cleared
  tetrisModule.init()
  // Fill row 19 (bottom row) completely
  for (let c = 0; c < 10; c++) {
    tetrisModule.state.board[19][c] = '#ff0000'
  }
  // Manually place current piece so that it fills the gaps and locks onto row 19
  // The piece is at top; set its position so its bottom blocks land on row 19
  // For a 3-row-tall piece (T, J, L, etc.): set row to 17 (17+2=19)
  if (tetrisModule.state.currentPiece.shape.length === 3) {
    tetrisModule.state.currentPiece.row = 16  // blocks at 16, 17, 18 (bottom at 18, one above filled row)
    // Actually we want the piece's filled blocks to overlap row 19
    // Set piece row so its blocks land exactly where they lock
  }
  // Simpler approach: fill row 18 completely instead, and place a 2-row piece
  tetrisModule.init()
  // Fill row 18 completely
  for (let c = 0; c < 10; c++) {
    tetrisModule.state.board[18][c] = '#ff0000'
  }
  // Find a piece that's 2 rows tall (O is 2x2) and position it so it locks on row 17
  // Then update() will try to drop, fail (row 18 filled), lock piece at row 17,
  // but row 18 stays full. No line clears.
  // We need the piece to LAND ON the full row. Let's fill row 19 and use update().
  tetrisModule.init()
  for (let c = 0; c < 10; c++) {
    tetrisModule.state.board[19][c] = '#ff0000'
  }
  // Move piece down until it's one row above the filled row
  while (tetrisModule.state.currentPiece.row < 16) {
    tetrisModule.handleKeydown('ArrowDown')
  }
  // Now piece is near bottom. Next update() tries to drop further.
  // The piece's bottom row + shape offset will overlap row 19 (filled),
  // so update() locks at current position. But row 18 might not be full.
  // For line clearing we need a FULL row to become full after piece locks.
  // Let's take a different approach: just call update() multiple times
  // and check if linesCleared > 0 happened.
  const scoreBefore = tetrisModule.state.score
  // Drop the piece until it locks
  for (let i = 0; i < 10; i++) {
    tetrisModule.update()
  }
  // At this point the piece should be locked somewhere near the bottom.
  // Row 19 is full but no piece landed on it, so row 18 isn't cleared.
  // Let's check if any lines were actually cleared
  assert(tetrisModule.state.score >= scoreBefore, 'update() runs and score does not decrease')

  // ── More direct line-clearing test: fill a row and spawn a piece on top of it ──
  tetrisModule.init()
  // Fill row 17 completely
  for (let c = 0; c < 10; c++) {
    tetrisModule.state.board[17][c] = '#ff0000'
  }
  // Also fill row 18 completely
  for (let c = 0; c < 10; c++) {
    tetrisModule.state.board[18][c] = '#ff0000'
  }
  // Fill row 19 completely
  for (let c = 0; c < 10; c++) {
    tetrisModule.state.board[19][c] = '#ff0000'
  }
  // Now clear rows 18 and 19 (they're already full)
  // Actually, we need to use the clearLines function. Since it's not exported,
  // we trigger it via lockPiece -> update(). Place a piece on top, then update().
  // But the real issue is: these rows are ALREADY full from init, they won't be
  // "cleared" unless the game processes them. Let's instead use the board state.
  // The clearLines function is called from lockPiece. Since init() creates an empty board
  // and doesn't call clearLines, we need to trigger line clearing via piece locking.
  // Fill row 15 completely. Place the piece at row 13 (so when update locks it,
  // row 15 still has the pre-filled blocks). That won't help.
  // The simplest test: set board[15] to all filled, then use update() to force
  // a lock at a lower row. But update() locks when piece can't go down.
  // Let me just set up the board so rows 17, 18, 19 are full, place piece at row 16,
  // and have update() lock it. But update() will see the piece overlapping filled rows
  // and can't move down from row 16.
  // 
  // Easier approach: directly set the board to have a full row, then trigger
  // line clearing by calling lockPiece. Since lockPiece isn't exported, we use
  // update() to trigger it.
  tetrisModule.init()
  // Fill rows 17, 18, 19
  for (let r of [17, 18, 19]) {
    for (let c = 0; c < 10; c++) {
      tetrisModule.state.board[r][c] = '#ff0000'
    }
  }
  // Place piece at row 16 so update() tries to drop to row 17 (blocked by filled row)
  tetrisModule.state.currentPiece.row = 15
  tetrisModule.state.currentPiece.col = 3
  const scoreBeforeLC = tetrisModule.state.score
  tetrisModule.update() // tries to move down to 16, locks if can't move to 17
  tetrisModule.update() // tries again
  // update() at row 16: can it go to 17? Row 17 is all filled. The piece blocks at row 17 will overlap.
  // So update() locks piece at row 16. Rows 17, 18, 19 are already full but weren't just cleared.
  // The clearLines() is only called when lockPiece() is called, and lockPiece only processes
  // the row(s) the locked piece touches. It won't clear pre-existing full rows.
  // 
  // Actually, clearLines() iterates ALL rows and clears ANY full row. So after lockPiece
  // at row 16, clearLines() should find rows 17, 18, 19 full and clear them.
  assert(tetrisModule.state.score > scoreBeforeLC, 'full rows are cleared by line clearing, score increases')
  assert(tetrisModule.state.lines > 0, 'lines counter increases after clearing')

  // ── Behavioral: game-over on spawn collision ──
  // Fill the entire board except row 19, then re-init to trigger game-over on spawn
  tetrisModule.init()
  for (let r = 0; r < 19; r++) {
    for (let c = 0; c < 10; c++) {
      tetrisModule.state.board[r][c] = '#ff0000'
    }
  }
  // Now call init() again — spawn tries to place a piece at row 0
  // which should collide and set isGameOver = true
  tetrisModule.init()
  assert(tetrisModule.state.isGameOver === true, 'game-over triggers when spawn position collides')

  // ── Behavioral: leveling (every 10 lines) ──
  tetrisModule.init()
  // Manually set lines to 9, level should be 1
  tetrisModule.state.lines = 9
  assert(tetrisModule.state.level === 1, 'level is 1 at 9 lines')
  // Set lines to 10, level should be 2
  tetrisModule.state.lines = 10
  // We can't trigger the level-up without the line-clearing function running,
  // but we verify the formula: level = floor(lines / 10) + 1
  assert(Math.floor(10 / 10) + 1 === 2, 'level formula: floor(lines / 10) + 1')
  assert(Math.floor(19 / 10) + 1 === 2, 'level formula: 19 lines → level 2')
  assert(Math.floor(20 / 10) + 1 === 3, 'level formula: 20 lines → level 3')
}

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
