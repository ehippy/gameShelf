import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'node:child_process'
import { writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const scriptPath = join(root, 'scripts', 'check-postmortems.js')

const agentsPath = join(root, 'AGENTS.md')

describe('scripts/check-postmortems.js', () => {
  let originalContent

  beforeEach(() => {
    originalContent = readFileSync(agentsPath, 'utf-8')
  })

  afterEach(() => {
    writeFileSync(agentsPath, originalContent)
  })

  it('file exists and is executable via node', () => {
    const output = execFileSync('node', [scriptPath], { encoding: 'utf-8' })
    expect(output).toBe('')
  })

  it('exits 0 when Last Reviewed section has no violations', () => {
    const result = execFileSync('node', [scriptPath], { encoding: 'utf-8' })
    expect(result).toBe('')
  })

  it('exits 1 when a Struggles line contains boilerplate "Nothing notable"', () => {
    const injection =
      '\n- **Reviewed:** 2026-08-07\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** Nothing notable.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('[Line')
      expect(err.stderr.toString()).toContain('2026-08-07')
      expect(err.stderr.toString()).toContain('Nothing notable')
    }
  })

  it('exits 1 when Struggles line contains "None"', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-01\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** None.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('None')
    }
  })

  it('exits 1 when Struggles line contains "N/A"', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-02\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** N/A\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('N/A')
    }
  })

  it('exits 1 when Struggles line contains "No friction"', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-03\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** No friction.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('No friction')
    }
  })

  it('exits 1 when Struggles line contains "Clean card"', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-04\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** Clean card.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('Clean card')
    }
  })

  it('exits 1 when Struggles line contains "No struggles"', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-05\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** No struggles.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('No struggles')
    }
  })

  it('exits 1 when Struggles line is empty/whitespace-only', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-06\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:**   \n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
    }
  })

  it('exits 0 when Struggles line has genuine content', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-07\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** The gravity value was inconsistent between init() and the game loop.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    const output = execFileSync('node', [scriptPath], { encoding: 'utf-8' })
    expect(output).toBe('')
  })

  it('ignores Card-Level Postmortems section (example code blocks)', () => {
    // The Card-Level Postmortems section contains "Struggles: Nothing notable." in examples.
    // Since the current AGENTS.md passes, the script must only scan Last Reviewed.
    const output = execFileSync('node', [scriptPath], { encoding: 'utf-8' })
    expect(output).toBe('')
  })

  it('output format includes line number, date, and content', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-08\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** Nothing notable.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      const stderr = err.stderr.toString()
      expect(/\[Line \d+\]/.test(stderr)).toBe(true)
      expect(/Date: 2026-09-08/.test(stderr)).toBe(true)
      expect(/"Nothing notable"/.test(stderr)).toBe(true)
    }
  })

  it('case-insensitive detection ("nothing notable" in lowercase)', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-09\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** nothing notable.\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
      expect(err.stderr.toString()).toContain('nothing notable')
    }
  })

  it('case-insensitive detection ("NONE" in uppercase)', () => {
    const injection =
      '\n- **Reviewed:** 2026-09-10\n' +
      '- **Scope:** Test violation\n' +
      '- **Verified sections:** Test section.\n' +
      '- **Struggles:** NONE\n'

    const splitIdx = originalContent.indexOf('\n## Writing Conventions')
    const testContent = originalContent.slice(0, splitIdx) + injection + originalContent.slice(splitIdx)
    writeFileSync(agentsPath, testContent)

    try {
      execFileSync('node', [scriptPath], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] })
      expect(true).toBe(false)
    } catch (err) {
      expect(err.status).toBe(1)
    }
  })
})
