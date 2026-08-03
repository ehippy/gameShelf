import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// --- Directory structure ---

describe('Directory structure', () => {
  it('src/ directory exists', () => {
    expect(existsSync(join(root, 'src'))).toBe(true)
  })

  it('src/main.js exists', () => {
    expect(existsSync(join(root, 'src', 'main.js'))).toBe(true)
  })

  it('src/App.vue exists', () => {
    expect(existsSync(join(root, 'src', 'App.vue'))).toBe(true)
  })

  it('vite.config.js exists', () => {
    expect(existsSync(join(root, 'vite.config.js'))).toBe(true)
  })

  it('src/router/index.js exists', () => {
    expect(existsSync(join(root, 'src', 'router', 'index.js'))).toBe(true)
  })

  it('src/assets/styles.css exists', () => {
    expect(existsSync(join(root, 'src', 'assets', 'styles.css'))).toBe(true)
  })

  it('404.html exists at project root', () => {
    expect(existsSync(join(root, '404.html'))).toBe(true)
  })

  it('src/stores/gameStore.js exists', () => {
    expect(existsSync(join(root, 'src', 'stores', 'gameStore.js'))).toBe(true)
  })

  it('src/stores/scoreStore.js exists', () => {
    expect(existsSync(join(root, 'src', 'stores', 'scoreStore.js'))).toBe(true)
  })

  it('src/stores/userStore.js exists', () => {
    expect(existsSync(join(root, 'src', 'stores', 'userStore.js'))).toBe(true)
  })

  it('src/views/HomeView.vue exists', () => {
    expect(existsSync(join(root, 'src', 'views', 'HomeView.vue'))).toBe(true)
  })

  it('src/views/AboutView.vue exists', () => {
    expect(existsSync(join(root, 'src', 'views', 'AboutView.vue'))).toBe(true)
  })

  it('src/views/GamePage.vue exists', () => {
    expect(existsSync(join(root, 'src', 'views', 'GamePage.vue'))).toBe(true)
  })

  it('src/views/HighScoresView.vue exists', () => {
    expect(existsSync(join(root, 'src', 'views', 'HighScoresView.vue'))).toBe(true)
  })

  it('src/views/NotFoundView.vue exists', () => {
    expect(existsSync(join(root, 'src', 'views', 'NotFoundView.vue'))).toBe(true)
  })

  it('src/components/AppHeader.vue exists', () => {
    expect(existsSync(join(root, 'src', 'components', 'AppHeader.vue'))).toBe(true)
  })

  it('src/components/AppFooter.vue exists', () => {
    expect(existsSync(join(root, 'src', 'components', 'AppFooter.vue'))).toBe(true)
  })

  it('src/components/GameCard.vue exists', () => {
    expect(existsSync(join(root, 'src', 'components', 'GameCard.vue'))).toBe(true)
  })

  it('src/components/MostPlayedCarousel.vue exists', () => {
    expect(existsSync(join(root, 'src', 'components', 'MostPlayedCarousel.vue'))).toBe(true)
  })

  it('src/components/RandomGameBtn.vue exists', () => {
    expect(existsSync(join(root, 'src', 'components', 'RandomGameBtn.vue'))).toBe(true)
  })

  it('src/components/WhatsNew.vue exists', () => {
    expect(existsSync(join(root, 'src', 'components', 'WhatsNew.vue'))).toBe(true)
  })

  it('src/games/snake/gameLogic.js exists', () => {
    expect(existsSync(join(root, 'src', 'games', 'snake', 'gameLogic.js'))).toBe(true)
  })

  it('src/games/tetris/gameLogic.js exists', () => {
    expect(existsSync(join(root, 'src', 'games', 'tetris', 'gameLogic.js'))).toBe(true)
  })

  it('src/games/breakout/gameLogic.js exists', () => {
    expect(existsSync(join(root, 'src', 'games', 'breakout', 'gameLogic.js'))).toBe(true)
  })

  it('src/games/flappy-bird/gameLogic.js exists', () => {
    expect(existsSync(join(root, 'src', 'games', 'flappy-bird', 'gameLogic.js'))).toBe(true)
  })

  it('src/games/whack-a-mole/gameLogic.js exists', () => {
    expect(existsSync(join(root, 'src', 'games', 'whack-a-mole', 'gameLogic.js'))).toBe(true)
  })

  it('src/data/gamesCatalog.js exists', () => {
    expect(existsSync(join(root, 'src', 'data', 'gamesCatalog.js'))).toBe(true)
  })
})

