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
 * Extract the body text of the handleKeydownTransition callback.
 *
 * Looks for `handleKeydownTransition(` and then tracks brace depth
 * from the opening `{` of the callback body to find its end.
 * Returns the body text (everything between { and the matching }).
 */
function extractTransitionCallbackBody(content) {
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (!/handleKeydownTransition\s*\(/.test(lines[i])) continue

    // Find the opening { of the callback body
    for (let j = i; j < lines.length; j++) {
      const cl = lines[j]
      const braceIdx = cl.indexOf('{')
      if (braceIdx === -1) continue

      // Make sure this { is after handleKeydownTransition( on the same line
      // or on a subsequent line (callback declaration)
      let afterTransition = false
      if (j === i) {
        afterTransition = cl.indexOf('handleKeydownTransition') !== -1
      }
      if (!afterTransition) {
        // This { is on a different line — it's either a nested function
        // or the callback body. We'll handle brace tracking below.
      }

      let braceDepth = 0
      let bodyStart = -1
      let bodyEnd = -1
      let bodyLines = []

      for (let k = braceIdx; k < cl.length; k++) {
        if (cl[k] === '{') braceDepth++
        else if (cl[k] === '}') braceDepth--
      }

      if (braceDepth === 0) {
        // Single-line: { }
        bodyStart = braceIdx + 1
        bodyEnd = cl.length - 1
        bodyLines = [cl.slice(bodyStart, bodyEnd)]
        return bodyLines
      }

      // Multi-line: collect body lines
      bodyLines = [cl.slice(braceIdx + 1)]
      for (let m = j + 1; m < lines.length; m++) {
        for (const ch of lines[m]) {
          if (ch === '{') braceDepth++
          else if (ch === '}') braceDepth--
        }
        bodyLines.push(lines[m])
        if (braceDepth <= 0) {
          // Last line: take content up to the closing }
          const lastIdx = lines[m].lastIndexOf('}')
          bodyLines[bodyLines.length - 1] = lines[m].slice(0, lastIdx)
          return bodyLines
        }
      }

      // No matching } found — malformed, skip
      break
    }
  }

  return null
}

/**
 * Check if the callback body contains the anti-pattern.
 *
 * Two kinds of violations:
 *   1. Direct: `state = createInitialState(` appears in the body
 *   2. Indirect: the body calls `reset()` and the file's `reset()`
 *      function contains `state = createInitialState(` — meaning
 *      the transition delegates to a reset() that does the wrong thing.
 *
 * Returns array of violation descriptions, or empty if clean.
 */
function detectAntiPattern(content) {
  const violations = []

  // Check for direct anti-pattern in transition callback body
  const callbackBody = extractTransitionCallbackBody(content)
  if (callbackBody) {
    const bodyText = callbackBody.join('\n')

    // Pattern 1: Direct state reassignment
    const reassignLines = []
    for (let i = 0; i < callbackBody.length; i++) {
      if (/\bstate\s*=\s*createInitialState\s*\(/.test(callbackBody[i])) {
        reassignLines.push(i + 1) // 1-indexed within body
      }
    }

    if (reassignLines.length > 0) {
      for (const lineNo of reassignLines) {
        violations.push({
          lineNo: lineNo,
          text: callbackBody[lineNo - 1].trim(),
          type: 'direct',
        })
      }
    }

    // Pattern 2: Callback calls reset() only — check if reset() does reassignment
    const trimmedLines = callbackBody.map(l => l.trim()).filter(l => l.length > 0)

    // Check if the callback body is just `reset()` (possibly with trailing semicolons/whitespace)
    const isOnlyReset = trimmedLines.length === 1 &&
      /^reset\s*\(\s*\)\s*;?\s*$/.test(trimmedLines[0])

    if (isOnlyReset) {
      // Check if the file's reset() function contains `state = createInitialState(`
      const resetFuncBody = extractResetFunctionBody(content)
      if (resetFuncBody) {
        const resetText = resetFuncBody.join('\n')
        if (/\bstate\s*=\s*createInitialState\s*\(/.test(resetText)) {
          violations.push({
            lineNo: null, // callback-level violation
            text: 'calls reset() which does `state = createInitialState()`',
            type: 'indirect',
          })
        }
      }
    }
  }

  return violations
}

/**
 * Extract the body of the reset() function from the file content.
 * Looks for `export function reset()` or `function reset()` and
 * returns the lines inside its body.
 */
function extractResetFunctionBody(content) {
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const cl = lines[i]
    if (!/\bfunction\s+reset\s*\(/.test(cl)) continue

    // Find the opening {
    let braceDepth = 0
    let bodyLines = []

    for (let j = i; j < lines.length; j++) {
      const line = lines[j]
      for (const ch of line) {
        if (ch === '{') braceDepth++
        else if (ch === '}') braceDepth--
      }

      if (braceDepth > 0) {
        // Check if { is the function body opening
        const braceIdx = line.indexOf('{')
        if (braceIdx !== -1) {
          bodyLines.push(line.slice(braceIdx + 1))
        } else {
          bodyLines.push(line)
        }
        if (braceDepth <= 0) {
          return bodyLines
        }
      } else {
        // { might be at the end of this line
        const braceIdx = line.indexOf('{')
        if (braceIdx !== -1) {
          bodyLines = [line.slice(braceIdx + 1)]
        } else {
          bodyLines = [line]
        }
      }
    }

    if (bodyLines.length > 0) return bodyLines
  }

  return null
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
      if (v.type === 'direct') {
        allViolations.push({
          file: relPath,
          lineNo: v.lineNo,
          text: v.text,
          type: v.type,
        })
      } else {
        allViolations.push({
          file: relPath,
          lineNo: null,
          text: v.text,
          type: v.type,
        })
      }
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
