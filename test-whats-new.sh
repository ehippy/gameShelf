#!/usr/bin/env bash
# test-whats-new.sh — Verifies the What's New section implementation
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
if grep -q 'what-new-section' index.html; then
    check "index.html contains <section class=\"what-new-section\">" 0
else
    check "index.html contains <section class=\"what-new-section\">" 1
fi

# 1b. Section is between featured and games sections
FEATURED_LINE=$(grep -n '<section class="featured-section">' index.html | head -1 | cut -d: -f1)
WHATSNEW_LINE=$(grep -n '<section class="what-new-section">' index.html | head -1 | cut -d: -f1)
GAMES_LINE=$(grep -n '<section class="games-section">' index.html | head -1 | cut -d: -f1)

if [ -n "$FEATURED_LINE" ] && [ -n "$WHATSNEW_LINE" ] && [ -n "$GAMES_LINE" ]; then
    if [ "$FEATURED_LINE" -lt "$WHATSNEW_LINE" ] && [ "$WHATSNEW_LINE" -lt "$GAMES_LINE" ]; then
        check "What's New section is between featured and games sections (lines: $FEATURED_LINE < $WHATSNEW_LINE < $GAMES_LINE)" 0
    else
        check "What's New section is between featured and games sections" 1
    fi
else
    check "What's New section is between featured and games sections" 1
fi

# 1c. h2 heading text is 'What's New'
if grep -q 'What'\''s New' index.html; then
    check "Section heading is <h2>What's New</h2>" 0
else
    check "Section heading is <h2>What's New</h2>" 1
fi

# 1d. Exactly 5 entries (what-new-item)
ENTRY_COUNT=$(grep -c 'what-new-item' index.html)
if [ "$ENTRY_COUNT" -eq 5 ]; then
    check "Exactly 5 what-new-item entries (found $ENTRY_COUNT)" 0
else
    check "Exactly 5 what-new-item entries (found $ENTRY_COUNT)" 1
fi

# 1e. Each entry has a date span
DATES_COUNT=$(grep -c 'what-new-date' index.html)
if [ "$DATES_COUNT" -eq 5 ]; then
    check "Each entry has a date (5 what-new-date spans)" 0
else
    check "Each entry has a date (5 what-new-date spans)" 1
fi

# 1f. Each entry has a tag span
TAGS_COUNT=$(grep -c 'what-new-tag' index.html)
if [ "$TAGS_COUNT" -eq 5 ]; then
    check "Each entry has a tag (5 what-new-tag spans)" 0
else
    check "Each entry has a tag (5 what-new-tag spans)" 1
fi

# 1g. Each entry has a description span
DESC_COUNT=$(grep -c 'what-new-desc' index.html)
if [ "$DESC_COUNT" -eq 5 ]; then
    check "Each entry has a description (5 what-new-desc spans)" 0
else
    check "Each entry has a description (5 what-new-desc spans)" 1
fi

# 1h. New and Fix badges both present
if grep -q 'what-new-tag new' index.html; then
    check "New badge class present" 0
else
    check "New badge class present" 1
fi

if grep -q 'what-new-tag fix' index.html; then
    check "Fix badge class present" 0
else
    check "Fix badge class present" 1
fi

# 1i. Dates are in chronological order (newest first)
DATES=$(grep -oP 'what-new-date">([^<]+)' index.html | sed 's/.*">//' || echo "")
YEARS=$(echo "$DATES" | grep -oP '\d{4}' || echo "")
SORTED=$(echo "$YEARS" | sort -rn)
CURRENT=$(echo "$YEARS" | tr '\n' ' ')
SORTED_TR=$(echo "$SORTED" | tr '\n' ' ')
if [ "$CURRENT" = "$SORTED_TR" ] && [ -n "$CURRENT" ]; then
    check "Dates are in chronological order (newest first)" 0
else
    check "Dates are in chronological order (newest first)" 1
fi

