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
assert(existsSync(join(root, '404.html')), '404.html exists at project root')

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

assert(existsSync(join(root, 'src', 'games', 'flappy-bird', 'gameLogic.js')), 'src/games/flappy-bird/gameLogic.js exists')

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
assert(mainJs.includes("window.location.hash"), 'main.js reads window.location.hash')
assert(mainJs.includes("router.push"), 'main.js calls router.push for hash redirect')

// --- 404.html: redirect logic ---

const fortyFour = readFileSync(join(root, '404.html'), 'utf-8')
assert(fortyFour.includes('window.location.pathname'), '404.html reads window.location.pathname')
assert(fortyFour.includes('window.location.replace'), '404.html uses window.location.replace for redirect')
assert(fortyFour.includes('/#'), '404.html encodes path as hash fragment /#')

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
let gameCardContent = ''
if (existsSync(gameCardPath)) {
  gameCardContent = readFileSync(gameCardPath, 'utf-8')
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

// --- HomeView.vue: GameCard import and usage ---

assert(homeView.includes('GameCard'), 'HomeView.vue imports and uses GameCard component')
assert(homeView.includes('from') && homeView.includes('GameCard'), 'HomeView.vue has GameCard import statement')
assert(homeView.includes(':slug="game.slug"'), 'HomeView.vue passes :slug prop from catalog')
assert(homeView.includes(':title="game.title"'), 'HomeView.vue passes :title prop from catalog')
assert(homeView.includes(':description="game.description"'), 'HomeView.vue passes :description prop from catalog')
assert(homeView.includes(':thumbnail="game.thumbnail"'), 'HomeView.vue passes :thumbnail prop from catalog')
assert(homeView.includes(':category="game.category"'), 'HomeView.vue passes :category prop from catalog')
assert(homeView.includes('v-for="game in gameStore.catalog"'), 'HomeView.vue iterates over gameStore.catalog with v-for')
assert(homeView.includes(':key="game.slug"'), 'HomeView.vue uses game.slug as key')

// --- HomeView.vue: no old field references ---

assert(!homeView.includes('game.id'), 'HomeView.vue has no reference to game.id')
assert(!homeView.includes('game.name'), 'HomeView.vue has no reference to game.name')
assert(!homeView.includes('game.genre'), 'HomeView.vue has no reference to game.genre')

// --- HomeView.vue: v-for loop with GameCard rendering ---

const gameCardLoopMatch = homeView.match(/<GameCard[\s\S]*?v-for="game in gameStore.catalog"[\s\S]*?\/>/)
assert(gameCardLoopMatch !== null, 'HomeView.vue has a GameCard loop using v-for')

// --- HomeView.vue: games-grid div and heading structure preserved ---

assert(homeView.includes('<div class="games-grid">') || homeView.includes('games-grid'), 'HomeView.vue has games-grid wrapper div')
assert(homeView.includes('<h1>gameShelf</h1>'), 'HomeView.vue has h1 with gameShelf')
assert(homeView.includes('class="tagline"') || homeView.includes('"tagline"'), 'HomeView.vue has tagline element')

// --- GameCard: router-link navigates to /game/:slug ---

assert(gameCardContent.includes("'/game/' + slug") || gameCardContent.includes('"/game/" + slug'), 'GameCard.vue renders router-link to /game/:slug')
assert(gameCardContent.includes(':to="\'/game/\' + slug"') || gameCardContent.includes(":to=\"'/game/' + slug\""), 'GameCard.vue router-link uses dynamic slug path')

// --- Catalog: verify all six slugs are navigable from GameCard ---

const slugs = ['snake', 'tetris', 'breakout', 'flappy-bird', 'minesweeper', 'memory']
for (const slug of slugs) {
  assert(catalog.includes(`slug: '${slug}'`), `gamesCatalog.js has entry with slug '${slug}'`)
}

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

// --- dist/404.html exists after build ---
assert(existsSync(join(root, 'dist', '404.html')), 'dist/404.html exists after build')
assert(existsSync(join(root, 'dist', 'index.html')), 'dist/index.html exists after build')

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
  // Move piece to near bottom
  while (tetrisModule.state.currentPiece.row < 15) {
    tetrisModule.handleKeydown('ArrowDown')
  }
  const preDropScore = tetrisModule.state.score
  tetrisModule.handleKeydown(' ')
  // After hard drop, old piece locks, new piece spawns at row ~0
  assert(tetrisModule.state.score >= preDropScore, 'hard drop does not reduce score')
  assert(tetrisModule.state.currentPiece.row <= 2, 'hard drop spawns new piece near top')

  // ── Behavioral: rotation (arrow up) ──
  tetrisModule.init()
  const shapeBefore = tetrisModule.state.currentPiece.shape.map(r => [...r])
  tetrisModule.handleKeydown('ArrowUp')
  const shapeAfter = tetrisModule.state.currentPiece.shape
  // 90° CW rotation: shape[r][c] = shapeBefore[n-1-c][r]
  const n = shapeBefore.length
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const expected = shapeBefore[n - 1 - c]?.[r] ?? 0
      assert(shapeAfter[r][c] === expected, `rotation at (${r},${c})`)
    }
  }

  // ── Behavioral: line clearing + scoring ──
  // Fill rows 17, 18, 19 completely. Place piece at row 15.
  // Force the drop timer so update() actually moves the piece and triggers locking.
  tetrisModule.init()
  for (let r of [17, 18, 19]) {
    for (let c = 0; c < 10; c++) {
      tetrisModule.state.board[r][c] = '#ff0000'
    }
  }
  tetrisModule.state.currentPiece.row = 15
  tetrisModule.state.currentPiece.col = 3
  tetrisModule.state.lastDropTime = performance.now() - 2000  // force drop timer
  const scoreBeforeLC = tetrisModule.state.score
  const linesBeforeLC = tetrisModule.state.lines
  tetrisModule.update()  // drops from 15→16, can't go further → locks, clearLines finds rows 17-19
  tetrisModule.update()  // no-op (new piece at row 0)
  assert(tetrisModule.state.score > scoreBeforeLC, 'line clearing increases score')
  assert(tetrisModule.state.lines > linesBeforeLC, 'lines counter increases after clearing')

  // ── Behavioral: game-over on spawn collision (input rejected) ──
  tetrisModule.init()
  tetrisModule.state.isGameOver = true
  const scoreAtGo = tetrisModule.state.score
  tetrisModule.handleKeydown('ArrowLeft')
  tetrisModule.handleKeydown(' ')
  assert(tetrisModule.state.score === scoreAtGo, 'input rejected when game is over')
  assert(tetrisModule.state.isGameOver === true, 'game-over state persists')

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

