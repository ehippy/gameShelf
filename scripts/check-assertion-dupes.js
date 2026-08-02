#!/usr/bin/env node
/**
 * Pre-commit hook helper: detects copy-pasted test assertions with identical
 * expected values.  Scans test files for sequences where
 * two or more consecutive it() blocks within the same describe block
 * share the exact same expect(...).toBe(X) line.
 *
 * This is a warning-only check - always exits 0 - so developers can review
 * flagged patterns and decide if they are real copy-paste bugs.
 */
import fs from 'node:fs'
import path from 'node:path'

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
    const itMatch = trimmed.match(
      /it\s*\(\s*['"](.+?)['"]/
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
        records.push({
          filePath,
          describeScope: [...describeStack],
          testName: currentItName,
          assertion: trimmed,
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
 * it blocks that share identical assertions.
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
      // Look ahead for consecutive records with matching assertions
      const matchedIndices = [i]
      for (let j = i + 1; j < scopeRecords.length; j++) {
        if (scopeRecords[j].assertion === currentRec.assertion) {
          matchedIndices.push(j)
        } else {
          break // only consecutive matches
        }
      }

      if (matchedIndices.length >= 2) {
        // Collect all runs of consecutive identical assertions
        // matchedIndices are all positions with the same assertion
        // They may not be contiguous due to different assertion lines in between
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

        for (const run of runs) {
          if (run.length < 2) continue
          const assertionText = scopeRecords[run[0]].assertion
          const filePath = scopeRecords[run[0]].filePath
          const testNames = run.map(idx => scopeRecords[idx].testName)

          findings.push({
            filePath,
            testNames,
            assertion: assertionText,
          })

          // Skip past this run
          i = matchedIndices[matchedIndices.length - 1] + 1
          break // break from the runs loop to continue outer while
        }
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

// Always exit 0 - this is a warning, not a blocker
process.exit(0)
