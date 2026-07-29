/* ========================================
   gameShelf — Interactivity
   ======================================== */

(function () {
    'use strict';

    // Category Filter
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');

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

    // Search Input — filter cards by title/description
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

})();
