#!/bin/bash
# Pegasus Engine Theme — Shared GNOME desktop theme application helper

if [ -n "$PEGASUS_THEME_COLOR" ]; then
  gsettings set org.gnome.desktop.interface accent-color "$PEGASUS_THEME_COLOR" 2>/dev/null || true
fi
