#!/usr/bin/env bash
# PostToolUse hook: format (and lint-fix .js) the file Claude just edited.
# Never blocks: formatting/lint problems are reported back, not enforced.

file=$(jq -r '.tool_input.file_path // empty')
[ -z "$file" ] || [ ! -f "$file" ] && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0

case "$file" in
  "$CLAUDE_PROJECT_DIR"/*) ;;   # only files inside this package
  *) exit 0 ;;
esac
case "$file" in
  */node_modules/*|*/dist/*|*/.wireit/*|*/coverage/*) exit 0 ;;
esac

case "$file" in
  *.js|*.mjs|*.ts|*.css|*.json|*.md)
    node_modules/.bin/prettier --write --log-level warn "$file" >&2 ;;
esac

case "$file" in
  *.js|*.mjs)
    if ! out=$(node_modules/.bin/eslint --fix "$file" 2>&1); then
      echo "$out" >&2
      exit 2   # show remaining lint errors to Claude so it fixes them
    fi ;;
esac

exit 0