// --- package.json ---

describe('package.json', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8'))

  it('name is "gameShelf"', () => {
    expect(pkg.name).toBe('gameShelf')
  })

  it('description is correct', () => {
    expect(pkg.description).toBe('A collection of browser-based games')
  })

  it('type is "module"', () => {
    expect(pkg.type).toBe('module')
  })

  it('dev script runs vite', () => {
    expect(pkg.scripts.dev).toBe('vite')
  })

  it('build script runs vite build', () => {
    expect(pkg.scripts.build).toBe('vite build')
  })

  it('preview script runs vite preview', () => {
    expect(pkg.scripts.preview).toBe('vite preview')
  })

  it('test script runs vitest run', () => {
    expect(pkg.scripts.test).toBe('vitest run')
  })

  it('has vue dependency', () => {
    expect(pkg.devDependencies.vue).toBeTruthy()
  })

  it('has vue-router dependency', () => {
    expect(pkg.devDependencies['vue-router']).toBeTruthy()
  })

  it('has pinia dependency', () => {
    expect(pkg.devDependencies.pinia).toBeTruthy()
  })

  it('has vite dependency', () => {
    expect(pkg.devDependencies.vite).toBeTruthy()
  })

  it('has @vitejs/plugin-vue dependency', () => {
    expect(pkg.devDependencies['@vitejs/plugin-vue']).toBeTruthy()
  })

  it('has eslint dependency', () => {
    expect(pkg.devDependencies.eslint).toBeTruthy()
  })

  it('has vitest dependency', () => {
    expect(pkg.devDependencies.vitest).toBeTruthy()
  })
})

// --- vite.config.js ---

describe('vite.config.js', () => {
  const viteConfig = readFileSync(join(root, 'vite.config.js'), 'utf-8')

  it('uses defineConfig', () => {
    expect(viteConfig).toContain('defineConfig')
  })

  it('imports from @vitejs/plugin-vue', () => {
    expect(viteConfig).toContain("@vitejs/plugin-vue")
  })

  it('sets base to /', () => {
    expect(viteConfig).toContain("base: '/'")
  })

  it('exports config with plugins', () => {
    expect(viteConfig).toContain('plugins')
  })

  it('uses fileURLToPath', () => {
    expect(viteConfig).toContain('fileURLToPath')
  })
})

// --- router/index.js ---

describe('router/index.js', () => {
  const router = readFileSync(join(root, 'src', 'router', 'index.js'), 'utf-8')

  it('has / route', () => {
    expect(router).toContain("path: '/'")
  })

  it('has /about route', () => {
    expect(router).toContain("path: '/about'")
  })

  it('has /game/:slug route', () => {
    expect(router).toContain("path: '/game/:slug'")
  })

  it('has /highscores route', () => {
    expect(router).toContain("path: '/highscores'")
  })

  it('has catch-all route', () => {
    expect(router).toContain(':pathMatch(.*)*')
  })

  it('maps path / to HomeView', () => {
    expect(router).toContain("path: '/', component: HomeView")
  })

  it('maps path /about to AboutView', () => {
    expect(router).toContain("path: '/about', component:")
  })

  it('maps path /game/:slug to GamePage', () => {
    expect(router).toContain("path: '/game/:slug', component:")
  })

  it('maps path /highscores to HighScoresView', () => {
    expect(router).toContain("path: '/highscores', component:")
  })

  it('maps catch-all to NotFoundView', () => {
    expect(router).toContain("path: '/:pathMatch(.*)*',")
    expect(router).toContain('NotFoundView')
  })

  it('uses createWebHistory', () => {
    expect(router).toContain('createWebHistory')
  })
})

