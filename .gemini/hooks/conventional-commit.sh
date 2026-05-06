#!/usr/bin/env bash
set -e

# Read hook input
INPUT=$(cat)

# Extract tool name and arguments
TOOL=$(echo "$INPUT" | jq -r '.tool' 2>/dev/null || echo "unknown")

# Check for changes
if git diff --quiet && git diff --cached --quiet; then
  # Check for untracked files
  UNTRACKED=$(git ls-files --others --exclude-standard)
  if [ -z "$UNTRACKED" ]; then
    echo "{}"
    exit 0
  fi
fi

# Determine commit type and description
TYPE="chore"
DESC="update codebase"

echo "Running conventional-commit hook for tool: $TOOL" >&2

if [ "$TOOL" == "replace" ]; then
  INSTRUCTION=$(echo "$INPUT" | jq -r '.arguments.instruction' 2>/dev/null)
  if [ -n "$INSTRUCTION" ] && [ "$INSTRUCTION" != "null" ]; then
    # Use instruction as description
    DESC=$(echo "$INSTRUCTION" | head -n 1 | sed 's/[^a-zA-Z0-9 ]/ /g' | xargs | tr '[:upper:]' '[:lower:]')
    
    # Simple heuristic for type
    if [[ "$DESC" =~ (fix|bug|issue|correct) ]]; then
      TYPE="fix"
    elif [[ "$DESC" =~ (add|create|new|implement|feat) ]]; then
      TYPE="feat"
    elif [[ "$DESC" =~ (refactor|clean|move) ]]; then
      TYPE="refactor"
    elif [[ "$DESC" =~ (test|spec) ]]; then
      TYPE="test"
    elif [[ "$DESC" =~ (docs|comment|readme) ]]; then
      TYPE="docs"
    elif [[ "$DESC" =~ (style|format|lint) ]]; then
      TYPE="style"
    fi
  fi
elif [ "$TOOL" == "write_file" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.arguments.file_path' 2>/dev/null)
  if [ -n "$FILE_PATH" ] && [ "$FILE_PATH" != "null" ]; then
    DESC="update $FILE_PATH"
    if [[ "$FILE_PATH" == *"test"* ]]; then
      TYPE="test"
    elif [[ "$FILE_PATH" == *".md" ]]; then
      TYPE="docs"
    fi
  fi
fi

# Ensure description is not too long
if [ ${#DESC} -gt 72 ]; then
  DESC="${DESC:0:69}..."
fi

MSG="$TYPE: $DESC"

# Add changes and commit
git add .
git commit -m "$MSG" --no-verify > /dev/null 2>&2

# Return success message
echo "{\"systemMessage\": \"✅ Auto-committed: $MSG\"}"
