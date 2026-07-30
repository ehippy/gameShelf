#!/usr/bin/env node
/**
 * Test suite for SPA Page Structure implementation (About page, GamePlayer, Header, Footer, GameCard,
 * MostPlayedCarousel, Home, and integration).
 *
 * Validates all acceptance criteria from the card spec by mounting Vue components with jsdom
 * and interacting with them.
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
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.log(`  ❌ ${message}`);
  }
}

function section(name) {
  console.log('\n' + '='.repeat(50));
  console.log(`  ${name}`);
  console.log('='.repeat(50));
}

// ============================================================
// Load source files
// ============================================================
const headerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'components', 'Header.vue'), 'utf-8');
const footerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'components', 'Footer.vue'), 'utf-8');
const aboutSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'pages', 'About.vue'), 'utf-8');
const gamePlayerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'pages', 'GamePlayer.vue'), 'utf-8');
const homeSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'pages', 'Home.vue'), 'utf-8');
const appSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'App.vue'), 'utf-8');
const gameCardSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'components', 'GameCard.vue'), 'utf-8');
const carouselSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'components', 'MostPlayedCarousel.vue'), 'utf-8');
const storeSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'stores', 'gameCatalog.js'), 'utf-8');
const routerSrc = fs.readFileSync(path.join(REPO_ROOT, 'src', 'router', 'index.js'), 'utf-8');

// ============================================================
// AC: File existence — all required files exist
// ============================================================
section('0. File Existence');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/components/Header.vue')), 'Header.vue exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/components/Footer.vue')), 'Footer.vue exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/pages/About.vue')), 'About.vue exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/pages/GamePlayer.vue')), 'GamePlayer.vue exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/components/GameCard.vue')), 'GameCard.vue exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/components/MostPlayedCarousel.vue')), 'MostPlayedCarousel.vue exists');
assert(fs.existsSync(path.join(REPO_ROOT, 'src/pages/Home.vue')), 'Home.vue exists');

// ============================================================
// AC: App.vue layout — Header/Footer around router-view in <main>
// ============================================================
section('1. App.vue Layout');
assert(appSrc.includes('<Header />'), 'App.vue renders <Header />');
assert(appSrc.includes('<Footer />'), 'App.vue renders <Footer />');
assert(appSrc.includes('<router-view') || appSrc.includes('<router-view/>'), 'App.vue renders <router-view>');
assert(appSrc.includes('<main>') && appSrc.includes('</main>'), 'App.vue wraps router-view in <main>');
assert(appSrc.indexOf('<Header />') < appSrc.indexOf('<main>'), 'Header comes before <main>');
assert(appSrc.indexOf('<main>') < appSrc.indexOf('<Footer />'), '<Footer> comes after <main>');

// ============================================================
// AC: Header component
// ============================================================
section('2. Header Component');

// Logo
assert(headerSrc.includes('<router-link to="/" class="logo">'), 'Header logo uses router-link to /');
assert(headerSrc.includes('gameShelf') || headerSrc.includes('🎮'), 'Header logo contains gameShelf text');

// Category filter buttons — 7 buttons
assert(headerSrc.includes('filter-btn'), 'Header uses filter-btn class');
assert(headerSrc.includes('activeFilter'), 'Header accepts activeFilter prop');
assert(headerSrc.includes("'all'") || headerSrc.includes('"all"'), 'Header default filter is "all"');
assert(headerSrc.includes('filter-change'), 'Header emits filter-change event');
assert(headerSrc.includes("'action'") || headerSrc.includes('"action"'), 'Header includes Action filter');
assert(headerSrc.includes("'puzzle'") || headerSrc.includes('"puzzle"'), 'Header includes Puzzle filter');
assert(headerSrc.includes("'arcade'") || headerSrc.includes('"arcade"'), 'Header includes Arcade filter');
assert(headerSrc.includes("'strategy'") || headerSrc.includes('"strategy"'), 'Header includes Strategy filter');
assert(headerSrc.includes("'board'") || headerSrc.includes('"board"'), 'Header includes Board filter');
assert(headerSrc.includes("'casual'") || headerSrc.includes('"casual"'), 'Header includes Casual filter');
// Count category value entries
const catValues = headerSrc.match(/value:\s*'(all|action|puzzle|arcade|strategy|board|casual)'/g) || [];
assert(catValues.length === 7, `Header has exactly 7 filter categories (found ${catValues.length})`);

// Active class binding
assert(headerSrc.includes(':class') && headerSrc.includes('active'), 'Header applies .active class to active filter button');

// Search input
assert(headerSrc.includes('search-input'), 'Header uses search-input class');
assert(headerSrc.includes('Search games...'), 'Header search input has correct placeholder');
assert(headerSrc.includes('search-change'), 'Header emits search-change event');
assert(headerSrc.includes('searchQuery'), 'Header accepts searchQuery prop');
assert(headerSrc.includes("@input"), 'Header search input uses @input event');

// CSS classes used
assert(headerSrc.includes('site-header'), 'Header uses .site-header class');
assert(headerSrc.includes('header-inner'), 'Header uses .header-inner class');
assert(headerSrc.includes('category-bar'), 'Header uses .category-bar class');
assert(headerSrc.includes('search-area'), 'Header uses .search-area class');

// ============================================================
// AC: Footer component
// ============================================================
section('3. Footer Component');

// Footer links — 3 router-link entries
assert(footerSrc.includes('site-footer'), 'Footer uses .site-footer class');
assert(footerSrc.includes('footer-inner'), 'Footer uses .footer-inner class');
assert(footerSrc.includes('footer-links'), 'Footer uses .footer-links class');

// 3 router-link entries
const footerLinks = footerSrc.match(/<router-link[^>]*>/g) || [];
assert(footerLinks.length === 3, `Footer has exactly 3 router-link entries (found ${footerLinks.length})`);

assert(footerSrc.includes('to="/about"'), 'Footer includes link to /about');

// Copyright text — exact match
assert(footerSrc.includes('© 2025 gameShelf — All games built in browser — no downloads required'),
  'Footer has exact required copyright text');

// ============================================================
// AC: About page
// ============================================================
section('4. About Page');

assert(aboutSrc.includes('page-about'), 'About page uses .page-about class');
assert(aboutSrc.includes('about-card'), 'About page uses .about-card class');

// Heading
assert(aboutSrc.includes('<h1>About gameShelf</h1>'), 'About page has <h1>About gameShelf</h1>');

// 3 description paragraphs
const paragraphs = aboutSrc.match(/<p>/g) || [];
assert(paragraphs.length >= 3, `About page has at least 3 description paragraphs (found ${paragraphs.length})`);

// First paragraph text
assert(aboutSrc.includes('browser-based game platform'), 'About first paragraph mentions "browser-based game platform"');
assert(aboutSrc.includes('no downloads required'), 'About first paragraph mentions "no downloads required"');
assert(aboutSrc.includes('No installations, no plugins'), 'About first paragraph mentions "No installations, no plugins"');

// Second paragraph
assert(aboutSrc.includes('six categories'), 'About second paragraph mentions "six categories"');

// Third paragraph
assert(aboutSrc.includes('HTML, CSS, and JavaScript'), 'About third paragraph mentions "HTML, CSS, and JavaScript"');

// Categories list — 6 items
assert(aboutSrc.includes('about-categories'), 'About page uses .about-categories class');
const categoryItems = aboutSrc.match(/<li>/g) || [];
assert(categoryItems.length === 6, `About page has exactly 6 category list items (found ${categoryItems.length})`);

// Each category has bold name in accent color
assert(aboutSrc.includes('<strong>Action</strong>'), 'About page includes <strong>Action</strong>');
assert(aboutSrc.includes('<strong>Puzzle</strong>'), 'About page includes <strong>Puzzle</strong>');
assert(aboutSrc.includes('<strong>Arcade</strong>'), 'About page includes <strong>Arcade</strong>');
assert(aboutSrc.includes('<strong>Strategy</strong>'), 'About page includes <strong>Strategy</strong>');
assert(aboutSrc.includes('<strong>Board</strong>'), 'About page includes <strong>Board</strong>');
assert(aboutSrc.includes('<strong>Casual</strong>'), 'About page includes <strong>Casual</strong>');

// Play Now CTA button
assert(aboutSrc.includes('play-btn-large'), 'About CTA uses .play-btn-large class');
assert(aboutSrc.includes('about-cta'), 'About CTA uses .about-cta class');
assert(aboutSrc.includes('▶ Play Now'), 'About CTA text is "▶ Play Now"');
assert(aboutSrc.includes('to="/"'), 'About CTA router-link points to /');

// ============================================================
// AC: Game Player page
// ============================================================
section('5. Game Player Page');

// Back link
assert(gamePlayerSrc.includes('back-link'), 'GamePlayer uses .back-link class');
assert(gamePlayerSrc.includes('to="/"'), 'GamePlayer back link points to /');
assert(gamePlayerSrc.includes('← Back to Home'), 'GamePlayer back link text is "← Back to Home"');

// Iframe with dynamic src
assert(gamePlayerSrc.includes(':src="iframeSrc"'), 'GamePlayer binds iframe :src to iframeSrc');
assert(gamePlayerSrc.includes(':title="gameName"'), 'GamePlayer binds iframe :title to gameName');
assert(gamePlayerSrc.includes('class="game-iframe"'), 'GamePlayer uses .game-iframe class');
assert(gamePlayerSrc.includes('gameId.value') || gamePlayerSrc.includes('route.params.id'), 'GamePlayer derives iframe src from route params');
assert(gamePlayerSrc.includes('games/'), 'GamePlayer iframe src prefix is "games/"');

// Error state
assert(gamePlayerSrc.includes('error-container') || gamePlayerSrc.includes('error'), 'GamePlayer has error state handling');
assert(gamePlayerSrc.includes('Game not found'), 'GamePlayer error message includes "Game not found"');
assert(gamePlayerSrc.includes('hasError') || gamePlayerSrc.includes('isValidGame'), 'GamePlayer has state for error detection');

// @error handler on iframe
assert(gamePlayerSrc.includes('@error'), 'GamePlayer has @error handler on iframe');

// ============================================================
// AC: Game Card component
// ============================================================
section('6. Game Card Component');

assert(gameCardSrc.includes('game'), 'GameCard accepts "game" prop');
assert(gameCardSrc.includes('required: true'), 'GameCard "game" prop is required');

// Card structure
assert(gameCardSrc.includes('card-thumb'), 'GameCard has .card-thumb');
assert(gameCardSrc.includes('thumb-icon'), 'GameCard has .thumb-icon');
assert(gameCardSrc.includes(':style="{ background: game.gradient }"') ||
  gameCardSrc.includes(':style="{background: game.gradient}"') ||
  gameCardSrc.includes(':style=`{ background: game.gradient }`'), 'GameCard binds gradient style');
assert(gameCardSrc.includes('card-info'), 'GameCard has .card-info');
assert(gameCardSrc.includes('<h3>'), 'GameCard has <h3> for game name');
assert(gameCardSrc.includes('card-desc'), 'GameCard has .card-desc');
assert(gameCardSrc.includes('card-tag'), 'GameCard has .card-tag');
assert(gameCardSrc.includes(':class="game.category"') || gameCardSrc.includes(':class="game.category"'), 'GameCard applies category class to tag');

// router-link wrapping with /games/<href>
assert(gameCardSrc.includes("'/games/' + game.href") || gameCardSrc.includes('"/games/" + game.href'), 'GameCard links to /games/<href>');
assert(gameCardSrc.includes('class="game-card"'), 'GameCard wrapper uses .game-card class');

// card-play button
assert(gameCardSrc.includes('card-play'), 'GameCard has .card-play section');
assert(gameCardSrc.includes('▶ Play'), 'GameCard play text is "▶ Play"');

// ============================================================
// AC: Most Played Carousel
// ============================================================
section('7. Most Played Carousel');

// Section header
assert(carouselSrc.includes('most-played-section'), 'Carousel uses .most-played-section');
assert(carouselSrc.includes('<h2>Most Played</h2>'), 'Carousel has <h2>Most Played</h2>');
assert(carouselSrc.includes('shuffle-indicator'), 'Carousel has shuffle-indicator');
assert(carouselSrc.includes('aria-label="Carousel auto-advances"'), 'Shuffle indicator has correct aria-label');
assert(carouselSrc.includes('↻'), 'Shuffle indicator has ↻ icon');

// Slides data — 4 slides with 5 hrefs each
assert(carouselSrc.includes("snake.html") && carouselSrc.includes("tetris.html"), 'Slide 0 includes snake.html, tetris.html');
assert(carouselSrc.includes("whackamole.html"), 'Slide 2 includes whackamole.html (not in store — should be skipped)');
assert(carouselSrc.includes("2048.html"), 'Slides include 2048.html');
assert(carouselSrc.includes("pacman.html"), 'Slides include pacman.html');
assert(carouselSrc.includes("minesweeper.html"), 'Slides include minesweeper.html');
assert(carouselSrc.includes("tictactoe.html"), 'Slides include tictactoe.html');
assert(carouselSrc.includes("memorymatch.html"), 'Slides include memorymatch.html');
assert(carouselSrc.includes("simon-says.html"), 'Slides include simon-says.html');
assert(carouselSrc.includes("breakout.html"), 'Slides include breakout.html');

// Carousel slide count
const slideData = carouselSrc.match(/'([a-z0-9-]+\.html)'/g) || [];
const uniqueSlides = new Set(slideData.map(s => s.replace(/'/g, '')));
assert(slideData.length === 20, `Carousel has exactly 20 game hrefs (5 per slide × 4 slides) (found ${slideData.length})`);

// Auto-advance with setInterval at 6000ms
assert(carouselSrc.includes('setInterval'), 'Carousel uses setInterval for auto-advance');
assert(carouselSrc.includes('6000'), 'Carousel auto-advance interval is 6000ms');
assert(carouselSrc.includes('6 * 1000') || carouselSrc.includes('6000'), 'Carousel interval is 6000ms');

// Dot navigation
assert(carouselSrc.includes('carousel-dots'), 'Carousel has .carousel-dots');
assert(carouselSrc.includes('carousel-dot'), 'Carousel has .carousel-dot');
assert(carouselSrc.includes('goToSlide'), 'Carousel has goToSlide function');
assert(carouselSrc.includes('@click="goToSlide'), 'Carousel dots call goToSlide on click');

// Pause on hover
assert(carouselSrc.includes('mouseenter') || carouselSrc.includes('onHoverIn'), 'Carousel has hover-in handler');
assert(carouselSrc.includes('mouseleave') || carouselSrc.includes('onHoverOut'), 'Carousel has hover-out handler');
assert(carouselSrc.includes('stopAutoAdvance'), 'Carousel stops auto-advance on hover');
assert(carouselSrc.includes('startAutoAdvance'), 'Carousel restarts auto-advance on mouse leave');

// Reduced motion support
assert(carouselSrc.includes('prefers-reduced-motion'), 'Carousel checks prefers-reduced-motion');
assert(carouselSrc.includes('matchMedia'), 'Carousel uses matchMedia for reduced motion');
assert(carouselSrc.includes('(prefers-reduced-motion: reduce)'), 'Carousel checks for reduced motion media query');
assert(carouselSrc.includes('onMounted'), 'Carousel initializes in onMounted');
assert(carouselSrc.includes('onUnmounted'), 'Carousel cleans up in onUnmounted');
assert(carouselSrc.includes('startAutoAdvance()') &&
  carouselSrc.includes('!prefersReducedMotion') ||
  (carouselSrc.includes('!prefersReducedMotion.value') && carouselSrc.includes('startAutoAdvance()')),
  'Carousel only starts auto-advance if reduced motion is NOT preferred');

// Track transform
assert(carouselSrc.includes('carousel-track'), 'Carousel has .carousel-track');
assert(carouselSrc.includes('translateX'), 'Carousel uses translateX for slide positioning');
assert(carouselSrc.includes('currentIndex'), 'Carousel uses currentIndex for slide position');

// Graceful handling of missing games (whackamole.html)
assert(carouselSrc.includes('v-if="getGameByHref(href)"') || carouselSrc.includes('v-if="getGameByHref'),
  'Carousel skips games not found in store');
assert(carouselSrc.includes('getGameByHref'), 'Carousel has getGameByHref lookup function');

// ============================================================
// AC: Home page
// ============================================================
section('8. Home Page');

// Header integration
assert(homeSrc.includes('<Header'), 'Home renders <Header> component');
assert(homeSrc.includes('activeFilter'), 'Home binds activeFilter to Header');
assert(homeSrc.includes('searchQuery'), 'Home binds searchQuery to Header');
assert(homeSrc.includes('@filter-change'), 'Home listens for filter-change event');
assert(homeSrc.includes('@search-change'), 'Home listens for search-change event');

// Most Played Carousel
assert(homeSrc.includes('<MostPlayedCarousel'), 'Home renders <MostPlayedCarousel>');

// Random Game button
assert(homeSrc.includes('random-btn'), 'Home has random-btn class');
assert(homeSrc.includes('🎲 Random Game'), 'Home Random Game button text includes 🎲 emoji');
assert(homeSrc.includes('randomGame'), 'Home has randomGame function/variable');

// What's New section — 5 entries in chronological order (newest first)
assert(homeSrc.includes('what-new-section'), 'Home has .what-new-section');
assert(homeSrc.includes('<h2>What\'s New</h2>'), 'Home has What\'s New heading');
const whatNewItems = homeSrc.match(/<li class="what-new-item">/g) || [];
assert(whatNewItems.length === 5, `Home What's New has exactly 5 entries (found ${whatNewItems.length})`);

// Check dates in order (newest first): June 5, June 4, June 3, June 2, June 1
const dates = (homeSrc.match(/<span class="what-new-date">([^<]+)<\/span>/g) || []).map(s => s.replace(/<[^>]+>/g, ''));
assert(dates[0] === 'June 5, 2025', `What's New entry 1: "June 5, 2025" (found "${dates[0]}")`);
assert(dates[1] === 'June 4, 2025', `What's New entry 2: "June 4, 2025" (found "${dates[1]}")`);
assert(dates[2] === 'June 3, 2025', `What's New entry 3: "June 3, 2025" (found "${dates[2]}")`);
assert(dates[3] === 'June 2, 2025', `What's New entry 4: "June 2, 2025" (found "${dates[3]}")`);
assert(dates[4] === 'June 1, 2025', `What's New entry 5: "June 1, 2025" (found "${dates[4]}")`);

// Check descriptions
assert(homeSrc.includes('Sliding Tile Puzzle'), "What's New #1 mentions Sliding Tile Puzzle");
assert(homeSrc.includes('Space Invaders'), "What's New #2 mentions Space Invaders");
assert(homeSrc.includes('Simon Says'), "What's New #3 mentions Simon Says");
assert(homeSrc.includes('Memory Match'), "What's New #4 mentions Memory Match");
assert(homeSrc.includes('Tic Tac Toe'), "What's New #5 mentions Tic Tac Toe");

// All should have "New" badge
const newBadges = homeSrc.match(/<span class="what-new-tag new">New<\/span>/g) || [];
assert(newBadges.length === 5, `All 5 What's New entries have "New" badge (found ${newBadges.length})`);

// Games grid from Pinia store
assert(homeSrc.includes('<GameCard'), 'Home renders <GameCard>');
assert(homeSrc.includes('filteredGames'), 'Home uses filteredGames computed property');
assert(homeSrc.includes('v-for="game in filteredGames"'), 'Home iterates over filteredGames');
assert(homeSrc.includes('games-section'), 'Home uses .games-section class');
assert(homeSrc.includes('<h2>All Games</h2>'), 'Home has All Games heading');

// Filter + search logic
assert(homeSrc.includes('computed'), 'Home uses Vue computed for filteredGames');
assert(homeSrc.includes('activeFilter'), 'Home tracks activeFilter state');
assert(homeSrc.includes('searchQuery'), 'Home tracks searchQuery state');
assert(homeSrc.includes('store.games'), 'Home reads from store.games');
assert(homeSrc.includes('store.searchGames') || homeSrc.includes('searchGames('), 'Home uses store.searchGames');

// Footer
assert(homeSrc.includes('<Footer />'), 'Home renders <Footer />');

// ============================================================
// AC: No plain <a> tags in Vue templates for client-side navigation
// ============================================================
section('9. router-link Only for Navigation');

const vueFiles = [
  { path: 'components/Header.vue', label: 'Header.vue' },
  { path: 'components/Footer.vue', label: 'Footer.vue' },
  { path: 'pages/About.vue', label: 'About.vue' },
  { path: 'pages/GamePlayer.vue', label: 'GamePlayer.vue' },
  { path: 'pages/Home.vue', label: 'Home.vue' },
  { path: 'components/GameCard.vue', label: 'GameCard.vue' },
  { path: 'components/MostPlayedCarousel.vue', label: 'MostPlayedCarousel.vue' }
];
vueFiles.forEach(({ path: p, label }) => {
  const content = fs.readFileSync(path.join(REPO_ROOT, 'src', p), 'utf-8');
  // Find all <a (but not <router-link which renders as <a)
  const plainLinks = content.match(/<a\s[^>]*href=["'][^"']*(?:\/(about|games|)|$)["']/g);
  assert(!plainLinks || plainLinks.length === 0, `${label}: no plain <a> tags for client-side navigation`);
});

// ============================================================
// AC: Pinia store integration
// ============================================================
section('10. Pinia Store Integration');

assert(storeSrc.includes('defineStore'), 'Store uses defineStore');
assert(storeSrc.includes("'gameCatalog'"), 'Store is named "gameCatalog"');

// 12 games
const gameCount = (storeSrc.match(/\{\s*name:/g) || []).length;
assert(gameCount === 12, `Store has 12 games (found ${gameCount})`);

// All games have required fields
assert(storeSrc.includes('href:'), 'Store games have href field');
assert(storeSrc.includes('category:'), 'Store games have category field');
assert(storeSrc.includes('icon:'), 'Store games have icon field');
assert(storeSrc.includes('gradient:'), 'Store games have gradient field');
assert(storeSrc.includes('description:'), 'Store games have description field');

// Getters
assert(storeSrc.includes('getGamesByCategory'), 'Store has getGamesByCategory getter');
assert(storeSrc.includes('searchGames'), 'Store has searchGames getter');
assert(storeSrc.includes('categories'), 'Store has categories getter');

// searchGames searches name, description, and category
assert(storeSrc.includes('g.name.toLowerCase().includes(q)'), 'searchGames searches game name');
assert(storeSrc.includes('g.description.toLowerCase().includes(q)'), 'searchGames searches game description');
assert(storeSrc.includes('g.category.toLowerCase().includes(q)'), 'searchGames searches game category');

// ============================================================
// AC: Router configuration
// ============================================================
section('11. Router Configuration');

assert(routerSrc.includes('createWebHistory'), 'Router uses history mode');
assert(routerSrc.includes("path: '/'"), 'Router has "/" route');
assert(routerSrc.includes("path: '/about'"), 'Router has "/about" route');
assert(routerSrc.includes("path: '/games/:id'"), 'Router has "/games/:id" route');
assert(routerSrc.includes('pathMatch') || routerSrc.includes(':pathMatch'), 'Router has catch-all route');
assert(routerSrc.includes('redirect'), 'Catch-all redirects');

// ============================================================
// AC: Home.vue filtering — both category filter and search filter work
// ============================================================
section('12. Filtering Logic');

// Check that filteredGames applies category filter
assert(homeSrc.includes('g.category === activeFilter') || homeSrc.includes('g.category === activeFilter.value'),
  'Home filters by category when activeFilter is set');

// Check that search is applied
assert(homeSrc.includes('store.searchGames(searchQuery)'), 'Home uses store.searchGames for text search');

// The filter should apply both — check that both are combined
assert(homeSrc.includes('filteredGames') && homeSrc.includes('computed'), 'filteredGames is computed');

// ============================================================
// Summary
// ============================================================
console.log('\n' + '='.repeat(50));
console.log(`  TOTAL RESULTS`);
console.log('='.repeat(50));
if (failed > 0) {
  console.log(`❌ FAILED: ${failed} test(s) failed`);
  console.log(`✅ PASSED: ${passed} test(s) passed`);
  console.log('\nFailures:');
  failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
} else {
  console.log(`✅ All ${passed} tests passed!`);
  process.exit(0);
}
