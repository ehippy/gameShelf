#!/usr/bin/env node
/**
 * Pre-commit hook helper: detects copy-pasted test assertions with identical
 * expected values.  Scans test files for sequences where
 * two or more consecutive it() blocks within the same describe block
 * share the exact same expect(...).toBe(X) line.
 *
 * This is a blocking pre-commit guard that detects copy-pasted test
 * assertions with identical expected values.  Exits non-zero when dupes
 * are found, preventing the commit from being created.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ---- Helpers ----

function findTestFiles(rootDir) {
  const results = []
  const patternBase = path.join(rootDir, 'tests')

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
      } else if (entry.name.endsWith('.test.js')) {
        // Exclude e2e spec files just in case
        if (!entry.name.endsWith('.spec.js')) {
          results.push(full)
        }
      }
    }
  }

  if (fs.existsSync(patternBase)) walk(patternBase)
  return results
}

/**
 * Parse a single test file and return an array of describe-scope records.
 *
 * Each record: {
 *   filePath: string,
 *   describeScope: string[],        // names of enclosing describe blocks
 *   testName: string,
 *   assertion: string               // exact line with expect(...).toBe(...)
 * }
 */
function parseFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
  const records = []
  const describeStack = []
  let currentItName = null
  let inItBlock = false
  let braceDepth = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    const describeMatch = trimmed.match(
      /describe\s*\(\s*['"](.+?)['"]/
    )
    // Detect it() blocks - handle names with nested quotes by matching
    // the last quote before the closing paren + args
    const itMatch = trimmed.match(
      /it\s*\(\s*['"]([\s\S]*?)['"]\s*,/
    )

    if (describeMatch && !inItBlock) {
      describeStack.push(describeMatch[1])
    }

    if (itMatch && !inItBlock) {
      currentItName = itMatch[1]
      inItBlock = true
    }

    // Count braces to track when we exit an it block
    if (inItBlock) {
      const openBraces = (line.match(/{/g) || []).length
      const closeBraces = (line.match(/}/g) || []).length
      braceDepth += openBraces - closeBraces

      if (braceDepth <= 0 && i > 0) {
        inItBlock = false
        braceDepth = 0
      }
    }

    // Capture assertions - look for expect(...).toBe(...) lines
    // Skip .not.toBe() patterns (legitimate to repeat)
    if (inItBlock && /\bexpect\s*\(/.test(line)) {
      if (/\bexpect\s*\(.*?\)\s*\.not\s*\./.test(line)) {
        continue // skip .not.* assertions
      }
      if (/\bexpect\s*\(.*?\)\s*\.toBe\s*\(/.test(line)) {
        // Normalize the assertion line to detect true copy-paste errors.
        // Replace variable-based expressions (scoreBefore, before + 10, etc.)
        // with a generic marker so they never produce false positives — two
        // tests that both assert .toBe(scoreBefore) are checking different
        // local variables and are legitimate.
        let normalized = trimmed
          // Replace variable-before-expression patterns: "before + 10", "before - 1"
          .replace(/\bbefore\s*[+\-]\s*\d/g, '<VAR>')
          // Replace variable references ending in "Before" (scoreBefore, xBefore, dyBefore)
          .replace(/\b[a-zA-Z]+\w*Before\b/g, '<VAR>')
          // Replace standalone "before" variable references
          .replace(/\bbefore\b/g, '<VAR>')
        records.push({
          filePath,
          describeScope: [...describeStack],
          testName: currentItName,
          assertion: normalized,
        })
      }
    }

    // Track describe closing via } at start of line
    if (describeStack.length > 0) {
      if (line.trim() === '}' && !inItBlock) {
        describeStack.pop()
      }
    }
  }

  return records
}

/**
 * Group records by describe scope within a file, then scan for consecutive
 * it blocks that share identical expect subjects (copy-pasted assertions
 * with stale expected values).
 */
function findDuples(records) {
  const findings = []

  // Group by (filePath + describeScope)
  const byScope = new Map()
  for (const rec of records) {
    const key = rec.filePath + '|||' + rec.describeScope.join(' > ')
    if (!byScope.has(key)) byScope.set(key, [])
    byScope.get(key).push(rec)
  }

  for (const [scopeKey, scopeRecords] of byScope) {
    let i = 0
    while (i < scopeRecords.length) {
      const currentRec = scopeRecords[i]
      // Look ahead for consecutive records with matching dupeKey
      const matchedIndices = [i]
      for (let j = i + 1; j < scopeRecords.length; j++) {
        if (scopeRecords[j].dupeKey === currentRec.dupeKey) {
          matchedIndices.push(j)
        } else {
          break // only consecutive matches
        }
      }

      if (matchedIndices.length >= 2) {
        // Collect all runs of consecutive identical dupeKeys
        // matchedIndices are all positions with the same dupeKey
        // We want runs that are truly consecutive (no gaps)
        const runs = [[matchedIndices[0]]]
        for (let m = 1; m < matchedIndices.length; m++) {
          const prev = matchedIndices[m - 1]
          const curr = matchedIndices[m]
          // Check if this index is immediately after the previous one
          // (consecutive in the scopeRecords array)
          if (curr === prev + 1) {
            runs[runs.length - 1].push(curr)
          } else {
            runs.push([curr])
          }
        }

        let foundValid = false
        for (const run of runs) {
          if (run.length < 2) continue
          const assertionText = scopeRecords[run[0]].assertion
          const filePath = scopeRecords[run[0]].filePath
          const testNames = run.map(idx => scopeRecords[idx].testName)

          // Only flag if the tests are actually different
          // (two identical assertions within the same it() block is legitimate)
          if (new Set(testNames).size < 2) continue

          // Additionally, ensure that the run does not contain two records from
          // the same it() block — those are same-block dupes, not cross-test dupes.
          // We collect one record per unique it() block, preserving order.
          const seenTests = new Set()
          const dedupedRun = []
          for (const idx of run) {
            const tName = scopeRecords[idx].testName
            if (!seenTests.has(tName)) {
              seenTests.add(tName)
              dedupedRun.push(idx)
            }
          }

          // After deduplication, we need at least 2 records from different tests
          if (dedupedRun.length < 2) continue

          findings.push({
            filePath,
            testNames: dedupedRun.map(idx => scopeRecords[idx].testName),
            assertion: assertionText,
          })

          // Skip past this run
          i = matchedIndices[matchedIndices.length - 1] + 1
          foundValid = true
          break // break from the runs loop to continue outer while
        }
        if (!foundValid) i++
        continue
      }

      i++
    }
  }

  return findings
}

/**
 * Deduplicate findings: if the same file/test pair appears in multiple
 * ranges due to overlapping runs, merge them.
 */
function deduplicateFindings(findings) {
  const seen = new Set()
  const result = []
  for (const f of findings) {
    const key = f.filePath + '|||' + f.testNames.join(', ') + '|||' + f.assertion
    if (!seen.has(key)) {
      seen.add(key)
      result.push(f)
    }
  }
  return result
}

// ---- Main ----

const repoRoot = path.resolve(__dirname, '..')
const testFiles = findTestFiles(repoRoot)
let allRecords = []

for (const file of testFiles) {
  const records = parseFile(file)
  allRecords = allRecords.concat(records)
}

const findings = findDuples(allRecords)
const deduped = deduplicateFindings(findings)

if (deduped.length > 0) {
  console.error(
    '\nPossible copy-pasted assertion detected in ' + deduped.length + ' location(s):\n'
  )
  for (let i = 0; i < deduped.length; i++) {
    const f = deduped[i]
    const relPath = path.relative(repoRoot, f.filePath)
    console.error('  ' + (i + 1) + '. File: ' + relPath)
    console.error('     Tests:')
    for (const name of f.testNames) {
      console.error('       - "' + name + '"')
    }
    console.error('     Duped assertion: ' + f.assertion)
    console.error('     (Review: ensure each test verifies the correct expected value)\n')
  }
}

// Exit non-zero on dupes to block the commit
process.exit(deduped.length > 0 ? 1 : 0)
