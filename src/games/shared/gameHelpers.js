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
 *   (b) NOT set state.isPlaying — the helper handles that.
 *
 * @returns {(getState, key, validKeys, actionFn, onTransition) => void}
 *   A state-transition function. Each game's handleKeydown calls this
 *   for state transitions, then performs its game-specific action.
 *
 *   Parameters:
 *     - getState: a getter function () => stateObject. The helper calls this
 *       to read the current state, and re-calls it after resetFn to get the
 *       new state object so it can set isPlaying = true.
 *     - key: the key that was pressed
 *     - validKeys: array of key strings that trigger state transitions
 *     - actionFn(key): callback for the "already playing" game-specific action
 *     - onTransition(): optional callback invoked when a transition occurs
 *       (case 1 or case 2)
 *
 *   Behavior (three-way logic):
 *     1. if state.isGameOver && validKeys.includes(key) → resetFn(),
 *        then newState.isPlaying = true, then onTransition()
 *     2. if !state.isPlaying && validKeys.includes(key) → state.isPlaying = true,
 *        then onTransition()
 *     3. if state.isPlaying && !state.isGameOver → actionFn(key)
 *     4. key not in validKeys and no transition → no-op (do nothing)
 */
export function handleKeydownTransition(resetFn) {
  return function transition(getState, key, validKeys, actionFn, onTransition) {
    const s = getState()

    if (!s) return

    // Case 1: Game over → reset and start playing
    if (s.isGameOver && validKeys.includes(key)) {
      resetFn()
      const newState = getState()
      newState.isPlaying = true
      if (onTransition) onTransition()
      return
    }

    // Case 2: Not playing → start playing
    if (!s.isPlaying && validKeys.includes(key)) {
      s.isPlaying = true
      if (onTransition) onTransition()
      return
    }

    // Case 3: Already playing → game-specific action
    if (s.isPlaying && !s.isGameOver) {
      actionFn(key)
    }
    // Case 4: key not in validKeys and no transition → no-op
  }
}