// --- .github/workflows/deploy.yml ---

describe('.github/workflows/deploy.yml', () => {
  const deployYml = readFileSync(join(root, '.github', 'workflows', 'deploy.yml'), 'utf-8')

  it('runs npm ci', () => {
    expect(deployYml).toContain('npm ci')
  })

  it('runs npm run build', () => {
    expect(deployYml).toContain('npm run build')
  })

  it('runs npm test before build', () => {
    const ciIndex = deployYml.indexOf('npm ci')
    const testIndex = deployYml.indexOf('npm test')
    const buildIndex = deployYml.indexOf('npm run build')
    expect(ciIndex).toBeGreaterThan(-1)
    expect(testIndex).toBeGreaterThan(-1)
    expect(buildIndex).toBeGreaterThan(-1)
    expect(testIndex).toBeGreaterThan(ciIndex)
    expect(testIndex).toBeLessThan(buildIndex)
  })

  it('uploads ./dist/', () => {
    expect(deployYml).toContain('./dist/')
  })

  it('uses actions/checkout@v4', () => {
    expect(deployYml).toContain('checkout@v4')
  })

  it('has pages: write permission', () => {
    expect(deployYml).toContain('pages: write')
  })

  it('has id-token: write permission', () => {
    expect(deployYml).toContain('id-token: write')
  })

  it('has on trigger', () => {
    expect(deployYml).toContain('on:')
  })

  it('triggers on main branch', () => {
    expect(deployYml).toContain('- main')
  })
})

// --- .gitignore ---

describe('.gitignore', () => {
  const gitignore = readFileSync(join(root, '.gitignore'), 'utf-8')

  it('includes node_modules/', () => {
    expect(gitignore).toContain('node_modules/')
  })

  it('includes dist/', () => {
    expect(gitignore).toContain('dist/')
  })

  it('includes .env', () => {
    expect(gitignore).toContain('.env')
  })

  it('includes .env.*', () => {
    expect(gitignore).toContain('.env.*')
  })
})

// --- index.html ---

describe('index.html', () => {
  const indexHtml = readFileSync(join(root, 'index.html'), 'utf-8')

  it('has HTML5 doctype', () => {
    expect(indexHtml).toContain('<!DOCTYPE html>')
  })

  it('has lang="en"', () => {
    expect(indexHtml).toContain('lang="en"')
  })

  it('has <title>gameShelf</title>', () => {
    expect(indexHtml).toContain('<title>gameShelf</title>')
  })

  it('has div#app', () => {
    expect(indexHtml).toContain('<div id="app"></div>')
  })

  it('imports /src/main.js', () => {
    expect(indexHtml).toContain('/src/main.js')
  })
})

// --- src/main.js ---

describe('src/main.js', () => {
  const mainJs = readFileSync(join(root, 'src', 'main.js'), 'utf-8')

  it('calls createApp', () => {
    expect(mainJs).toContain("createApp")
  })

  it('calls createPinia', () => {
    expect(mainJs).toContain("createPinia")
  })

  it('uses pinia plugin', () => {
    expect(mainJs).toContain("app.use(createPinia())")
  })

  it('uses router plugin', () => {
    expect(mainJs).toContain("app.use(router)")
  })

  it('mounts to #app', () => {
    expect(mainJs).toContain("app.mount('#app')")
  })

  it('reads window.location.hash', () => {
    expect(mainJs).toContain("window.location.hash")
  })

  it('calls router.push for hash redirect', () => {
    expect(mainJs).toContain("router.push")
  })
})

