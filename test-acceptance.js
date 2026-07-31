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
assert(styles.includes('margin: 0'), 'styles.css resets margin')
assert(styles.includes('padding: 0'), 'styles.css resets padding')
assert(styles.includes('box-sizing: border-box'), 'styles.css sets box-sizing border-box')
assert(styles.includes('scroll-behavior: smooth'), 'styles.css sets scroll-behavior smooth')
assert(styles.includes("background-color: #0f0f23") || styles.includes("background: #0f0f23"), 'styles.css has dark background #0f0f23')
assert(styles.includes('color: #e0e0e0') || styles.includes("color: '#e0e0e0'"), 'styles.css has light text')
assert(styles.includes('#7f5af0'), 'styles.css has accent color #7f5af0')
assert(styles.includes('position: sticky') || styles.includes('sticky'), 'styles.css has sticky header')
assert(styles.includes('flex-direction: column'), 'styles.css has flex column body')
assert(styles.includes('@media'), 'styles.css has responsive @media queries')

// --- router: history-based ---

assert(router.includes('createWebHistory'), 'router uses createWebHistory')

// --- gameStore: additional state/actions ---

assert(gameStore.includes('activeGame'), 'gameStore has activeGame state')
assert(gameStore.includes('setActiveGame'), 'gameStore has setActiveGame action')

// --- scoreStore: additional action ---

assert(scoreStore.includes('clearScores'), 'scoreStore has clearScores action')

// --- gamesCatalog: full entry fields ---

assert(catalog.includes('name'), 'gamesCatalog.js entries have name field')
assert(catalog.includes('description'), 'gamesCatalog.js entries have description field')
assert(catalog.includes('genre'), 'gamesCatalog.js entries have genre field')

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
assert(gamePage.includes('gameStore') || gamePage.includes('getGameById'), 'GamePage.vue looks up game in store')
assert(gamePage.includes('Game canvas coming soon'), 'GamePage.vue has game canvas placeholder')

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

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}

// --- Extended tests for layout shell acceptance criteria ---

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

// --- AppHeader: brand uses accent color #7f5af0 ---
assert(appHeader.includes('#7f5af0'), 'AppHeader.vue brand references accent color #7f5af0')

// --- AppFooter: exact copyright text ---
assert(appFooter.includes('© 2025 gameShelf — All games built in browser — no downloads required') || appFooter.includes('&copy; 2025 gameShelf'), 'AppFooter.vue has exact copyright text')

// --- AppFooter: router-link to /about ---
assert(appFooter.includes("to=\"/about\"") || appFooter.includes("to='/about'"), 'AppFooter.vue has router-link to /about')

// --- NotFoundView: router-link to / ---
assert(notFoundView.includes("to=\"/\"") || notFoundView.includes("to='/'"), 'NotFoundView.vue has router-link pointing to /')
assert(notFoundView.includes('Go back to Home') || notFoundView.includes('Go back to home') || notFoundView.includes('Home'), 'NotFoundView.vue has back-to-home link text')

// --- Router: path → component mappings ---
assert(router.includes("path: '/', component: HomeView") || (router.includes("path: '/'") && router.includes('import HomeView')), 'Router maps path / to HomeView')
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