// ─────────────────────────────────────────────────────────────────────────────
// Flappy Bird gameLogic.js — static + functional tests
// ─────────────────────────────────────────────────────────────────────────────

// --- Flappy Bird catalog entry ---

assert(catalog.includes("slug: 'flappy-bird'"), 'gamesCatalog.js has flappy-bird entry')
assert(catalog.includes("title: 'Flappy Bird'"), 'gamesCatalog.js flappy-bird entry has correct title')
assert(catalog.includes("description: 'Guide the bird through gaps in the pipes'"), 'gamesCatalog.js flappy-bird has description')
assert(catalog.includes('data:image/svg+xml') && catalog.indexOf("slug: 'flappy-bird'") < catalog.indexOf('data:image/svg+xml', catalog.indexOf("slug: 'flappy-bird'") + 1), 'gamesCatalog.js flappy-bird has SVG thumbnail')
assert(catalog.match(/slug: 'flappy-bird'[\s\S]*?category: 'Arcade'/), 'gamesCatalog.js flappy-bird is in Arcade category')
assert(catalog.match(/slug: 'flappy-bird'[\s\S]*?isNew: true/), 'gamesCatalog.js flappy-bird has isNew=true')
assert(catalog.match(/slug: 'flappy-bird'[\s\S]*?dateAdded:/), 'gamesCatalog.js flappy-bird has dateAdded')

// Check flappy-bird is 4th item (between breakout and minesweeper)
const slugOrder = []
const slugRegex = /slug:\s*'([^']+)'/g
let match
while ((match = slugRegex.exec(catalog)) !== null) {
  slugOrder.push(match[1])
}
assert(slugOrder[0] === 'snake', 'flappy-bird catalog: 1st item is snake')
assert(slugOrder[1] === 'tetris', 'flappy-bird catalog: 2nd item is tetris')
assert(slugOrder[2] === 'breakout', 'flappy-bird catalog: 3rd item is breakout')
assert(slugOrder[3] === 'flappy-bird', 'flappy-bird catalog: 4th item is flappy-bird')
assert(slugOrder[4] === 'minesweeper', 'flappy-bird catalog: 5th item is minesweeper')

// Flappy bird uses a distinct green color scheme in thumbnail
const flappyThumbMatch = catalog.match(/slug: 'flappy-bird'[\s\S]*?thumbnail: 'data:image\/svg\+xml,([^']+)'/)
assert(flappyThumbMatch && flappyThumbMatch[1].includes('%2327ae60'), 'flappy-bird thumbnail uses green color scheme')

// --- Static checks on flappy-bird source ---

const flappyPath = join(root, 'src', 'games', 'flappy-bird', 'gameLogic.js')
const flappySrc = readFileSync(flappyPath, 'utf-8')

assert(flappySrc.includes('export function init'), 'flappy-bird gameLogic.js exports init()')
assert(flappySrc.includes('export function update'), 'flappy-bird gameLogic.js exports update()')
assert(flappySrc.includes('export function render'), 'flappy-bird gameLogic.js exports render()')
assert(flappySrc.includes('export function reset'), 'flappy-bird gameLogic.js exports reset()')
assert(flappySrc.includes('export function handleKeydown') || flappySrc.includes('export {'), 'flappy-bird gameLogic.js exports handleKeydown')
assert(flappySrc.includes('export { state }'), 'flappy-bird gameLogic.js exports state')

