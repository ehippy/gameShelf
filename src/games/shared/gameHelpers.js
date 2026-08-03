/**
 * Shared handleKeydown state-transition helper for gameShelf games.
 *
 * Provides a factory that returns a three-way state-transition function
 * used by each game's handleKeydown.
 */

/**
 * Create a three-way handleKeydown state-transition function.
 *
 * @param {function(): object} getInitialResetFn — A function that creates and
 *   returns a fresh game state object (like createInitialState), performing any
 *   game-specific setup (e.g. spawn food, fill bag, create piece). The returned
 *   object replaces the game's state.
 *
 * @returns {(state, key, validKeys, actionFn, onTransition) => void}
 *   A state-transition function. Each game's handleKeydown calls this
 *   for state transitions, then performs its game-specific action.
 *
 *   Parameters:
 *     - state: a getter function () => stateObject (so the helper always reads
 *       the current value even after resetFn reassigns the module-level state).
 *       Also used as an object to read from (backward compat — the getter is
 *       called internally, so games still pass the module-level state var).
 *     - key: the key that was pressed
 *     - validKeys: array of key strings that trigger state transitions
 *     - actionFn(key): callback for the "already playing" game-specific action
 *     - onTransition(): optional callback invoked when a transition occurs
 *       (case 1 or case 2, i.e. game over reset or game start from not-playing)
 *
 *   Behavior (three-way logic):
 *     1. if state.isGameOver && validKeys.includes(key) → call getInitialResetFn(),
 *        then state.isPlaying = true, then onTransition()
 *     2. if !state.isPlaying && validKeys.includes(key) → state.isPlaying = true,
 *        then onTransition()
 *     3. if state.isPlaying && !state.isGameOver → actionFn(key)
 *     4. key not in validKeys and no transition → no-op (do nothing)
 */
export function handleKeydownTransition(getInitialResetFn) {
  return function transition(stateOrGetter, key, validKeys, actionFn, onTransition) {
    // Handle state being either a raw object or a getter function
    const getState = typeof stateOrGetter === 'function' ? stateOrGetter : () => stateOrGetter
    const s = getState()

    if (!s) return

    // Case 1: Game over → reset and start playing
    if (s.isGameOver && validKeys.includes(key)) {
      const newState = getInitialResetFn()
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
