/**
 * Shared game-over overlay rendering utilities for gameShelf games.
 * Export: renderGameOver(ctx, state, canvasWidth, canvasHeight, options)
 */

/**
 * Render a game-over overlay on the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D canvas context.
 * @param {object} state - Game state (must have `score` property).
 * @param {number} canvasWidth - Canvas width in pixels.
 * @param {number} canvasHeight - Canvas height in pixels.
 * @param {object} [options] - Rendering options.
 */
export function renderGameOver(ctx, state, canvasWidth, canvasHeight, options = {}) {
  const {
    overlayColor = 'rgba(0, 0, 0, 0.75)',
    title = 'GAME OVER',
    titleColor = '#ff4444',
    titleFont = 'bold 28px sans-serif',
    titleY = canvasHeight / 2 - 20,
    scoreText = `Score: ${state.score}`,
    scoreColor = '#ffffff',
    scoreFont = '18px sans-serif',
    scoreY = canvasHeight / 2 + 20,
    showRestartPrompt = false,
    restartPromptText = 'Press Space to restart',
    restartPromptColor = '#cccccc',
    restartPromptFont = '12px sans-serif',
    restartPromptY = canvasHeight / 2 + 45,
    lines = []
  } = options

  // 1. Semi-transparent dark overlay
  ctx.fillStyle = overlayColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  // Center text alignment for all text below
  ctx.textAlign = 'center'

  // 2. Title text
  ctx.fillStyle = titleColor
  ctx.font = titleFont
  ctx.fillText(title, canvasWidth / 2, titleY)

  // 3. Score text
  ctx.fillStyle = scoreColor
  ctx.font = scoreFont
  ctx.fillText(scoreText, canvasWidth / 2, scoreY)

  // 4. Optional extra lines
  for (const line of lines) {
    ctx.fillStyle = line.color
    ctx.font = line.font
    ctx.fillText(line.text, canvasWidth / 2, line.y)
  }

  // 5. Optional restart prompt
  if (showRestartPrompt) {
    ctx.fillStyle = restartPromptColor
    ctx.font = restartPromptFont
    ctx.fillText(restartPromptText, canvasWidth / 2, restartPromptY)
  }
}
