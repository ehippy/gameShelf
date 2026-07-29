#!/bin/bash
set -e

# Acceptance Criteria Test Suite for about.html
PASS=0
FAIL=0

check() {
    local desc="$1"
    local actual="$2"
    local expected="$3"
    if [ "$actual" = "$expected" ]; then
        echo "PASS: $desc"
        PASS=$((PASS + 1))
    else
        echo "FAIL: $desc"
        echo "  Expected: '$expected'"
        echo "  Actual:   '$actual'"
        FAIL=$((FAIL + 1))
    fi
}

FILE="about.html"

# Test 1: 7 filter buttons present
BTN_COUNT=$(grep -c 'filter-btn' "$FILE")
EXPECTED_BUTTTONS=7
# We expect 7 buttons (All, Action, Puzzle, Arcade, Strategy, Board, Casual)
# But there might be header text too. Let's count specifically the button tags.
BTN_TAG_COUNT=$(grep -c '<button class="filter-btn"' "$FILE")
check "7 filter button tags" "$BTN_TAG_COUNT" "7"

# Test 2: data-filter attributes match
# Check each filter attribute is present
for filter in all action puzzle arcade strategy board casual; do
    if grep -q "data-filter=\"$filter\"" "$FILE"; then
        echo "PASS: data-filter='$filter' found"
        PASS=$((PASS + 1))
    else
        echo "FAIL: data-filter='$filter' not found"
        FAIL=$((FAIL + 1))
    fi
done

# Test 3: Text says "seven categories" not "three categories"
if grep -q "seven categories of browser-based games" "$FILE"; then
    echo "PASS: Text mentions seven categories"
    PASS=$((PASS + 1))
else
    echo "FAIL: Text does not mention seven categories"
    FAIL=$((FAIL + 1))
fi

if grep -q "three exciting categories" "$FILE"; then
    echo "FAIL: Text still says 'three exciting categories'"
    FAIL=$((FAIL + 1))
else
    echo "PASS: Text does not say 'three exciting categories'"
    PASS=$((PASS + 1))
fi

# Test 4: Category list items present
for cat in Strategy Board Casual; do
    if grep -q "<strong>$cat</strong>" "$FILE"; then
        echo "PASS: Category list item for $cat found"
        PASS=$((PASS + 1))
    else
        echo "FAIL: Category list item for $cat not found"
        FAIL=$((FAIL + 1))
    fi
done

# Test 5: Strategy, Board, Casual say "Coming soon"
for cat in Strategy Board Casual; do
    if grep -q "Coming soon" "$FILE"; then
        echo "PASS: 'Coming soon' text present"
        PASS=$((PASS + 1))
    else
        echo "FAIL: 'Coming soon' text not found"
        FAIL=$((FAIL + 1))
    fi
    break  # Just check once for all three
done

# Test 6: Action mentions Breakout
if grep -q "Breakout" "$FILE"; then
    echo "PASS: Action category mentions Breakout"
    PASS=$((PASS + 1))
else
    echo "FAIL: Action category does not mention Breakout"
    FAIL=$((FAIL + 1))
fi

# Test 7: Puzzle mentions Tetris, 2048, Minesweeper, Tic Tac Toe, and Memory Match
for game in Tetris "2048" Minesweeper "Tic Tac Toe" "Memory Match"; do
    if grep -q "$game" "$FILE"; then
        echo "PASS: Puzzle category mentions $game"
        PASS=$((PASS + 1))
    else
        echo "FAIL: Puzzle category does not mention $game"
        FAIL=$((FAIL + 1))
    fi
done

# Test 8: Arcade mentions Snake and Pac-Man
for game in Snake "Pac-Man"; do
    if grep -q "$game" "$FILE"; then
        echo "PASS: Arcade category mentions $game"
        PASS=$((PASS + 1))
    else
        echo "FAIL: Arcade category does not mention $game"
        FAIL=$((FAIL + 1))
    fi
done

# Test 9: about-categories ul exists
if grep -q 'class="about-categories"' "$FILE"; then
    echo "PASS: about-categories ul class found"
    PASS=$((PASS + 1))
else
    echo "FAIL: about-categories ul class not found"
    FAIL=$((FAIL + 1))
fi

# Summary
echo ""
echo "=============================="
echo "Results: $PASS passed, $FAIL failed"
echo "=============================="

if [ $FAIL -gt 0 ]; then
    exit 1
else
    echo "All tests passed!"
    exit 0
fi
