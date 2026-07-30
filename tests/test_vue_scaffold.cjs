#!/usr/bin/env node
/**
 * Test suite for Vue.js scaffolding acceptance criteria (AC1–AC7).
 * Validates the Vite + Vue 3 SPA structure, Router, Pinia, deploy workflow, and .gitignore.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
  }
}

// ========== AC1: index.html has <div id="app"> and <script src="/src/main.js"> ==========
console.log('\n--- AC1: index.html entry point ---');
const indexHtml = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf-8');
assert(indexHtml.includes('<div id="app"'), 'index.html contains <div id="app">');
assert(indexHtml.includes('/src/main.js'), 'index.html contains <script src="/src/main.js">');

// ========== AC2: npm run build produces dist/index.html and bundled files ==========
console.log('--- AC2: Build output ---');
const distIndex = path.join(REPO_ROOT, 'dist', 'index.html');
assert(fs.existsSync(distIndex), 'dist/index.html exists after build');
const assetsDir = path.join(REPO_ROOT, 'dist', 'assets');
if (fs.existsSync(assetsDir)) {
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  assert(jsFiles.length > 0, `dist/assets/ contains bundled JS files (${jsFiles.length})`);
} else {
  assert(false, 'dist/assets/ directory exists');
}

// ========== AC3: Vue Router routes (all 4, history mode, redirect) ==========
console.log('--- AC3: Vue Router routes ---');
const routerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'router', 'index.js'), 'utf-8');
assert(routerSrc.includes('createWebHistory'), 'Router uses createWebHistory (history mode)');
assert(routerSrc.includes("path: '/'") || routerSrc.includes('path:"/"'), 'Router defines "/" route');
assert(routerSrc.includes("path: '/about'") || routerSrc.includes('path:"/about"'), 'Router defines "/about" route');
assert(routerSrc.includes("path: '/games/:id'") || routerSrc.includes('path:"/games/:id"'), 'Router defines "/games/:id" route');
assert(routerSrc.includes('pathMatch') || routerSrc.includes(':pathMatch'), 'Router defines catch-all route');
assert(routerSrc.includes('Home') && (routerSrc.includes('redirect') || routerSrc.includes('path: \'/\'') || routerSrc.includes('path:"/"')), 'Catch-all redirects to Home');

// ========== AC4: Pinia store has 12 games with all 6 fields and getters ==========
console.log('--- AC4: Pinia gameCatalog store ---');
const storeSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'stores', 'gameCatalog.js'), 'utf-8');
assert(storeSrc.includes('defineStore'), 'Store uses defineStore');
assert(storeSrc.includes("'gameCatalog'") || storeSrc.includes('"gameCatalog"'), 'Store name is "gameCatalog"');
// Count game entries
const gameEntries = storeSrc.match(/\{\s*name:/g) || [];
assert(gameEntries.length === 12, `Pinia store has 12 games (found ${gameEntries.length})`);
// Check all 6 fields are present across the games
assert(storeSrc.includes('name:') && storeSrc.includes('href:') && storeSrc.includes('category:') && storeSrc.includes('icon:') && storeSrc.includes('gradient:') && storeSrc.includes('description:'), 'Each game has name, href, category, icon, gradient, description');
// Check getters
assert(storeSrc.includes('getGamesByCategory'), 'Store has getGamesByCategory getter');
assert(storeSrc.includes('searchGames'), 'Store has searchGames getter');
assert(storeSrc.includes('categories'), 'Store has categories getter');

// ========== AC5: Deploy workflow has npm install && npm run build ==========
console.log('--- AC5: Deploy workflow ---');
const deployYml = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'deploy.yml'), 'utf-8');
assert(deployYml.includes('npm install'), 'Deploy workflow includes npm install');
assert(deployYml.includes('npm run build'), 'Deploy workflow includes npm run build');
assert(deployYml.includes("path: 'dist/'") || deployYml.includes('path: "dist/"'), 'Deploy workflow uploads dist/ artifact');

// ========== AC6: .gitignore includes required entries ==========
console.log('--- AC6: .gitignore ---');
const gitignore = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf-8');
assert(gitignore.includes('node_modules/'), '.gitignore includes node_modules/');
assert(gitignore.includes('dist/'), '.gitignore includes dist/');
assert(gitignore.includes('.env'), '.gitignore includes .env');
assert(gitignore.includes('.env.*') || gitignore.includes('.env.local'), '.gitignore includes .env.* pattern');
assert(gitignore.includes('*.local'), '.gitignore includes *.local');

// ========== AC7: App.vue renders <router-view> and main.js uses router and Pinia ==========
console.log('--- AC7: App.vue and main.js ---');
const appVue = fs.readFileSync(path.join(REPO_ROOT, 'src', 'App.vue'), 'utf-8');
assert(appVue.includes('<router-view') || appVue.includes('<router-view/>'), 'App.vue renders <router-view>');
const mainJs = fs.readFileSync(path.join(REPO_ROOT, 'src', 'main.js'), 'utf-8');
assert(mainJs.includes('createApp'), 'main.js creates Vue app');
assert(mainJs.includes('createPinia') || mainJs.includes('use(pinia)'), 'main.js uses Pinia');
assert(mainJs.includes('router') && mainJs.includes('use(router)') || mainJs.includes('app.use(router)'), 'main.js uses router');
assert(mainJs.includes('mount(\\'#app\\')') || mainJs.includes("mount('#app')") || mainJs.includes('mount("#app")'), 'main.js mounts to #app');

// ========== Summary ==========
console.log('\n========== RESULTS ==========');
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('All Vue scaffold tests passed! 🎉');
  process.exit(0);
}
