/**
 * Shared handleKeydown state-transition helper for gameShelf games.
 *
 * Provides a factory that returns a three-way state-transition function
 * used by each game's handleKeydown.
 */

/**
 * Create a three-way handleKeydown state-transition function.
 *
 * @param {() => void} resetFn — Game-specific reset callback. Called when
 *   the game is over and a valid key is pressed. The callback must:
 *   (a) reset state to initial conditions,
 *   (b) set state.isPlaying = true.
 *
 * @returns {(state, key, validKeys, actionFn, onTransition) => void}
 *   A state-transition function. Each game's handleKeydown calls this
 *   for state transitions, then performs its game-specific action.
 *
 *   Parameters:
 *     - state: the current game state object (read/write)
 *     - key: the key that was pressed
 *     - validKeys: array of key strings that trigger state transitions
 *     - actionFn(key): callback for the "already playing" game-specific action
 *     - onTransition(): optional callback invoked whenever a transition
 *       occurs (case 1 or case 2). Useful when the action must run on
 *       every valid keypress regardless of game state.
 *
 *   Behavior (three-way logic):
 *     1. if state.isGameOver && validKeys.includes(key) → resetFn(), state.isPlaying = true, then onTransition()
 *     2. if !state.isPlaying && validKeys.includes(key) → state.isPlaying = true, then onTransition()
 *     3. if state.isPlaying && !state.isGameOver → actionFn(key)
 *     4. key not in validKeys and no transition → no-op (do nothing)
 */
export function handleKeydownTransition(resetFn) {
  return function transition(state, key, validKeys, actionFn, onTransition) {
    if (!state) return

    // Case 1: Game over → reset and start playing
    if (state.isGameOver && validKeys.includes(key)) {
      resetFn()
      state.isPlaying = true
      if (onTransition) onTransition()
      return
    }

    // Case 2: Not playing → start playing
    if (!state.isPlaying && validKeys.includes(key)) {
      state.isPlaying = true
      if (onTransition) onTransition()
      return
    }

    // Case 3: Already playing → game-specific action
    if (state.isPlaying && !state.isGameOver) {
      actionFn(key)
    }
    // Case 4: key not in validKeys and no transition → no-op
  }
}