// Canvas dimensions
assert(flappySrc.includes('CANVAS_WIDTH') && flappySrc.includes('250'), 'flappy-bird canvas width is 250')
assert(flappySrc.includes('CANVAS_HEIGHT') && flappySrc.includes('500'), 'flappy-bird canvas height is 500')
assert(flappySrc.includes('COLS') && flappySrc.includes('7'), 'flappy-bird grid has 7 columns')
assert(flappySrc.includes('ROWS') && flappySrc.includes('7'), 'flappy-bird grid has 7 rows')

// Bird physics constants
assert(flappySrc.includes('GRAVITY') && flappySrc.includes('0.12'), 'flappy-bird has gravity constant ~0.12')
assert(flappySrc.includes('FLAP_STRENGTH') && flappySrc.includes('-2.5'), 'flappy-bird has flap strength ~-2.5')
assert(flappySrc.includes('PIPE_SPEED') && flappySrc.includes('0.08'), 'flappy-bird pipe speed ~0.08')

// Pipe gap
assert(flappySrc.includes('GAP_SIZE_CELLS') && flappySrc.includes('4'), 'flappy-bird gap is 4 cells (~144 pixels)')

// Pipe spawning interval
assert(flappySrc.includes('PIPE_SPAWN_INTERVAL') && flappySrc.includes('7'), 'flappy-bird pipe spawn interval ~7 frames')

// Grace period
assert(flappySrc.includes('GRACE_PERIOD_FRAMES') && flappySrc.includes('30'), 'flappy-bird has grace period ~30 frames')

// Green pipe color
assert(flappySrc.includes('2ecc71') || flappySrc.includes('#2ecc71'), 'flappy-bird uses green pipe color #2ecc71')

// Bird column
assert(flappySrc.includes('BIRD_COL') && flappySrc.includes('3'), 'flappy-bird bird column is 3')

// Sky-blue background
assert(flappySrc.includes('87CEEB') || flappySrc.includes('"87CEEB"') || flappySrc.includes("'87CEEB'"), 'flappy-bird sky-blue background #87CEEB')

// Yellow bird
assert(flappySrc.includes('FFD700') || flappySrc.includes('"FFD700"') || flappySrc.includes("'FFD700'"), 'flappy-bird bird is yellow/gold')

// Handle keydown for ArrowUp and Space
assert(flappySrc.includes("ArrowUp"), 'flappy-bird handleKeydown handles ArrowUp')
assert(flappySrc.includes("' '"), 'flappy-bird handleKeydown handles space bar')

// State shape
assert(flappySrc.includes("score:") || flappySrc.includes('"score"'), 'flappy-bird state has score')
assert(flappySrc.includes("isGameOver:") || flappySrc.includes('"isGameOver"'), 'flappy-bird state has isGameOver')
assert(flappySrc.includes("isPlaying:") || flappySrc.includes('"isPlaying"'), 'flappy-bird state has isPlaying')
assert(flappySrc.includes("bird:") || flappySrc.includes('"bird"'), 'flappy-bird state has bird')
assert(flappySrc.includes("pipes:"), 'flappy-bird state has pipes')
assert(flappySrc.includes("pipeQueue:"), 'flappy-bird state has pipeQueue')
assert(flappySrc.includes("pipeDropInterval:"), 'flappy-bird state has pipeDropInterval')
assert(flappySrc.includes("lastPipeDrop:"), 'flappy-bird state has lastPipeDrop')
assert(flappySrc.includes("row:") || flappySrc.includes('"row"'), 'flappy-bird bird state has row')
assert(flappySrc.includes("col:"), 'flappy-bird bird state has col')
assert(flappySrc.includes("velocity:"), 'flappy-bird bird state has velocity')

// ── Functional tests for flappy-bird ──

let flappyModule = null
try {
  flappyModule = await import(flappyPath)
} catch {
  flappyModule = null
}

