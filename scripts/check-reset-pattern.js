#!/usr/bin/env node
/**
 * Pre-commit hook: detects `state = createInitialState()` variable
 * reassignment inside `handleKeydownTransition` resetFn callbacks.
 *
 * The shared `handleKeydownTransition` helper expects its resetFn to
 * mutate the passed-in `state` object via `Object.assign(state,
 * createInitialState())`.  Reassigning `state = createInitialState()`
 * inside the callback breaks the helper because it sets `isPlaying` on
 * a stale object the game no longer references.
 *
 * Correct: `Object.assign(state, createInitialState())`
 * Broken:  `state = createInitialState()`  (inside transition callback)
 *
 * Exits non-zero when violations are found, preventing the commit.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

// Find all gameLogic.js files under src/games/
function findGameLogicFiles(rootDir) {
  const results = []
  const gamesDir = path.join(rootDir, 'src', 'games')

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name === 'gameLogic.js') {
        results.push(full)
      }
    }
  }

  if (fs.existsSync(gamesDir)) walk(gamesDir)
  return results
}

/**
 * Find the opening brace line index for a callback starting at
 * handleKeydownTransition( on `startLine` (0-indexed).  Walks forward
 * from startLine until it finds the first `{`, then returns that
 * line index.  Returns -1 if not found.
 */
function findCallbackOpeningBrace(lines, startLine) {
  for (let j = startLine; j < lines.length; j++) {
    if (lines[j].indexOf('{') !== -1) return j
  }
  return -1
}

/**
 * Extract the body text lines of the handleKeydownTransition callback.
 *
 * Walks from the line containing `handleKeydownTransition(` to find
 * the opening `{`, then tracks brace depth until it reaches 0,
 * collecting body lines along the way.
 *
 * Returns an array of body-line strings, or null if not found.
 */
function extractTransitionCallbackBody(content) {
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (!/handleKeydownTransition\s*\(/.test(lines[i])) continue

    const openLine = findCallbackOpeningBrace(lines, i)
    if (openLine === -1) continue

    // Collect body from the brace on openLine
    let bodyLines = [lines[openLine].slice(lines[openLine].indexOf('{') + 1)]
    let braceDepth = 1

    for (let j = openLine + 1; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }
      if (braceDepth <= 0) {
        // Closing line: take content before the final }
        const closeIdx = lines[j].lastIndexOf('}')
        bodyLines.push(lines[j].slice(0, closeIdx))
        return bodyLines
      }
      bodyLines.push(lines[j])
    }
    // No matching } — malformed, skip this occurrence
  }

  return null
}

/**
 * Extract the body of the reset() function from the file content.
 * Looks for `function reset()` or `export function reset()` and
 * returns the lines inside its body (not including the function
 * declaration line).
 */
function extractResetFunctionBody(content) {
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (!/\bfunction\s+reset\s*\(/.test(lines[i])) continue

    // Find opening brace
    const openLine = findCallbackOpeningBrace(lines, i)
    if (openLine === -1) continue

    let bodyLines = [lines[openLine].slice(lines[openLine].indexOf('{') + 1)]
    let braceDepth = 1

    for (let j = openLine + 1; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }
      if (braceDepth <= 0) {
        const closeIdx = lines[j].lastIndexOf('}')
        bodyLines.push(lines[j].slice(0, closeIdx))
        return bodyLines
      }
      bodyLines.push(lines[j])
    }
  }

  return null
}

/**
 * Check if the callback body contains the anti-pattern.
 *
 * Two kinds of violations:
 *   1. Direct: `state = createInitialState(` appears in the body
 *   2. Indirect: the body calls `reset()` only, and the file's
 *      `reset()` function contains `state = createInitialState(`
 *
 * Returns array of violation descriptions, or empty if clean.
 */
function detectAntiPattern(content) {
  const violations = []

  const callbackBody = extractTransitionCallbackBody(content)
  if (!callbackBody) return violations

  // Pattern 1: Direct state reassignment
  for (let i = 0; i < callbackBody.length; i++) {
    if (/\bstate\s*=\s*createInitialState\s*\(/.test(callbackBody[i])) {
      violations.push({
        lineNo: i + 1, // 1-indexed within body
        text: callbackBody[i].trim(),
        type: 'direct',
      })
    }
  }

  // Pattern 2: Callback body is just `reset()` — check if reset() does reassignment
  const trimmedLines = callbackBody
    .map(l => l.trim())
    .filter(l => l.length > 0)

  const isOnlyReset =
    trimmedLines.length === 1 &&
    /^reset\s*\(\s*\)\s*;?\s*$/.test(trimmedLines[0])

  if (isOnlyReset) {
    const resetFuncBody = extractResetFunctionBody(content)
    if (resetFuncBody) {
      const resetText = resetFuncBody.join('\n')
      if (/\bstate\s*=\s*createInitialState\s*\(/.test(resetText)) {
        violations.push({
          lineNo: null,
          text: 'calls reset() which does `state = createInitialState()`',
          type: 'indirect',
        })
      }
    }
  }

  return violations
}

// ---- Main ----

const gameFiles = findGameLogicFiles(repoRoot)
let allViolations = []

for (const file of gameFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const violations = detectAntiPattern(content)

  if (violations.length > 0) {
    const relPath = path.relative(repoRoot, file)
    for (const v of violations) {
      allViolations.push({ file: relPath, ...v })
    }
  }
}

if (allViolations.length > 0) {
  console.error(
    '\nERROR: State reassignment detected inside handleKeydownTransition resetFn.\n'
  )
  for (const v of allViolations) {
    console.error(
      `\nFile: ${v.file}\n` +
        (v.lineNo !== null ? `Line ${v.lineNo}: ${v.text}\n` : '') +
        `Reason: ${v.text}\n` +
        '\n' +
        'The resetFn must use Object.assign(state, createInitialState()) ' +
        'instead of reassigning the state variable.\n' +
        'Reassigning breaks the helper because it sets isPlaying = true ' +
        'on a stale object the game no longer references.\n' +
        '\n' +
        'Fix: Replace `state = createInitialState()` with ' +
        '`Object.assign(state, createInitialState())` in the transition callback.\n'
    )
  }
  process.exit(1)
}

process.exit(0)
