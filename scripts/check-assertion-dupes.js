/**
 * Pre-commit hook helper: detects copy-pasted test assertions with identical
 * expected values.  Scans all test files for sequences where
 * two or more consecutive it() blocks within the same describe block
 * share the exact same expect(...).toBe(X) line.
 *
 * This is a warning-only check - always exits 0 - so developers can review
 * flagged patterns and decide if they are real copy-paste bugs.
 */
import fs from 'node:fs'
import path from 'node:path'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Expand a glob-like `tests/**/*.test.js` pattern into file paths. */
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
 *   assertions: string[]            // exact lines with expect(...).toBe(...)
 * }
 */
function parseFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
  const records = []

  // describeStack holds describe block names at each nesting level
  const describeStack = []

  // Current it block tracking
  let currentItName = null
  let currentItScope = []
  let currentItDepth = 0
  let inItBlock = false
  let braceDepth = 0
  const itBraceTarget = 0 // depth at which we opened the it body

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Track describe blocks (push on {, pop on })
    // We detect describe boundaries by matching the opening pattern
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
      currentItScope = [...describeStack]
      inItBlock = true
      // The it block body will start after this line's opening `{`
    }

    // Count braces to track when we exit an it block
    if (inItBlock) {
      // Count braces in this line
      const openBraces = (line.match(/{/g) || []).length
      const closeBraces = (line.match(/}/g) || []).length
      braceDepth += openBraces - closeBraces

      if (braceDepth <= 0 && i > 0) {
        // We've exited the it block body
        inItBlock = false
        braceDepth = 0
      }
    }

    // Capture assertions — look for expect(...).toBe(...) lines
    // Skip .not.toBe() patterns (legitimate to repeat)
    if (inItBlock && /\bexpect\s*\(/.test(line)) {
      // Check if this is a .not.toBe() or .not.toContain()
      if (/\bexpect\s*\(.*?\)\s*\.not\s*\./.test(line)) {
        continue // skip .not.* assertions
      }
      // Check if it's an expect(...).toBe(...) pattern
      if (/\bexpect\s*\(.*?\)\s*\.toBe\s*\(/.test(line)) {
        records.push({
          filePath,
          describeScope: [...describeStack],
          testName: currentItName,
          assertion: trimmed,
        })
      }
    }

    // Also track describe closing via } at start of line (simplified)
    if (describeStack.length > 0) {
      // Very simplified: if we see a line that's mostly closing braces
      // and it's not inside an it block, pop the describe stack
      const pureClosingLines = /^[\s}]*$/.test(line) && line.trim() === '}'
      if (pureClosingLines && !inItBlock) {
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
    const key = `${rec.filePath}|||${rec.describeScope.join(' > ')}`
    if (!byScope.has(key)) byScope.set(key, [])
    byScope.get(key).push(rec)
  }

  for (const [scopeKey, scopeRecords] of byScope) {
    // scopeRecords is ordered as they appear in the file
    // Find consecutive it blocks with identical assertions
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
        // Group consecutive indices into sub-ranges (in case some differ in between)
        // We want maximal consecutive runs of the same assertion
        const runs = []
        let runStart = 0
        for (let r = 1; r <= matchedIndices.length; r++) {
          if (r === matchedIndices.length ||
              scopeRecords[matchedIndices[r]].testName !==
              scopeRecords[matchedIndices[r - 1]].testName ||
              scopeRecords[matchedIndices[r]].filePath !==
              scopeRecords[matchedIndices[r - 1]].filePath) {
            runs.push(matchedIndices.slice(runStart, r))
            runStart = r
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
          i = matchedIndices[run.length - 1] + 1
          continue
        }
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
    const key = `${f.filePath}|||${f.testNames.join(', ')}|||${f.assertion}`
    if (!seen.has(key)) {
      seen.add(key)
      result.push(f)
    }
  }
  return result
}

// ─── Main ───────────────────────────────────────────────────────────────────

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
    `\n⚠️  Possible copy-pasted assertion detected in ${deduped.length} location(s):\n`
  )
  for (let i = 0; i < deduped.length; i++) {
    const f = deduped[i]
    const relPath = path.relative(repoRoot, f.filePath)
    console.error(`  ${i + 1}. File: ${relPath}`)
    console.error('     Tests:')
    for (const name of f.testNames) {
      console.error(`       - "${name}"`)
    }
    console.error(`     Duped assertion: ${f.assertion}`)
    console.error('     (Review: ensure each test verifies the correct expected value)\n')
  }
}

// Always exit 0 — this is a warning, not a blocker
process.exit(0)