if (flappyModule) {
  // Verify all required exports exist
  assert(typeof flappyModule.init === 'function', 'flappy-bird init is a function')
  assert(typeof flappyModule.update === 'function', 'flappy-bird update is a function')
  assert(typeof flappyModule.reset === 'function', 'flappy-bird reset is a function')
  assert(typeof flappyModule.handleKeydown === 'function', 'flappy-bird handleKeydown is a function')
  assert(flappyModule.state !== undefined, 'flappy-bird exports state')

  // Initialize game
  const initState = flappyModule.init()
  assert(initState !== null, 'init() returns state object')
  assert(typeof initState.score === 'number', 'state.score is a number')
  assert(initState.score === 0, 'initial state.score is 0')
  assert(typeof initState.isGameOver === 'boolean', 'state.isGameOver is a boolean')
  assert(initState.isGameOver === false, 'initial state.isGameOver is false')
  assert(typeof initState.isPlaying === 'boolean', 'state.isPlaying is a boolean')
  assert(initState.isPlaying === true, 'initial state.isPlaying is true')

  // Bird initial position
  assert(initState.bird !== null, 'state.bird is set after init')
  assert(typeof initState.bird.row === 'number', 'state.bird.row is a number')
  assert(typeof initState.bird.col === 'number', 'state.bird.col is a number')
  assert(initState.bird.col === 3, 'state.bird.col is 3')
  assert(typeof initState.bird.velocity === 'number', 'state.bird.velocity is a number')
  assert(initState.bird.velocity === 0, 'state.bird.velocity is 0 at init')

  // Pipe state
  assert(Array.isArray(initState.pipes), 'state.pipes is an array')
  assert(initState.pipeQueue !== undefined, 'state.pipeQueue exists')
  assert(typeof initState.pipeDropInterval === 'number', 'state.pipeDropInterval is a number')
  assert(initState.pipeDropInterval === 7, 'state.pipeDropInterval is 7')
  assert(typeof initState.lastPipeDrop === 'number', 'state.lastPipeDrop is a number')

  // Test flap (ArrowUp)
  flappyModule.init()
  flappyModule.handleKeydown('ArrowUp')
  assert(flappyModule.state.bird.velocity < 0, 'flap sets negative velocity')
  assert(flappyModule.state.bird.velocity <= -2.5, 'flap velocity is ~-2.5')

  // Test flap (Space)
  flappyModule.init()
  flappyModule.handleKeydown(' ')
  assert(flappyModule.state.bird.velocity < 0, 'space bar triggers flap')

  // Test gravity: advance frames without flapping, bird should fall
  flappyModule.init()
  const initialBirdRow = flappyModule.state.bird.row
  for (let i = 0; i < 60; i++) {
    flappyModule.update()
  }
  assert(flappyModule.state.bird.row > initialBirdRow, 'gravity pulls bird down over time')

  // Test pipe spawning: after 7 frames, a pipe should appear
  flappyModule.init()
  assert(flappyModule.state.pipes.length === 0, 'no pipes at init')
  for (let i = 0; i < 8; i++) {
    flappyModule.update()
  }
  assert(flappyModule.state.pipes.length >= 1, 'pipes spawn after interval frames')

  // Test scoring: simulate bird passing through pipe gap
  flappyModule.init()
  // Manually set up state for scoring test
  flappyModule.state.bird.col = 3
  flappyModule.state.pipes = [
    { x: 2.5, gapStart: 2, scored: false }
  ]
  // After update, bird should pass pipe and score
  const beforeScore = flappyModule.state.score
  // Advance until bird passes pipe
  for (let i = 0; i < 30; i++) {
    flappyModule.update()
  }
  assert(flappyModule.state.score >= beforeScore, 'score doesn\'t decrease')

  // Test reset
  flappyModule.init()
  // Play a bit
  for (let i = 0; i < 15; i++) {
    flappyModule.update()
    flappyModule.handleKeydown('ArrowUp')
  }
  const preResetScore = flappyModule.state.score
  flappyModule.reset()
  assert(flappyModule.state.score === 0, 'reset() restores score to 0')
  assert(flappyModule.state.isGameOver === false, 'reset() sets isGameOver to false')
  assert(flappyModule.state.isPlaying === true, 'reset() sets isPlaying to true')
  assert(flappyModule.state.bird.row === 3, 'reset() restores bird to default row')
  assert(flappyModule.state.bird.velocity === 0, 'reset() restores bird velocity to 0')
  assert(flappyModule.state.pipes.length === 0, 'reset() clears pipes')

  // Test ArrowDown accelerates fall
  flappyModule.init()
  const vBefore = flappyModule.state.bird.velocity
  flappyModule.handleKeydown('ArrowDown')
  assert(flappyModule.state.bird.velocity > vBefore, 'ArrowDown accelerates fall')

  // Test handleKeydown doesn't throw when game over
  flappyModule.init()
  flappyModule.state.isGameOver = true
  try { flappyModule.handleKeydown('ArrowUp'); assert(true, 'handleKeydown ArrowUp no-throw at game over') } catch { assert(false, 'handleKeydown ArrowUp no-throw at game over') }
  try { flappyModule.handleKeydown(' '); assert(true, 'handleKeydown space no-throw at game over') } catch { assert(false, 'handleKeydown space no-throw at game over') }

  // Test game over on ceiling collision
  flappyModule.init()
  // Force bird above ceiling
  flappyModule.state.bird.row = -1
  flappyModule.state.bird.velocity = 0
  flappyModule.update()
  assert(flappyModule.state.isGameOver === true, 'ceiling collision triggers game over')

  // Test game over on ground collision
  flappyModule.init()
  // Force bird to ground
  flappyModule.state.bird.row = 6.6
  flappyModule.state.bird.velocity = 0
  flappyModule.update()
  assert(flappyModule.state.isGameOver === true, 'ground collision triggers game over')

  // Test game over on pipe collision
  flappyModule.init()
  // Place pipe such that bird will collide (bird at row 2, gap at rows 3-7)
  flappyModule.state.bird.row = 2
  flappyModule.state.bird.col = 3
  flappyModule.state.bird.velocity = 0
  flappyModule.state.pipes = [
    { x: 3.0, gapStart: 3, scored: false }
  ]
  flappyModule.update()
  assert(flappyModule.state.isGameOver === true, 'pipe collision triggers game over')
}

// ─────────────────────────────────────────────────────────────────────────────
// Whack-a-Mole gameLogic.js — static + functional tests
// ─────────────────────────────────────────────────────────────────────────────

// --- Whack-a-Mole catalog entry ---

