#!/bin/bash
# ── asus-gpu-switch.sh ────────────────────────────────────
# Description: Rofi menu to switch SuperGFX GPU mode
# Dependencies: supergfxctl, rofi
# ──────────────────────────────────────────────────────────

current=$(pkexec supergfxctl --get 2>/dev/null)

menu="🔵  Integrated (battery saver)
🟠  Hybrid (balanced)
🔴  dGPU MUX (max performance)
───────────────
Current: $current"

chosen=$(echo -e "$menu" | grep -v "───" | grep -v "Current" | rofi -dmenu \
    -p "GPU Mode" \
    -theme-str 'window {width: 320px;}' \
    -theme-str 'listview {lines: 3;}' \
    -i)

[ -z "$chosen" ] && exit 0

case "$chosen" in
    *"Integrated"*)
        pkexec supergfxctl --mode Integrated
        ;;
    *"Hybrid"*)
        pkexec supergfxctl --mode Hybrid
        ;;
    *"dGPU"*)
        pkexec supergfxctl --mode AsusMuxDgpu
        ;;
esac
