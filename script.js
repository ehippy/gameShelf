/* ========================================
   gameShelf — Interactivity
   ======================================== */

(function () {
    'use strict';

    // ── Shared Games Catalog ──────────────────────────────────
    window.gamesCatalog = [
        { name: 'Snake', href: 'snake.html', category: 'arcade' },
        { name: 'Tetris', href: 'tetris.html', category: 'puzzle' },
        { name: '2048', href: '2048.html', category: 'puzzle' },
        { name: 'Breakout', href: 'breakout.html', category: 'action' },
        { name: 'Pac-Man', href: 'pacman.html', category: 'arcade' },
        { name: 'Minesweeper', href: 'minesweeper.html', category: 'puzzle' },
        { name: 'Tic Tac Toe', href: 'tictactoe.html', category: 'puzzle' },
        { name: 'Memory Match', href: 'memorymatch.html', category: 'puzzle' },
        { name: 'Simon Says', href: 'simon-says.html', category: 'casual' },
        { name: 'Space Invaders', href: 'spaceinvaders.html', category: 'arcade' },
        { name: 'Flappy Bird', href: 'flappybird.html', category: 'arcade' },
        { name: 'Whack-a-Mole', href: 'whackamole.html', category: 'action' },
        { name: 'Sliding Tile Puzzle', href: 'slidingpuzzle.html', category: 'puzzle' }
    ];

    // ── Random Game Button ────────────────────────────────────
    var randomBtn = document.getElementById('randomGameBtn');
    if (randomBtn) {
        randomBtn.addEventListener('click', function () {
            var isGamesPage = window.location.pathname.indexOf('/games/') !== -1;
            var entry = window.gamesCatalog[Math.floor(Math.random() * window.gamesCatalog.length)];
            var url = isGamesPage ? entry.href : 'games/' + entry.href;
            window.location.assign(url);
        });
    }

    // ── Category Filter ───────────────────────────────────────
    var filterButtons = document.querySelectorAll('.filter-btn');
    var gameCards = document.querySelectorAll('.game-card');

    filterButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(function (b) {
                b.classList.remove('active');
            });

            // Add active class to clicked button
            btn.classList.add('active');

            // Get the filter value
            var filter = btn.getAttribute('data-filter');

            // Filter game cards
            gameCards.forEach(function (card) {
                var category = card.getAttribute('data-category');

                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ── Search Input — filter cards by title/description ──────
    var searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            var query = this.value.toLowerCase().trim();

            gameCards.forEach(function (card) {
                var title = card.querySelector('h3').textContent.toLowerCase();
                var desc = card.querySelector('.card-desc')
                    ? card.querySelector('.card-desc').textContent.toLowerCase()
                    : '';

                if (title.indexOf(query) !== -1 || desc.indexOf(query) !== -1) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    }

    // ── Most Played Carousel ───────────────────────────────────
    var carouselTrack = document.querySelector('.carousel-track');
    var carouselSlides = document.querySelectorAll('.carousel-slide');
    var carouselDots = document.querySelectorAll('.carousel-dot');
    var shuffleIndicator = document.querySelector('.shuffle-indicator');

    if (carouselTrack && carouselSlides.length > 0) {
        var currentIndex = 0;
        var totalSlides = carouselSlides.length;
        var carouselInterval;

        function showSlide(index) {
            carouselTrack.style.transform = 'translateX(' + (index * -100) + '%)';

            carouselDots.forEach(function (dot) {
                dot.classList.remove('active');
            });

            if (carouselDots[index]) {
                carouselDots[index].classList.add('active');
            }
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            showSlide(currentIndex);
        }

        function startAutoAdvance() {
            carouselInterval = setInterval(nextSlide, 6000);
        }

        function stopAutoAdvance() {
            clearInterval(carouselInterval);
        }

        // Dot navigation
        carouselDots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                currentIndex = dotIndex;
                showSlide(currentIndex);
                stopAutoAdvance();
                startAutoAdvance();
            });
        });

        // Respect prefers-reduced-motion
        var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (!prefersReducedMotion.matches) {
            startAutoAdvance();
        }

        // Listen for changes to the reduced motion preference
        if (prefersReducedMotion.addEventListener) {
            prefersReducedMotion.addEventListener('change', function (e) {
                if (e.matches) {
                    stopAutoAdvance();
                } else {
                    startAutoAdvance();
                }
            });
        }

        // Pause on hover
        var carouselWrapper = document.querySelector('.carousel-wrapper');
        if (carouselWrapper) {
            carouselWrapper.addEventListener('mouseenter', stopAutoAdvance);
            carouselWrapper.addEventListener('mouseleave', startAutoAdvance);
        }
    }

})();
