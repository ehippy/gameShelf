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
 * Detect the anti-pattern in a single gameLogic.js file.
 *
 * Algorithm:
 *   1. Find the line containing `handleKeydownTransition(`
 *   2. From that line, locate the callback (arrow function or
 *      regular function) and its body boundaries using brace-depth
 *      tracking.
 *   3. Search the callback body for `state = createInitialState(`
 *
 * Returns an array of 1-indexed line numbers where the anti-pattern
 * appears, or an empty array if the file is clean.
 */
function detectAntiPattern(content) {
  const violations = []
  const lines = content.split('\n')

  let i = 0
  while (i < lines.length) {
    // Step 1: find handleKeydownTransition( call
    if (!/handleKeydownTransition\s*\(/.test(lines[i])) {
      i++
      continue
    }

    // Step 2: from this line, find the callback and track its body.
    // The callback is the argument to handleKeydownTransition — typically
    // () => { ... } or function() { ... }.
    // We track brace depth from the opening { of the callback body.
    let braceDepth = 0
    let inCallback = false
    let callbackStartLine = -1

    for (let j = i; j < lines.length; j++) {
      const cl = lines[j]

      // Look for the start of the callback body:
      // arrow: () => {  or  (params) => {
      // function: function() {  or  function(params) {
      if (!inCallback && /\(\)\s*=>\s*\{/.test(cl)) {
        inCallback = true
        callbackStartLine = j
        // Count braces on this line from the opening { onwards
        const braceIdx = cl.indexOf('{')
        let depth = 0
        for (let k = braceIdx; k < cl.length; k++) {
          if (cl[k] === '{') depth++
          else if (cl[k] === '}') depth--
        }
        braceDepth = depth
        if (depth === 0) {
          // Single-line callback: extract body between { and }
          const body = cl.slice(braceIdx + 1, cl.length - 1)
          if (/\bstate\s*=\s*createInitialState\s*\(/.test(body)) {
            violations.push(j + 1) // 1-indexed
          }
        }
      } else if (!inCallback && /\bfunction\s*\(\s*\)\s*\{/.test(cl)) {
        inCallback = true
        callbackStartLine = j
        const braceIdx = cl.indexOf('{')
        let depth = 0
        for (let k = braceIdx; k < cl.length; k++) {
          if (cl[k] === '{') depth++
          else if (cl[k] === '}') depth--
        }
        braceDepth = depth
        if (depth === 0) {
          const body = cl.slice(braceIdx + 1, cl.length - 1)
          if (/\bstate\s*=\s*createInitialState\s*\(/.test(body)) {
            violations.push(j + 1)
          }
        }
      } else if (inCallback) {
        // Track brace depth inside callback body
        for (const ch of cl) {
          if (ch === '{') braceDepth++
          else if (ch === '}') braceDepth--
        }

        if (braceDepth <= 0) {
          // End of callback body — scan the callback for the anti-pattern
          for (let k = callbackStartLine; k <= j; k++) {
            if (k === callbackStartLine) {
              // Check from the { onwards only (skip the callback declaration)
              const braceIdx = lines[k].indexOf('{')
              if (braceIdx !== -1) {
                const body = lines[k].slice(braceIdx + 1)
                if (/\bstate\s*=\s*createInitialState\s*\(/.test(body)) {
                  violations.push(k + 1)
                }
              }
            } else {
              if (/\bstate\s*=\s*createInitialState\s*\(/.test(lines[k])) {
                violations.push(k + 1)
              }
            }
          }
          inCallback = false
        }
      }
    }

    i++
  }

  return violations
}

// ---- Main ----

const gameFiles = findGameLogicFiles(repoRoot)
let allViolations = []

for (const file of gameFiles) {
  const content = fs.readFileSync(file, 'utf-8')
  const violations = detectAntiPattern(content)

  for (const lineNo of violations) {
    const relPath = path.relative(repoRoot, file)
    const lineText = content.split('\n')[lineNo - 1].trim()
    allViolations.push({ file: relPath, lineNo, lineText })
  }
}

if (allViolations.length > 0) {
  console.error(
    '\nERROR: State reassignment detected inside handleKeydownTransition resetFn.\n'
  )
  for (const v of allViolations) {
    console.error(
      `\nFile: ${v.file}\n` +
        `Line ${v.lineNo}: ${v.lineText}\n` +
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