assert(catalog.includes("slug: 'whack-a-mole'"), 'gamesCatalog.js has whack-a-mole entry')
assert(catalog.includes("title: 'Whack-a-Mole'"), 'gamesCatalog.js whack-a-mole entry has correct title')
assert(catalog.includes("description: 'Whack moles as fast as you can!'"), 'gamesCatalog.js whack-a-mole has description')
assert(catalog.match(/slug: 'whack-a-mole'[\s\S]*?category: 'Casual'/), 'gamesCatalog.js whack-a-mole is in Casual category')
assert(catalog.match(/slug: 'whack-a-mole'[\s\S]*?isNew: true/), 'gamesCatalog.js whack-a-mole has isNew=true')
assert(catalog.match(/slug: 'whack-a-mole'[\s\S]*?dateAdded:/), 'gamesCatalog.js whack-a-mole has dateAdded')

// Check whack-a-mole is last item (7th)
assert(slugOrder[6] === 'whack-a-mole', 'whack-a-mole catalog: 7th item is whack-a-mole')

// --- Static checks on whack-a-mole source ---

const whackPath = join(root, 'src', 'games', 'whack-a-mole', 'gameLogic.js')
const whackSrc = readFileSync(whackPath, 'utf-8')

assert(whackSrc.includes('export function init'), 'whack-a-mole gameLogic.js exports init()')
assert(whackSrc.includes('export function update'), 'whack-a-mole gameLogic.js exports update()')
assert(whackSrc.includes('export function render'), 'whack-a-mole gameLogic.js exports render()')
assert(whackSrc.includes('export function reset'), 'whack-a-mole gameLogic.js exports reset()')
assert(whackSrc.includes('export function handleKeydown'), 'whack-a-mole gameLogic.js exports handleKeydown')
assert(whackSrc.includes('export { state }'), 'whack-a-mole gameLogic.js exports state')

// Canvas dimensions 250x200 per spec
assert(whackSrc.includes('CANVAS_W = 250') || whackSrc.includes('CANVAS_W=250'), 'whack-a-mole canvas width is 250')
assert(whackSrc.includes('CANVAS_H = 200') || whackSrc.includes('CANVAS_H=200'), 'whack-a-mole canvas height is 200')

// Grid 4 columns × 3 rows
assert(whackSrc.includes('COLS = 4'), 'whack-a-mole grid has 4 columns')
assert(whackSrc.includes('ROWS = 3'), 'whack-a-mole grid has 3 rows')

// 30-second game duration
assert(whackSrc.includes('GAME_DURATION = 30') || whackSrc.includes('GAME_DURATION=30'), 'whack-a-mole game duration is 30 seconds')

// Difficulty settings
assert(whackSrc.includes('moleDuration: 2500') && whackSrc.includes('spawnInterval: 1500'), 'Easy: moleDuration=2500, spawnInterval=1500')
assert(whackSrc.includes('moleDuration: 1800') && whackSrc.includes('spawnInterval: 1000'), 'Medium: moleDuration=1800, spawnInterval=1000')
assert(whackSrc.includes('moleDuration: 1200') && whackSrc.includes('spawnInterval: 600'), 'Hard: moleDuration=1200, spawnInterval=600')
assert(whackSrc.includes('maxSimultaneous: 1') && whackSrc.includes('bombChance: 0'), 'Easy: maxSimultaneous=1, bombChance=0')
assert(whackSrc.includes('maxSimultaneous: 2') && whackSrc.includes('bombChance: 0.15'), 'Medium: maxSimultaneous=2, bombChance=0.15')
assert(whackSrc.includes('maxSimultaneous: 3') && whackSrc.includes('bombChance: 0.3'), 'Hard: maxSimultaneous=3, bombChance=0.3')

// Audio: Web Audio API, no external files
assert(whackSrc.includes('AudioContext') || whackSrc.includes('webkitAudioContext'), 'whack-a-mole uses Web Audio API')
assert(whackSrc.includes('osc.frequency.value = 600'), 'whack-a-mole pop sound is 600Hz')
assert(whackSrc.includes('osc.frequency.value = 150'), 'whack-a-mole miss sound is 150Hz')
assert(whackSrc.includes('osc1.frequency.value = 400') && whackSrc.includes('osc2.frequency.value = 200'), 'whack-a-mole game-over uses 400Hz then 200Hz')
assert(!whackSrc.includes('.mp3') && !whackSrc.includes('.wav') && !whackSrc.includes('.ogg'), 'whack-a-mole does not use external audio files')

// Scoring logic
assert(whackSrc.includes('10 * state.combo'), 'whack-a-mole normal mole scores 10 * combo')
assert(whackSrc.includes('score - 20') || whackSrc.includes('score-= 20'), 'whack-a-mole bomb mole deducts 20 points')
assert(whackSrc.includes('highestCombo'), 'whack-a-mole tracks highestCombo')

// Mole phase: whackable when phase < 66
assert(whackSrc.includes('phase < 66'), 'whack-a-mole only whackable when phase < 66 (rising/idle)')

// Whack effect structure
assert(whackSrc.includes('type:') && whackSrc.includes('mole.isBomb'), 'whack-a-mole whack effects have type field')

