
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

// --- Summary ---

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exit(1)
}
