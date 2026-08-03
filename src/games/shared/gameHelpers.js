/**
 * Shared handleKeydown state-transition helper for gameShelf games.
 *
 * Provides a factory that returns a three-way state-transition function
 * used by each game's handleKeydown.
 */

/**
 * Create a three-way handleKeydown handler.
 *
 * @param {() => void} resetFn — Game-specific reset callback. Called when
 *   the game is over and a valid key is pressed. The callback must:
 *   (a) reset state to initial conditions,
 *   (b) NOT set state.isPlaying — the helper handles that.
 *
 * @returns {(state, key, validKeys, actionFn) => void}
 *   A state-transition function. Each game's handleKeydown calls this
 *   for state transitions, then performs its game-specific action.
 *
 *   Parameters:
 *     - state: the current game state object (read/write). If resetFn
 *       reassigns the module-level state variable, the helper re-reads
 *       via the game's state getter to get the new object.
 *     - key: the key that was pressed
 *     - validKeys: array of key strings that trigger state transitions
 *     - actionFn(key): callback for the "already playing" game-specific action
 *
 *   Behavior (three-way logic):
 *     1. if state.isGameOver && validKeys.includes(key) → resetFn(),
 *        then re-read state, then set isPlaying = true
 *     2. if !state.isPlaying && validKeys.includes(key) → state.isPlaying = true
 *     3. if state.isPlaying && !state.isGameOver → actionFn(key)
 *     4. key not in validKeys and no transition → no-op (do nothing)
 */
export function handleKeydownTransition(resetFn) {
  return function transition(state, key, validKeys, actionFn) {
    if (!state) return

    // Case 1: Game over → reset and start playing
    if (state.isGameOver && validKeys.includes(key)) {
      resetFn()
      state.isPlaying = true
      return
    }

    // Case 2: Not playing → start playing
    if (!state.isPlaying && validKeys.includes(key)) {
      state.isPlaying = true
      return
    }

    // Case 3: Already playing → game-specific action
    if (state.isPlaying && !state.isGameOver) {
      actionFn(key)
    }
    // Case 4: key not in validKeys and no transition → no-op
  }
}