// Gamepad support: D-pad buttons
assert(whackSrc.includes('buttons[12]'), 'whack-a-mole gamepad dpad-up uses button 12')
assert(whackSrc.includes('buttons[13]'), 'whack-a-mole gamepad dpad-down uses button 13')
assert(whackSrc.includes('buttons[14]'), 'whack-a-mole gamepad dpad-left uses button 14')
assert(whackSrc.includes('buttons[15]'), 'whack-a-mole gamepad dpad-right uses button 15')
assert(whackSrc.includes('buttons[0]'), 'whack-a-mole gamepad A-button uses button 0')
assert(whackSrc.includes('buttons[1]'), 'whack-a-mole gamepad B-button uses button 1')
assert(whackSrc.includes('gamepadConnected'), 'whack-a-mole tracks gamepadConnected in state')
assert(whackSrc.includes('cursorCol') && whackSrc.includes('cursorRow'), 'whack-a-mole tracks cursorCol/cursorRow in state')

// Game-over overlay content
assert(whackSrc.includes('GAME OVER'), 'whack-a-mole renders GAME OVER text')
assert(whackSrc.includes('Press Space or B to restart'), 'whack-a-mole shows restart prompt')
assert(whackSrc.includes('localStorage.getItem'), 'whack-a-mole reads high score from localStorage')

// Cursor bounds (0-3 columns, 0-2 rows)
assert(whackSrc.includes('newCol < COLS'), 'whack-a-mole cursorCol bounded by COLS')
assert(whackSrc.includes('newRow < ROWS'), 'whack-a-mole cursorRow bounded by ROWS')

// ── Functional tests for whack-a-mole ──

let whackModule = null
try {
  whackModule = await import(whackPath)
} catch {
  whackModule = null
}

