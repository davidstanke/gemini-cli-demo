#!/usr/bin/env bash
set -e

# Read hook input
INPUT=$(cat)

# Extract tool name
TOOL=$(echo "$INPUT" | jq -r '.tool_name' 2>/dev/null || echo "unknown")

# Add changes to staging
git add .

# Check for changes
if git diff --cached --quiet; then
  echo "{}"
  exit 0
fi

# Determine commit type and description
TYPE="chore"
DESC="update codebase"

# Try to find a good description from tool arguments
if [ "$TOOL" == "replace" ]; then
  DESC=$(echo "$INPUT" | jq -r '.tool_input.instruction' 2>/dev/null)
elif [ "$TOOL" == "run_shell_command" ]; then
  DESC=$(echo "$INPUT" | jq -r '.tool_input.description' 2>/dev/null)
  if [ "$DESC" == "null" ] || [ -z "$DESC" ]; then
    DESC=$(echo "$INPUT" | jq -r '.tool_input.command' 2>/dev/null)
  fi
elif [ "$TOOL" == "write_file" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path' 2>/dev/null)
  if [ -n "$FILE_PATH" ] && [ "$FILE_PATH" != "null" ]; then
    if git rev-parse --verify "HEAD:$FILE_PATH" >/dev/null 2>&1; then
      DESC="update $FILE_PATH"
    else
      TYPE="feat"
      DESC="create $FILE_PATH"
    fi
  fi
fi

# Clean up DESC (take first line, remove most special chars, lowercase)
if [ "$DESC" != "null" ] && [ -n "$DESC" ]; then
    # Keep some useful characters like . - _ /
    DESC=$(echo "$DESC" | head -n 1 | sed 's/[^a-zA-Z0-9 .\/_-]/ /g' | xargs | tr '[:upper:]' '[:lower:]')
fi

# Fallback if DESC is still generic or empty
if [ "$DESC" == "update codebase" ] || [ "$DESC" == "null" ] || [ -z "$DESC" ]; then
  CHANGED_FILES=$(git diff --cached --name-only)
  FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l)
  if [ "$FILE_COUNT" -eq 1 ]; then
    DESC="update $CHANGED_FILES"
  else
    DESC="update $FILE_COUNT files"
  fi
fi

# Smarter type detection based on DESC
if [[ "$DESC" =~ (fix|bug|issue|correct|error|patch) ]]; then
  TYPE="fix"
elif [[ "$DESC" =~ (add|create|new|implement|feat|introduce) ]]; then
  TYPE="feat"
elif [[ "$DESC" =~ (refactor|clean|move|organize|restructure) ]]; then
  TYPE="refactor"
elif [[ "$DESC" =~ (test|spec|assert|vitest|jest) ]]; then
  TYPE="test"
elif [[ "$DESC" =~ (docs|comment|readme|manual) ]]; then
  TYPE="docs"
elif [[ "$DESC" =~ (style|format|lint|prettier) ]]; then
  TYPE="style"
elif [[ "$DESC" =~ (perf|optimize|speed|efficient) ]]; then
  TYPE="perf"
elif [[ "$DESC" =~ (build|ci|cd|workflow|npm|package|dependency|install|setup) ]]; then
  TYPE="build"
fi

# Ensure description is not too long
if [ ${#DESC} -gt 72 ]; then
  DESC="${DESC:0:69}..."
fi

MSG="$TYPE: $DESC"

# Commit
git commit -m "$MSG" --no-verify > /dev/null 2>&1

# Return success message
echo "{\"systemMessage\": \"✅ Auto-committed: $MSG\"}"