// --- 404.html ---

describe('404.html', () => {
  const fortyFour = readFileSync(join(root, '404.html'), 'utf-8')

  it('reads window.location.pathname', () => {
    expect(fortyFour).toContain('window.location.pathname')
  })

  it('uses window.location.replace for redirect', () => {
    expect(fortyFour).toContain('window.location.replace')
  })

  it('encodes path as hash fragment /#', () => {
    expect(fortyFour).toContain('/#')
  })
})

// --- App.vue ---

describe('App.vue', () => {
  const appVue = readFileSync(join(root, 'src', 'App.vue'), 'utf-8')

  it('template has <AppHeader />', () => {
    expect(appVue).toContain('<AppHeader />')
  })

  it('template has <router-view />', () => {
    expect(appVue).toContain('<router-view />')
  })

  it('template has <AppFooter />', () => {
    expect(appVue).toContain('<AppFooter />')
  })

  it('imports AppHeader component', () => {
    expect(appVue).toContain('./components/AppHeader.vue')
  })

  it('imports AppFooter component', () => {
    expect(appVue).toContain('./components/AppFooter.vue')
  })

  it('has all three components', () => {
    const headerIdx = appVue.indexOf('<AppHeader />')
    const routerViewIdx = appVue.indexOf('<router-view />')
    const footerIdx = appVue.indexOf('<AppFooter />')
    expect(headerIdx).toBeGreaterThan(-1)
    expect(routerViewIdx).toBeGreaterThan(-1)
    expect(footerIdx).toBeGreaterThan(-1)
  })

  it('has correct order: AppHeader < router-view < AppFooter', () => {
    const headerIdx = appVue.indexOf('<AppHeader />')
    const routerViewIdx = appVue.indexOf('<router-view />')
    const footerIdx = appVue.indexOf('<AppFooter />')
    expect(headerIdx < routerViewIdx && routerViewIdx < footerIdx).toBe(true)
  })
})

// --- src/assets/styles.css ---

describe('styles.css', () => {
  const styles = readFileSync(join(root, 'src', 'assets', 'styles.css'), 'utf-8')

  it('defines :root block for tokens', () => {
    expect(styles).toContain(':root {')
  })

  it('defines --color-bg-primary', () => {
    expect(styles).toContain('--color-bg-primary: #0f0f23')
  })

  it('defines --color-bg-secondary', () => {
    expect(styles).toContain('--color-bg-secondary: #1a1a2e')
  })

  it('defines --color-bg-tertiary', () => {
    expect(styles).toContain('--color-bg-tertiary: #2a2a4a')
  })

  it('defines --color-accent', () => {
    expect(styles).toContain('--color-accent: #7f5af0')
  })

  it('defines --color-accent-hover', () => {
    expect(styles).toContain('--color-accent-hover: #6c47d9')
  })

  it('defines --color-text-primary', () => {
    expect(styles).toContain('--color-text-primary: #e0e0e0')
  })

  it('defines --color-text-secondary', () => {
    expect(styles).toContain('--color-text-secondary: #a0a0c0')
  })

  it('defines --color-text-muted', () => {
    expect(styles).toContain('--color-text-muted: #666680')
  })

  it('defines --color-success', () => {
    expect(styles).toContain('--color-success: #2cb67d')
  })

  it('defines --spacing-sm', () => {
    expect(styles).toContain('--spacing-sm: 0.5rem')
  })

  it('defines --spacing-md', () => {
    expect(styles).toContain('--spacing-md: 1rem')
  })

  it('defines --spacing-lg', () => {
    expect(styles).toContain('--spacing-lg: 1.5rem')
  })

  it('defines --spacing-xl', () => {
    expect(styles).toContain('--spacing-xl: 2rem')
  })

  it('uses var(-- tokens at least 3 times', () => {
    let count = 0, idx = styles.indexOf('var(--')
    while (idx !== -1) { count++; idx = styles.indexOf('var(--', idx + 5) }
    expect(count >= 3).toBe(true)
  })

  it('resets margin', () => {
    expect(styles).toContain('margin: 0')
  })

  it('resets padding', () => {
    expect(styles).toContain('padding: 0')
  })

  it('sets box-sizing border-box', () => {
    expect(styles).toContain('box-sizing: border-box')
  })

  it('sets scroll-behavior smooth', () => {
    expect(styles).toContain('scroll-behavior: smooth')
  })

  it('has dark background', () => {
    expect(styles).toContain('background-color: var(--color-bg-primary)')
  })

  it('has light text', () => {
    expect(styles).toContain('color: var(--color-text-primary)')
  })

  it('has accent color #7f5af0', () => {
    expect(styles).toContain('#7f5af0')
  })

  it('has sticky header', () => {
    expect(styles).toContain('position: sticky')
  })

  it('has flex column body', () => {
    expect(styles).toContain('flex-direction: column')
  })

  it('has responsive @media queries', () => {
    expect(styles).toContain('@media')
  })
})

