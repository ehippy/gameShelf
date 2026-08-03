#!/usr/bin/env node
/**
 * Pre-commit hook helper: scans AGENTS.md's Last Reviewed section for
 * postmortem entries containing boilerplate **Struggles:** lines.
 *
 * The Card-Level Postmortems convention forbids empty or boilerplate
 * struggles entries.  This script detects violations so they don't
 * land without review.
 *
 * Boilerplate patterns (case-insensitive, trimmed):
 *   "Nothing notable", "None", "N/A", "No friction",
 *   "Clean card", "No struggles", empty/whitespace-only.
 *
 * Exits non-zero when violations are found, preventing the commit.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const BOILERPLATE_PATTERNS = [
  'nothing notable',
  'none',
  'n/a',
  'no friction',
  'clean card',
  'no struggles',
]

function isBoilerplate(text) {
  const trimmed = text.trim().toLowerCase().replace(/[.,;:!?\u2019\u2018]+$/, '')
  if (trimmed === '') return true
  return BOILERPLATE_PATTERNS.includes(trimmed)
}

// ---- Main ----

const agentsPath = path.join(repoRoot, 'AGENTS.md')
const content = fs.readFileSync(agentsPath, 'utf-8')

// Locate the Last Reviewed section: from `## Last Reviewed` to the next `## ` heading or EOF.
const lastReviewedIdx = content.indexOf('## Last Reviewed')
if (lastReviewedIdx === -1) {
  // No Last Reviewed section — nothing to check.
  process.exit(0)
}

// Find the next section heading (a line that starts with `## ` at the beginning).
const afterSection = content.slice(lastReviewedIdx)
const nextHeadingMatch = afterSection.match(/\n## [^#]/)
const sectionText = nextHeadingMatch
  ? afterSection.slice(0, nextHeadingMatch.index)
  : afterSection

// Split section into lines.
const lines = sectionText.split('\n')

// Parse entries: each starts with a line containing `- **Reviewed:**`.
// Collect lines belonging to each entry, stopping at the next entry start
// or end of section.
const entries = []
let currentEntry = null

for (const line of lines) {
  if (/^- \*\*Reviewed:\*\*/.test(line)) {
    if (currentEntry) entries.push(currentEntry)
    currentEntry = { lines: [line] }
  } else if (currentEntry) {
    currentEntry.lines.push(line)
  }
}
if (currentEntry) entries.push(currentEntry)

// Scan each entry for boilerplate **Struggles:** lines.
const violations = []

// Track global line offset (lines before Last Reviewed section).
const linesBeforeSection = content.slice(0, lastReviewedIdx).split('\n').length

for (let i = 0; i < entries.length; i++) {
  const entry = entries[i]
  for (let j = 0; j < entry.lines.length; j++) {
    const line = entry.lines[j]
    const strugglesMatch = line.match(/^\- \*\*Struggles:\*\*\s*(.*)/)
    if (strugglesMatch) {
      const content_ = strugglesMatch[1]
      if (isBoilerplate(content_)) {
        // The line number is the global position in AGENTS.md.
        const lineNumber = linesBeforeSection + 1 + lines.indexOf(sectionText.split('\n')[0]) + i + j
        // Find the Reviewed date for this entry.
        const dateMatch = entry.lines[0].match(/\*\*Reviewed:\*\*\s*(.+)/)
        const date = dateMatch ? dateMatch[1].trim() : 'unknown'
        violations.push({
          lineNumber,
          date,
          content: content_,
        })
      }
    }
  }
}

if (violations.length > 0) {
  for (const v of violations) {
    process.stderr.write(
      `[Line ${v.lineNumber}] Date: ${v.date} — "${v.content}"\n`
    )
  }
  process.exit(1)
}

process.exit(0)
