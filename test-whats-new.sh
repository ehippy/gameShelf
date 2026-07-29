#!/usr/bin/env bash
# test-whats-new.sh — Verifies the What's New section implementation
set -euo pipefail

PASS=0
FAIL=0
TOTAL=0

check() {
    local desc="$1"
    local result="$2"
    TOTAL=$((TOTAL + 1))
    if [ "$result" -eq 0 ]; then
        echo "  ✅ PASS: $desc"
        PASS=$((PASS + 1))
    else
        echo "  ❌ FAIL: $desc"
        FAIL=$((FAIL + 1))
    fi
}

echo "=== Testing 'What's New' Section ==="
echo ""

# -----------------------------------------------------------
# 1. index.html contains What's New section with proper placement
# -----------------------------------------------------------
echo "--- Structural Checks (index.html) ---"

# 1a. Section element exists
grep -q '<section class="what-new-section">' index.html
check "index.html contains <section class=\"what-new-section\">" $?

# 1b. Section is between featured and games sections (featured < section what-new < section games)
FEATURED_LINE=$(grep -n '<section class="featured-section">' index.html | head -1 | cut -d: -f1)
WHATSNEW_LINE=$(grep -n '<section class="what-new-section">' index.html | head -1 | cut -d: -f1)
GAMES_LINE=$(grep -n '<section class="games-section">' index.html | head -1 | cut -d: -f1)

if [ -n "$FEATURED_LINE" ] && [ -n "$WHATSNEW_LINE" ] && [ -n "$GAMES_LINE" ]; then
    [ "$FEATURED_LINE" -lt "$WHATSNEW_LINE" ] && [ "$WHATSNEW_LINE" -lt "$GAMES_LINE" ]
    check "What's New section is between featured and games sections (line order: $FEATURED_LINE < $WHATSNEW_LINE < $GAMES_LINE)" $?
else
    check "What's New section is between featured and games sections" 1
fi

# 1c. h2 heading text is 'What's New'
grep -q '<h2>What'\''s New</h2>' index.html
check "Section heading is <h2>What's New</h2>" $?

# 1d. Exactly 5 entries
ENTRY_COUNT=$(grep -c 'class="what-new-item"' index.html)
[ "$ENTRY_COUNT" -eq 5 ]
check "Exactly 5 what-new-item entries (found $ENTRY_COUNT)" $?

# 1e. Each entry has a date span
DATES_COUNT=$(grep -c 'class="what-new-date"' index.html)
[ "$DATES_COUNT" -eq 5 ]
check "Each entry has a date (5 what-new-date spans)" $?

# 1f. Each entry has a tag span
TAGS_COUNT=$(grep -c 'class="what-new-tag"' index.html)
[ "$TAGS_COUNT" -eq 5 ]
check "Each entry has a tag (5 what-new-tag spans)" $?

# 1g. Each entry has a description span
DESC_COUNT=$(grep -c 'class="what-new-desc"' index.html)
[ "$DESC_COUNT" -eq 5 ]
check "Each entry has a description (5 what-new-desc spans)" $?

# 1h. New and Fix badges both present
grep -q 'class="what-new-tag new"' index.html
check "New badge class present" $?
grep -q 'class="what-new-tag fix"' index.html
check "Fix badge class present" $?

# 1i. Dates are in chronological order (newest first)
DATES=$(grep -oP 'class="what-new-date">\K[^<]+' index.html)
# Extract years
YEARS=$(echo "$DATES" | grep -oP '\b\d{4}\b')
# Check descending order
SORTED=$(echo "$YEARS" | sort -rn)
CURRENT=$(echo "$YEARS" | tr '\n' ' ')
SORTED_TR=$(echo "$SORTED" | tr '\n' ' ')
[ "$CURRENT" = "$SORTED_TR" ]
check "Dates are in chronological order (newest first)" $?

# -----------------------------------------------------------
# 2. styles.css contains CSS rules for What's New section
# -----------------------------------------------------------
echo ""
echo "--- CSS Rule Checks (styles.css) ---"

grep -q '\.what-new-section' styles.css
check "CSS rule .what-new-section exists" $?

grep -q '\.what-new-list' styles.css
check "CSS rule .what-new-list exists" $?

grep -q '\.what-new-item' styles.css
check "CSS rule .what-new-item exists" $?

grep -q '\.what-new-date' styles.css
check "CSS rule .what-new-date exists" $?

grep -q '\.what-new-tag' styles.css
check "CSS rule .what-new-tag exists" $?

grep -q '\.what-new-desc' styles.css
check "CSS rule .what-new-desc exists" $?

grep -q '\.what-new-tag\.new' styles.css
check "CSS rule .what-new-tag.new exists" $?

grep -q '\.what-new-tag\.fix' styles.css
check "CSS rule .what-new-tag.fix exists" $?