// --- npm install completed ---

describe('npm install', () => {
  it('node_modules exists (vue present)', () => {
    expect(existsSync(join(root, 'node_modules', 'vue'))).toBe(true)
  })
})

// --- Deployment Failure Convention (AGENTS.md) ---

describe('AGENTS.md — Deployment Failure Convention', () => {
  const agentsMd = readFileSync(join(root, 'AGENTS.md'), 'utf-8')

  it('has a Deployment Failure Convention section', () => {
    expect(agentsMd).toContain('Deployment Failure Convention')
  })

  it('describes transient failures broadly (not HTTP 408 specific)', () => {
    expect(agentsMd).not.toContain('HTTP 408')
    expect(agentsMd).toContain('transient deployment failures')
    expect(agentsMd).toContain('infrastructure hiccups')
  })

  it('mentions network errors as a transient failure', () => {
    expect(agentsMd).toContain('network error')
  })

  it('specifies up to 4 additional retries (5 total attempts)', () => {
    expect(agentsMd).toContain('4 additional')
    expect(agentsMd).toContain('5 total')
  })

  it('specifies exponential backoff delays', () => {
    expect(agentsMd).toContain('30-second delay')
    expect(agentsMd).toContain('60-second delay')
    expect(agentsMd).toContain('120-second delay')
    expect(agentsMd).toContain('180-second delay')
  })

  it('includes GitHub API reachability pre-check', () => {
    expect(agentsMd).toContain('GitHub API reachability')
    expect(agentsMd).toContain('200 or 403')
  })

  it('logs attempts as Attempt 1/5 through Attempt 5/5', () => {
    expect(agentsMd).toContain('Attempt 1/5')
    expect(agentsMd).toContain('Attempt 2/5')
    expect(agentsMd).toContain('Attempt 3/5')
    expect(agentsMd).toContain('Attempt 4/5')
    expect(agentsMd).toContain('Attempt 5/5')
  })

  it('specifies escalation to PM with "approved but blocked by infrastructure"', () => {
    expect(agentsMd).toContain('approved but blocked by infrastructure')
  })

  it('says not to bounce the card back to developer/PM', () => {
    expect(agentsMd.toLowerCase()).toContain('do not bounce')
  })

  it('requires including failure details (error messages, timestamps)', () => {
    const section = agentsMd.slice(agentsMd.indexOf('Deployment Failure Convention'))
    expect(section).toMatch(/error.?message/i)
    expect(section).toMatch(/timestamp/i)
  })

  it('mentions setting card status to reflect approved/blocked', () => {
    expect(agentsMd.toLowerCase()).toContain('card status')
    expect(agentsMd.toLowerCase()).toMatch(/approv.*block/i)
  })

  it('escalates after all 5 attempts fail', () => {
    const section = agentsMd.slice(agentsMd.indexOf('Deployment Failure Convention'))
    expect(section).toMatch(/all.*5.*attempt/i)
  })
})