# -----------------------------------------------------------
# 2. styles.css contains CSS rules for What's New section
# -----------------------------------------------------------
echo ""
echo "--- CSS Rule Checks (styles.css) ---"

if grep -q '\.what-new-section' styles.css; then
    check "CSS rule .what-new-section exists" 0
else
    check "CSS rule .what-new-section exists" 1
fi

if grep -q '\.what-new-list' styles.css; then
    check "CSS rule .what-new-list exists" 0
else
    check "CSS rule .what-new-list exists" 1
fi

if grep -q '\.what-new-item' styles.css; then
    check "CSS rule .what-new-item exists" 0
else
    check "CSS rule .what-new-item exists" 1
fi

if grep -q '\.what-new-date' styles.css; then
    check "CSS rule .what-new-date exists" 0
else
    check "CSS rule .what-new-date exists" 1
fi

if grep -q '\.what-new-tag' styles.css; then
    check "CSS rule .what-new-tag exists" 0
else
    check "CSS rule .what-new-tag exists" 1
fi

if grep -q '\.what-new-desc' styles.css; then
    check "CSS rule .what-new-desc exists" 0
else
    check "CSS rule .what-new-desc exists" 1
fi

if grep -q '\.what-new-tag\.new' styles.css; then
    check "CSS rule .what-new-tag.new exists" 0
else
    check "CSS rule .what-new-tag.new exists" 1
fi

if grep -q '\.what-new-tag\.fix' styles.css; then
    check "CSS rule .what-new-tag.fix exists" 0
else
    check "CSS rule .what-new-tag.fix exists" 1
fi

# 2a. h2 styling matches "All Games" heading (1.5rem, font-weight 600, bottom border)
WHATNEW_H2=$(sed -n '/\.what-new-section h2/,/^}/p' styles.css)
if echo "$WHATNEW_H2" | grep -q 'font-size: 1.5rem'; then
    check "h2 font-size is 1.5rem" 0
else
    check "h2 font-size is 1.5rem" 1
fi

if echo "$WHATNEW_H2" | grep -q 'font-weight: 600'; then
    check "h2 font-weight is 600" 0
else
    check "h2 font-weight is 600" 1
fi

if echo "$WHATNEW_H2" | grep -q 'border-bottom: 2px solid'; then
    check "h2 has bottom border" 0
else
    check "h2 has bottom border" 1
fi

# 2b. Dark theme styling
WHATNEW_ITEM=$(sed -n '/\.what-new-item {/,/^}/p' styles.css)
if echo "$WHATNEW_ITEM" | grep -q 'background: var(--bg-card)'; then
    check "Items use dark card background (var(--bg-card))" 0
else
    check "Items use dark card background (var(--bg-card))" 1
fi

if echo "$WHATNEW_ITEM" | grep -q 'border: 1px solid var(--border-color)'; then
    check "Items have subtle border" 0
else
    check "Items have subtle border" 1
fi

WHATNEW_DATE=$(sed -n '/\.what-new-date {/,/^}/p' styles.css)
if echo "$WHATNEW_DATE" | grep -q 'color: var(--text-muted)'; then
    check "Date text uses muted color" 0
else
    check "Date text uses muted color" 1
fi

WHATNEW_DESC=$(sed -n '/\.what-new-desc {/,/^}/p' styles.css)
if echo "$WHATNEW_DESC" | grep -q 'color: var(--text-secondary)'; then
    check "Description text uses secondary text color" 0
else
    check "Description text uses secondary text color" 1
fi

# 2c. Responsive rules for 480px
RESP_480=$(sed -n '/@media (max-width: 480px)/,/^}/p' styles.css)
if echo "$RESP_480" | grep -q '\.what-new-item'; then
    check "Responsive rule for ≤480px includes .what-new-item" 0
else
    check "Responsive rule for ≤480px includes .what-new-item" 1
fi

if echo "$RESP_480" | grep -q 'flex-direction: column'; then
    check "Responsive rule stacks items with flex-direction: column" 0
else
    check "Responsive rule stacks items with flex-direction: column" 1
fi