# 2a. h2 styling matches "All Games" heading (1.5rem, font-weight 600, bottom border)
# Check the what-new-section h2 has font-size: 1.5rem
grep -A5 '\.what-new-section h2' styles.css | grep -q 'font-size: 1\.5rem'
check "h2 font-size is 1.5rem" $?

grep -A5 '\.what-new-section h2' styles.css | grep -q 'font-weight: 600'
check "h2 font-weight is 600" $?

grep -A5 '\.what-new-section h2' styles.css | grep -q 'border-bottom: 2px solid'
check "h2 has bottom border" $?

# 2b. Dark theme styling
grep -A5 '\.what-new-item' styles.css | grep -q 'background: var(--bg-card)'
check "Items use dark card background (var(--bg-card))" $?

grep -A5 '\.what-new-item' styles.css | grep -q 'border: 1px solid var(--border-color)'
check "Items have subtle border" $?

grep -A5 '\.what-new-date' styles.css | grep -q 'color: var(--text-muted)'
check "Date text uses muted color" $?

grep -A5 '\.what-new-desc' styles.css | grep -q 'color: var(--text-secondary)'
check "Description text uses secondary text color" $?

# 2c. Responsive rules for 480px
grep -A5 'max-width: 480px' styles.css | grep -q '\.what-new-item'
check "Responsive rule for ≤480px includes .what-new-item" $?

grep -A8 'max-width: 480px' styles.css | grep -q 'flex-direction: column'
check "Responsive rule stacks items with flex-direction: column" $?

# 2d. Hover states
grep -A3 '\.what-new-item:hover' styles.css | grep -q 'border-color: var(--accent)'
check "Hover state changes border color to accent" $?

grep -A3 '\.what-new-item:hover' styles.css | grep -q 'background: var(--bg-card-hover)'
check "Hover state changes background to card-hover" $?

# 2e. Badge colors
grep -A2 '\.what-new-tag\.new' styles.css | grep -q '#4ade80'
check "New badge uses green color (#4ade80)" $?

grep -A2 '\.what-new-tag\.fix' styles.css | grep -q '#fb923c'
check "Fix badge uses orange color (#fb923c)" $?

# -----------------------------------------------------------
# 3. AGENTS.md contains What's New section
# -----------------------------------------------------------
echo ""
echo "--- AGENTS.md Checks ---"

grep -q "## What's New" AGENTS.md
check "AGENTS.md has '## What's New' section" $?

# Check it's after Known Issues
KNOW_ISSUES=$(grep -n "## Known Issues" AGENTS.md | head -1 | cut -d: -f1)
WHATS_NEW=$(grep -n "## What's New" AGENTS.md | head -1 | cut -d: -f1)
if [ -n "$KNOW_ISSUES" ] && [ -n "$WHATS_NEW" ]; then
    [ "$WHATS_NEW" -gt "$KNOW_ISSUES" ]
    check "What's New section is after Known Issues (line $WHATS_NEW > $KNOW_ISSUES)" $?
else
    check "What's New section is after Known Issues" 1
fi

# Check it mentions 5 entries
grep -q "5" AGENTS.md | grep -q "What" || true
grep -q "5 entries" AGENTS.md
check "Section mentions maintaining 5 entries" $?

grep -q "newest first" AGENTS.md
check "Section specifies newest-first ordering" $?

grep -q "npx prettier --write AGENTS.md" AGENTS.md
check "Section instructs to run npx prettier --write AGENTS.md" $?

# -----------------------------------------------------------
# 4. No new JS files or dependencies
# -----------------------------------------------------------
echo ""
echo "--- No New Dependencies Check ---"

# Count .js files added (we should not have added new ones for this feature)
# Check if any new JS was introduced for What's New
grep -r 'what-new' --include='*.js' . 2>/dev/null | grep -v node_modules | grep -v '.git'
if [ $? -eq 0 ]; then
    check "No new JS files reference What's New (found JS refs)" 1
else
    check "No new JS files reference What's New" $?
fi

# -----------------------------------------------------------
# 5. No merge conflicts
# -----------------------------------------------------------
echo ""
echo "--- Merge Conflict Check ---"

grep -q '<<<<<<<' index.html 2>/dev/null
if [ $? -eq 0 ]; then
    check "No merge conflict markers in index.html" 1
else
    check "No merge conflict markers in index.html" 0
fi

# Check valid HTML structure (section opened and closed properly)
OPEN_COUNT=$(grep -o '<section class="what-new-section">' index.html | wc -l)
CLOSE_COUNT=$(grep -o '</section>' index.html | wc -l)
# There should be a balanced section
grep -q '<section class="what-new-section">' index.html && grep -A30 '<section class="what-new-section">' index.html | grep -q '</section>'
check "What's New section is properly opened and closed" $?

# -----------------------------------------------------------
# Summary
# -----------------------------------------------------------
echo ""
echo "=== Results: $PASS/$TOTAL passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
    echo "❌ Some tests failed."
    exit 1
else
    echo "✅ All tests passed!"
    exit 0
fi
