#!/bin/bash
# Pegasus Engine Theme — Shared VS Code theme application helper

if [ -n "$VSC_THEME" ]; then
  VSCODE_CONFIG="$HOME/.config/Code/User/settings.json"
  if [ -f "$VSCODE_CONFIG" ]; then
    sed -i 's/"workbench.colorTheme": ".*"/"workbench.colorTheme": "'"$VSC_THEME"'"/' "$VSCODE_CONFIG" 2>/dev/null || true
  fi
fi
