import { defineStore } from 'pinia'

// Pinia store for the gameShelf game catalog
export const useGameCatalogStore = defineStore('gameCatalog', {
  state: () => ({
    games: [
      { name: 'Snake', href: 'snake.html', category: 'arcade', icon: '🐍', gradient: 'linear-gradient(135deg, #4ade80, #16a34a)', description: 'Classic arcade snake game. Eat, grow, survive!' },
      { name: 'Tetris', href: 'tetris.html', category: 'puzzle', icon: '🧩', gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)', description: 'Stack falling blocks and clear lines to score points.' },
      { name: '2048', href: '2048.html', category: 'puzzle', icon: '🔢', gradient: 'linear-gradient(135deg, #fbbf24, #d97706)', description: 'Slide and merge numbered tiles to reach 2048!' },
      { name: 'Breakout', href: 'breakout.html', category: 'action', icon: '🧱', gradient: 'linear-gradient(135deg, #f87171, #dc2626)', description: 'Smash bricks with a bouncing ball. Don\'t let it drop!' },
      { name: 'Pac-Man', href: 'pacman.html', category: 'arcade', icon: '👻', gradient: 'linear-gradient(135deg, #facc15, #ca8a04)', description: 'Navigate the maze, eat dots, and avoid ghosts!' },
      { name: 'Minesweeper', href: 'minesweeper.html', category: 'puzzle', icon: '💣', gradient: 'linear-gradient(135deg, #94a3b8, #475569)', description: 'Uncover squares without detonating hidden mines.' },
      { name: 'Tic Tac Toe', href: 'tictactoe.html', category: 'puzzle', icon: '❌', gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)', description: 'Get three in a row against a smart opponent.' },
      { name: 'Memory Match', href: 'memorymatch.html', category: 'puzzle', icon: '🃏', gradient: 'linear-gradient(135deg, #fb7185, #e11d48)', description: 'Flip cards and find matching pairs from memory.' },
      { name: 'Simon Says', href: 'simon-says.html', category: 'casual', icon: '🎵', gradient: 'linear-gradient(135deg, #fb923c, #ea580c)', description: 'Repeat the sequence of colored buttons. Each round gets longer!' },
      { name: 'Space Invaders', href: 'spaceinvaders.html', category: 'arcade', icon: '👾', gradient: 'linear-gradient(135deg, #22d3ee, #0891b2)', description: 'Defend Earth from waves of descending alien invaders!' },
      { name: 'Flappy Bird', href: 'flappybird.html', category: 'arcade', icon: '🐦', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)', description: 'Tap to flap through pipes — how far can you go?' },
      { name: 'Sliding Tile Puzzle', href: 'slidingpuzzle.html', category: 'puzzle', icon: '🧩', gradient: 'linear-gradient(135deg, #38bdf8, #1e40af)', description: 'Arrange numbered tiles to solve the puzzle!' }
    ]
  }),
  getters: {
    categories: (state) => [...new Set(state.games.map(g => g.category))],
    getGamesByCategory: (state) => (category) => state.games.filter(g => g.category === category),
    searchGames: (state) => (query) => {
      const q = query.toLowerCase().trim();
      if (!q) return state.games;
      return state.games.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }
  }
});
