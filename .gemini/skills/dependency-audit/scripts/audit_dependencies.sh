#!/usr/bin/env bash
# Runs npm outdated --json and handles potential empty output/errors

if ! command -v npm &> /dev/null; then
    echo "{\"error\": \"npm is not installed or not in PATH\"}"
    exit 1
fi

# npm outdated exits with 1 if there are outdated packages, which is expected.
# We capture stdout and ignore the exit code.
OUTDATED_JSON=$(npm outdated --json 2>/dev/null)

if [ -z "$OUTDATED_JSON" ] || [ "$OUTDATED_JSON" == "{}" ]; then
    echo "{\"status\": \"success\", \"message\": \"All dependencies are up to date.\"}"
else
    echo "$OUTDATED_JSON"
fi