// --- .github/actions/deploy-with-retry/action.yml ---

describe('.github/actions/deploy-with-retry/action.yml', () => {
  const actionYml = readFileSync(join(root, '.github', 'actions', 'deploy-with-retry', 'action.yml'), 'utf-8')

  it('is a composite action', () => {
    expect(actionYml).toContain("using: 'composite'")
  })

  it('runs attempt 1 unconditionally', () => {
    expect(actionYml).toContain('attempt: 1')
  })

  it('runs attempt 2 only if previous attempt failed', () => {
    expect(actionYml).toMatch(/attempt:\s*2/)
    expect(actionYml).toContain("steps.deploy_1.outcome == 'failure'")
  })

  it('runs attempt 3 only if previous attempt failed', () => {
    expect(actionYml).toMatch(/attempt:\s*3/)
    expect(actionYml).toContain("steps.deploy_2.outcome == 'failure'")
  })

  it('fails the job if all 5 attempts exhausted', () => {
    expect(actionYml).toContain('exit 1')
    expect(actionYml).toMatch(/all.*5.*attempt/i)
    expect(actionYml).toContain("steps.deploy_5.outcome == 'failure'")
  })

  it('forwards page_url from steps.deploy_5', () => {
    expect(actionYml).toContain('steps.deploy_5.outputs.page_url')
  })

  it('has unique step IDs deploy_1 through deploy_5', () => {
    expect(actionYml).toContain('id: deploy_1')
    expect(actionYml).toContain('id: deploy_2')
    expect(actionYml).toContain('id: deploy_3')
    expect(actionYml).toContain('id: deploy_4')
    expect(actionYml).toContain('id: deploy_5')
  })

  it('has step logging with attempt numbers', () => {
    expect(actionYml).toMatch(/attempt\s*\d/i)
  })
})

// --- .github/actions/deploy-with-retry/_attempt/action.yml ---

describe('.github/actions/deploy-with-retry/_attempt/action.yml', () => {
  const attemptYml = readFileSync(join(root, '.github', 'actions', 'deploy-with-retry', '_attempt', 'action.yml'), 'utf-8')

  it('is a composite action', () => {
    expect(attemptYml).toContain("using: 'composite'")
  })

  it('accepts an attempt input', () => {
    expect(attemptYml).toContain('inputs:')
    expect(attemptYml).toContain('attempt:')
  })

  it('accepts an artifact_path input with default ./dist/', () => {
    expect(attemptYml).toContain('artifact_path:')
    expect(attemptYml).toContain('./dist/')
  })

  it('sleeps before retries (not before attempt 1)', () => {
    expect(attemptYml).toContain('sleep 30')
    expect(attemptYml).toContain("inputs.attempt != '1'")
  })

  it('uses actions/upload-pages-artifact@v3', () => {
    expect(attemptYml).toContain('upload-pages-artifact@v3')
  })

  it('uses actions/deploy-pages@v4', () => {
    expect(attemptYml).toContain('deploy-pages@v4')
  })

  it('logs the attempt number in step names', () => {
    expect(attemptYml).toContain('${{ inputs.attempt }}')
  })

  it('forwards the page_url output', () => {
    expect(attemptYml).toContain('page_url')
  })
})

// --- .github/workflows/deploy.yml — retry integration ---