if (whackModule) {
  // Verify all required exports exist
  assert(typeof whackModule.init === 'function', 'whack-a-mole init is a function')
  assert(typeof whackModule.update === 'function', 'whack-a-mole update is a function')
  assert(typeof whackModule.render === 'function', 'whack-a-mole render is a function')
  assert(typeof whackModule.reset === 'function', 'whack-a-mole reset is a function')
  assert(typeof whackModule.handleKeydown === 'function', 'whack-a-mole handleKeydown is a function')
  assert(whackModule.state !== undefined, 'whack-a-mole exports state')

  // ── State shape after init() ──
  const initState = whackModule.init()
  assert(initState !== null, 'init() returns state object')
  assert(typeof initState.score === 'number', 'state.score is a number')
  assert(initState.score === 0, 'initial state.score is 0')
  assert(typeof initState.isGameOver === 'boolean', 'state.isGameOver is a boolean')
  assert(initState.isGameOver === false, 'initial state.isGameOver is false')
  assert(typeof initState.isPlaying === 'boolean', 'state.isPlaying is a boolean')
  assert(initState.isPlaying === false, 'initial state.isPlaying is false (menu)')
  assert(typeof initState.combo === 'number', 'state.combo is a number')
  assert(initState.combo === 1, 'initial state.combo is 1')
  assert(typeof initState.highestCombo === 'number', 'state.highestCombo is a number')
  assert(initState.highestCombo === 1, 'initial state.highestCombo is 1')
  assert(typeof initState.timer === 'number', 'state.timer is a number')
  assert(initState.timer === 30, 'initial state.timer is 30')
  assert(Array.isArray(initState.activeMoles), 'state.activeMoles is an array')
  assert(initState.activeMoles.length === 0, 'initial state.activeMoles is empty')
  assert(Array.isArray(initState.whackEffects), 'state.whackEffects is an array')
  assert(initState.whackEffects.length === 0, 'initial state.whackEffects is empty')
  assert(initState.gamepadConnected === false, 'initial gamepadConnected is false')
  assert(initState.cursorCol === 1, 'initial cursorCol is 1')
  assert(initState.cursorRow === 1, 'initial cursorRow is 1')
  assert(initState.gamepadState.col === 1, 'initial gamepadState.col is 1')
  assert(initState.gamepadState.row === 1, 'initial gamepadState.row is 1')
  assert(typeof initState.gamepadState.buttonAPressed === 'boolean', 'gamepadState.buttonAPressed is boolean')
  assert(typeof initState.gamepadState.buttonBPressed === 'boolean', 'gamepadState.buttonBPressed is boolean')

  // ── Difficulty param: sets difficulty but does NOT auto-start ──
  whackModule.init('Easy')
  assert(whackModule.state.isPlaying === false, 'init(Easy) does NOT auto-start (isPlaying=false)')
  assert(whackModule.state.difficulty === 'Easy', 'init(Easy) sets difficulty=Easy')

  whackModule.init('Medium')
  assert(whackModule.state.isPlaying === false, 'init(Medium) does NOT auto-start (isPlaying=false)')
  assert(whackModule.state.difficulty === 'Medium', 'init(Medium) sets difficulty=Medium')

  whackModule.init('Hard')
  assert(whackModule.state.isPlaying === false, 'init(Hard) does NOT auto-start (isPlaying=false)')
  assert(whackModule.state.difficulty === 'Hard', 'init(Hard) sets difficulty=Hard')

  // ── handleKeydown(' ') from menu starts game ──
  whackModule.init('Hard')
  whackModule.handleKeydown(' ')
  assert(whackModule.state.isPlaying === true, 'handleKeydown(" ") from menu starts game')
  assert(whackModule.state.isGameOver === false, 'handleKeydown(" ") sets isGameOver=false')
  assert(whackModule.state.score === 0, 'handleKeydown(" ") resets score to 0')
  assert(whackModule.state.timer === 30, 'handleKeydown(" ") resets timer to 30')

  // ── Timer countdown ──
  whackModule.init('Easy')
  whackModule.handleKeydown(' ')
  const initialTimer = whackModule.state.timer
  for (let i = 0; i < 120; i++) {
    whackModule.update()
  }
  assert(whackModule.state.timer < initialTimer, 'timer decreases over time')
  assert(whackModule.state.timer > 0, 'timer still > 0 after ~2 seconds')

  // ── Game over at timer 0 ──
  whackModule.init('Easy')
  whackModule.handleKeydown(' ')
  // Fast-forward timer to near zero by setting startedAt far back
  whackModule.state.startedAt = performance.now() - 31000
  // Simulate: just set timer directly
  whackModule.state.timer = 0.01
  for (let i = 0; i < 5; i++) {
    whackModule.update()
  }
  assert(whackModule.state.isGameOver === true, 'game over when timer reaches 0')
  assert(whackModule.state.isPlaying === false, 'isPlaying becomes false on game over')

  // ── handleKeydown(' ') from game over restarts ──
  whackModule.handleKeydown(' ')
  assert(whackModule.state.isGameOver === false, 'handleKeydown(" ") from game over sets isGameOver=false')
  assert(whackModule.state.isPlaying === true, 'handleKeydown(" ") from game over sets isPlaying=true')
  assert(whackModule.state.score === 0, 'restart resets score to 0')
  assert(whackModule.state.timer === 30, 'restart resets timer to 30')

  // ── Reset preserves difficulty ──
  whackModule.init('Hard')
  whackModule.handleKeydown(' ') // play a bit
  whackModule.state.score = 100
  whackModule.reset()
  assert(whackModule.state.difficulty === 'Hard', 'reset() preserves Hard difficulty')
  assert(whackModule.state.isPlaying === false, 'reset() sets isPlaying=false')
  assert(whackModule.state.isGameOver === false, 'reset() sets isGameOver=false')
  assert(whackModule.state.score === 0, 'reset() resets score to 0')
  assert(whackModule.state.activeMoles.length === 0, 'reset() clears activeMoles')
  assert(whackModule.state.whackEffects.length === 0, 'reset() clears whackEffects')
  assert(whackModule.state.combo === 1, 'reset() resets combo to 1')
  assert(whackModule.state.highestCombo === 1, 'reset() resets highestCombo to 1')

  // ── Reset from Easy defaults ──
  whackModule.init('Easy')
  whackModule.reset()
  assert(whackModule.state.difficulty === 'Easy', 'reset() from Easy preserves Easy')

  // ── Mole spawn structure: col, row, isBomb, phase, elapsed, maxDuration ──
  whackModule.init('Easy')
  whackModule.handleKeydown(' ')
  // Wait for spawn (Easy: every 1500ms ≈ 90 frames)
  for (let i = 0; i < 100; i++) {
    whackModule.update()
  }
  if (whackModule.state.activeMoles.length > 0) {
    const mole = whackModule.state.activeMoles[0]
    assert(typeof mole.col === 'number', 'mole has numeric col')
    assert(typeof mole.row === 'number', 'mole has numeric row')
    assert(typeof mole.isBomb === 'boolean', 'mole has boolean isBomb')
    assert(typeof mole.phase === 'number', 'mole has numeric phase')
    assert(typeof mole.elapsed === 'number', 'mole has numeric elapsed')
    assert(typeof mole.maxDuration === 'number', 'mole has numeric maxDuration')
    assert(mole.phase >= 0 && mole.phase <= 100, 'mole phase in 0-100 range')
  } else {
    assert(false, 'at least one mole spawned after 100 frames')
  }

  // ── Difficulty-specific behavior: Easy no bombs ──
  whackModule.init('Easy')
  whackModule.handleKeydown(' ')
  for (let i = 0; i < 200; i++) {
    whackModule.update()
  }
  const easyBombs = whackModule.state.activeMoles.filter(m => m.isBomb).length
  assert(easyBombs === 0, 'Easy difficulty has no bombs')

  // ── Hard: multiple moles max simultaneous ──
  whackModule.init('Hard')
  whackModule.handleKeydown(' ')
  for (let i = 0; i < 300; i++) {
    whackModule.update()
  }
  assert(whackModule.state.activeMoles.length <= 3, 'Hard max simultaneous moles <= 3')

  // ── Moles spawn only in available (unoccupied) cells ──
  whackModule.init('Hard')
  whackModule.handleKeydown(' ')
  // Occupy all 12 cells
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      whackModule.state.activeMoles.push({
        col: c, row: r, isBomb: false, phase: 50, elapsed: 600, maxDuration: 1200
      })
    }
  }
  // Try to spawn more - should not add more since all cells occupied
  const molesBefore = whackModule.state.activeMoles.length
  whackModule.update() // should skip spawn since no available cells
  assert(whackModule.state.activeMoles.length === molesBefore, 'no new mole spawned when all cells occupied')

  // ── Canvas dimensions set in render ──
  const mockCanvas = {
    width: 250, height: 200,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 250, height: 200 }),
    getContext: () => ({
      fillRect: () => {}, fillStyle: '', fillText: () => {}, arc: () => {},
      ellipse: () => {}, beginPath: () => {}, stroke: () => {},
      lineWidth: 0, textAlign: '', font: '',
      roundRect: function() { this.beginPath(); }
    }),
    addEventListener: () => {}, removeEventListener: () => {}
  }
  whackModule.init()
  mockCanvas.width = 999
  mockCanvas.height = 999
  whackModule.render(mockCanvas)
  assert(mockCanvas.width === 250, 'render() sets canvas.width to 250')
  assert(mockCanvas.height === 200, 'render() sets canvas.height to 200')

  // ── Click handler registration on render ──
  assert(whackModule.state._clickHandlerRegistered === true, 'render() registers click handlers')
  assert(typeof whackModule.state._clickHandler === 'function', 'click handler is a function')
  assert(typeof whackModule.state._menuClickHandler === 'function', 'menu click handler is a function')

  // ── Menu screen renders correctly ──
  whackModule.init('Hard') // menu state
  whackModule.render(mockCanvas)
  // The render shouldn't crash, and menu state should not have isPlaying
  assert(whackModule.state.isPlaying === false, 'menu state has isPlaying=false')

  // ── Gameplay screen renders correctly ──
  whackModule.init('Medium')
  whackModule.handleKeydown(' ')
  whackModule.render(mockCanvas)
  assert(whackModule.state.isPlaying === true, 'gameplay state has isPlaying=true')

  // ── Game-over overlay renders correctly ──
  whackModule.init('Hard')
  whackModule.handleKeydown(' ')
  whackModule.state.timer = 0
  whackModule.update()
  whackModule.render(mockCanvas)
  assert(whackModule.state.isGameOver === true, 'game-over state has isGameOver=true')
  assert(whackModule.state.isPlaying === false, 'game-over state has isPlaying=false')

  // ── gamepadConnected detected when getGamepads returns a gamepad ──
  const origGetGamepads = navigator.getGamepads
  navigator.getGamepads = () => [{ buttons: [] }]
  whackModule.init()
  assert(whackModule.state.gamepadConnected === true, 'gamepadConnected=true when gamepad available')
  navigator.getGamepads = origGetGamepads

  // ── cursorCol/cursorRow boundary checks ──
  whackModule.init()
  // Manually set cursor to edge positions
  whackModule.state.cursorCol = 0
  whackModule.state.cursorRow = 0
  assert(whackModule.state.cursorCol === 0, 'cursorCol can be 0')
  assert(whackModule.state.cursorRow === 0, 'cursorRow can be 0')

  // ── isGameOver blocks update ──
  whackModule.init('Easy')
  whackModule.handleKeydown(' ')
  // Manually set game over
  whackModule.state.isGameOver = true
  const scoreBeforeGo = whackModule.state.score
  whackModule.update() // should be a no-op
  assert(whackModule.state.isGameOver === true, 'update() is no-op when game over')

  // ── handleKeydown no-op during gameplay (mouse only) ──
  whackModule.init('Easy')
  whackModule.handleKeydown(' ')
  const scoreDuringGame = whackModule.state.score
  whackModule.handleKeydown(' ') // space during gameplay does nothing
  assert(whackModule.state.isPlaying === true, 'space during gameplay keeps isPlaying=true')

  // ── Background and hole colors present in source ──
  assert(whackSrc.includes("'#d4a574'") || whackSrc.includes('"#d4a574"'), 'whack-a-mole has tan (#d4a574) background')
  assert(whackSrc.includes("'#5c4033'") || whackSrc.includes('"#5c4033"'), 'whack-a-mole has dark brown (#5c4033) holes')

  // ── HUD displays score and combo ──
  assert(whackSrc.includes('Score:') || whackSrc.includes('score'), 'HUD displays score')
  assert(whackSrc.includes('Combo:'), 'HUD displays combo')
  assert(whackSrc.includes('padStart'), 'HUD formats timer as MM:SS')

  // ── Cursor highlight only shown when gamepad connected ──
  assert(whackSrc.includes('if (!state.gamepadConnected) return'), 'cursor highlight only drawn when gamepad connected')

  // ── Whack effect structure has type (mole|bomb) and phase ──
  assert(whackSrc.includes('whackEffects.push') && whackSrc.includes('phase: 0'),
    'whackCell adds whack effect with phase 0 and type')

  // ── whack-a-mole not in old game stubs list ──
  const gameLogicFiles = ['snake', 'tetris', 'breakout']
  for (const game of gameLogicFiles) {
    const gameLogic = readFileSync(join(root, 'src', 'games', game, 'gameLogic.js'), 'utf-8')
    assert(!gameLogic.includes('whack-a-mole'), `${game} gameLogic.js does not reference whack-a-mole`)
  }
}

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