# 2d. Hover states
WHATNEW_HOVER=$(sed -n '/\.what-new-item:hover/,/^}/p' styles.css)
if echo "$WHATNEW_HOVER" | grep -q 'border-color: var(--accent)'; then
    check "Hover state changes border color to accent" 0
else
    check "Hover state changes border color to accent" 1
fi

if echo "$WHATNEW_HOVER" | grep -q 'background: var(--bg-card-hover)'; then
    check "Hover state changes background to card-hover" 0
else
    check "Hover state changes background to card-hover" 1
fi

# 2e. Badge colors
NEW_TAG=$(sed -n '/\.what-new-tag\.new {/,/^}/p' styles.css)
if echo "$NEW_TAG" | grep -q '#4ade80'; then
    check "New badge uses green color (#4ade80)" 0
else
    check "New badge uses green color (#4ade80)" 1
fi

FIX_TAG=$(sed -n '/\.what-new-tag\.fix {/,/^}/p' styles.css)
if echo "$FIX_TAG" | grep -q '#fb923c'; then
    check "Fix badge uses orange color (#fb923c)" 0
else
    check "Fix badge uses orange color (#fb923c)" 1
fi

# -----------------------------------------------------------
# 3. AGENTS.md contains What's New section
# -----------------------------------------------------------
echo ""
echo "--- AGENTS.md Checks ---"

if grep -q "## What's New" AGENTS.md; then
    check "AGENTS.md has '## What's New' section" 0
else
    check "AGENTS.md has '## What's New' section" 1
fi

# Check it's after Known Issues
KNOW_ISSUES=$(grep -n "## Known Issues" AGENTS.md | head -1 | cut -d: -f1)
WHATS_NEW=$(grep -n "## What's New" AGENTS.md | head -1 | cut -d: -f1)
if [ -n "$KNOW_ISSUES" ] && [ -n "$WHATS_NEW" ]; then
    if [ "$WHATS_NEW" -gt "$KNOW_ISSUES" ]; then
        check "What's New section is after Known Issues (line $WHATS_NEW > $KNOW_ISSUES)" 0
    else
        check "What's New section is after Known Issues" 1
    fi
else
    check "What's New section is after Known Issues" 1
fi

if grep -q "5 entries" AGENTS.md; then
    check "Section mentions maintaining 5 entries" 0
else
    check "Section mentions maintaining 5 entries" 1
fi

if grep -q "newest first" AGENTS.md; then
    check "Section specifies newest-first ordering" 0
else
    check "Section specifies newest-first ordering" 1
fi

if grep -q "npx prettier --write AGENTS.md" AGENTS.md; then
    check "Section instructs to run npx prettier --write AGENTS.md" 0
else
    check "Section instructs to run npx prettier --write AGENTS.md" 1
fi

# -----------------------------------------------------------
# 4. No new JS files or dependencies
# -----------------------------------------------------------
echo ""
echo "--- No New Dependencies Check ---"

JS_REFS=$(grep -r 'what-new' --include='*.js' . 2>/dev/null | grep -v node_modules | grep -v '.git' | wc -l)
if [ "$JS_REFS" -eq 0 ]; then
    check "No new JS files reference What's New" 0
else
    check "No new JS files reference What's New" 1
fi

# -----------------------------------------------------------
# 5. No merge conflicts
# -----------------------------------------------------------
echo ""
echo "--- Merge Conflict Check ---"

if grep -q '<<<<<<<' index.html 2>/dev/null; then
    check "No merge conflict markers in index.html" 1
else
    check "No merge conflict markers in index.html" 0
fi

# Check valid HTML structure (section opened and closed properly)
SECTION_CONTENT=$(sed -n '/<section class="what-new-section">/,/<\/section>/p' index.html)
if echo "$SECTION_CONTENT" | grep -q '<section class="what-new-section">' && echo "$SECTION_CONTENT" | grep -q '</section>'; then
    check "What's New section is properly opened and closed" 0
else
    check "What's New section is properly opened and closed" 1
fi

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