describe('.github/workflows/deploy.yml — retry integration', () => {
  const deployYml = readFileSync(join(root, '.github', 'workflows', 'deploy.yml'), 'utf-8')

  it('uses the deploy-with-retry composite action', () => {
    expect(deployYml).toContain('./.github/actions/deploy-with-retry')
  })

  it('still runs npm ci (deterministic, no retry)', () => {
    expect(deployYml).toContain('npm ci')
  })

  it('still runs npm run build (deterministic, no retry)', () => {
    expect(deployYml).toContain('npm run build')
  })

  it('preserves the pages: write permission', () => {
    expect(deployYml).toContain('pages: write')
  })

  it('preserves the id-token: write permission', () => {
    expect(deployYml).toContain('id-token: write')
  })

  it('preserves the github-pages environment', () => {
    expect(deployYml).toContain('github-pages')
  })

  it('preserves the push trigger on main', () => {
    expect(deployYml).toContain('- main')
  })
})

// --- No deprecated field names ---

describe('No deprecated field names in new/modified files', () => {
  const actionYml = readFileSync(join(root, '.github', 'actions', 'deploy-with-retry', 'action.yml'), 'utf-8')
  const attemptYml = readFileSync(join(root, '.github', 'actions', 'deploy-with-retry', '_attempt', 'action.yml'), 'utf-8')
  const deployYml = readFileSync(join(root, '.github', 'workflows', 'deploy.yml'), 'utf-8')

  // `genre:` has zero structural use in GitHub Actions YAML — it only appears in catalog data.
  // For `id:` and `name:`, check for catalog-style quoted values (e.g. `id: snake`, `name: Snake`)
  // which would indicate game catalog data, not structural YAML keys.
  const genrePattern = /\bgenre\s*:/
  const catalogIdNamePattern = /\b(id|name)\s*:\s*['"][a-z][a-z0-9_-]+['"]/

  it('deploy-with-retry/action.yml has no deprecated catalog-style field', () => {
    expect(genrePattern.test(actionYml)).toBe(false)
    expect(catalogIdNamePattern.test(actionYml)).toBe(false)
  })

  it('_attempt/action.yml has no deprecated catalog-style field', () => {
    expect(genrePattern.test(attemptYml)).toBe(false)
    expect(catalogIdNamePattern.test(attemptYml)).toBe(false)
  })

  it('deploy.yml has no deprecated catalog-style field', () => {
    expect(genrePattern.test(deployYml)).toBe(false)
    expect(catalogIdNamePattern.test(deployYml)).toBe(false)
  })
})

// --- Build test ---

describe('build test', () => {
  it('npm run build completes successfully', () => {
    execFileSync('npm', ['run', 'build'], { cwd: root, timeout: 120000, stdio: 'pipe' })
    expect(existsSync(join(root, 'dist', 'index.html'))).toBe(true)
  })

  it('dist/404.html exists after build', () => {
    expect(existsSync(join(root, 'dist', '404.html'))).toBe(true)
  })

  it('dist/index.html exists after build', () => {
    expect(existsSync(join(root, 'dist', 'index.html'))).toBe(true)
  })
})

// --- Pre-commit hook comment and behavior ---

describe('Pre-commit hook', () => {
  const hookPath = join(root, '.husky', 'pre-commit')
  const scriptPath = join(root, 'scripts', 'check-assertion-dupes.js')

  it('pre-commit comment accurately describes blocking behavior', () => {
    const hookContent = readFileSync(hookPath, 'utf-8')
    // Must NOT contain the old misleading "warning-only" language
    expect(hookContent).not.toContain('warning-only')
    // Must NOT contain "does not block"
    expect(hookContent).not.toContain('does not block')
    // Must mention blocking or preventing commits
    expect(hookContent).toMatch(/block|prevent/i)
  })

  it('script calls process.exit(1) when dupes are found', () => {
    const scriptContent = readFileSync(scriptPath, 'utf-8')
    // The script must exit non-zero when dupes are detected
    expect(scriptContent).toContain('process.exit(deduped.length > 0 ? 1 : 0)')
  })

  it('script exits 0 when run against the current clean codebase', () => {
    const output = execFileSync('node', [scriptPath], {
      cwd: root,
      timeout: 30000,
      encoding: 'utf-8'
    })
    expect(output).toBeFalsy()
  })
})
