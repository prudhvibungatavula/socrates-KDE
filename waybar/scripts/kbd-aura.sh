#!/bin/bash
# ── kbd-aura.sh ───────────────────────────────────────────
# Description: Rofi menu for keyboard aura modes and colors
# Dependencies: asusctl, rofi
# ──────────────────────────────────────────────────────────

mode_menu="🌈  Rainbow Wave
🔄  Rainbow Cycle
💡  Static
🫧  Breathe
💥  Pulse"

chosen_mode=$(echo -e "$mode_menu" | rofi -dmenu \
    -p "⌨️ Aura Mode" \
    -theme-str 'window {width: 280px;}' \
    -theme-str 'listview {lines: 5;}' \
    -theme-str '* {font: "JetBrainsMono Nerd Font 11";}' \
    -i)

[ -z "$chosen_mode" ] && exit 0

case "$chosen_mode" in
    *"Rainbow Wave"*)
        speed=$(echo -e "low\nmed\nhigh" | rofi -dmenu \
            -p "🌈 Speed" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 3;}')
        [ -z "$speed" ] && exit 0
        dir=$(echo -e "up\ndown\nleft\nright" | rofi -dmenu \
            -p "🌈 Direction" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 4;}')
        [ -z "$dir" ] && exit 0
        asusctl aura rainbow-wave -s "$speed" -d "$dir"
        ;;

    *"Rainbow Cycle"*)
        speed=$(echo -e "low\nmed\nhigh" | rofi -dmenu \
            -p "🔄 Speed" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 3;}')
        [ -z "$speed" ] && exit 0
        asusctl aura rainbow-cycle -s "$speed"
        ;;

    *"Static"*)
        color=$(echo -e "ff0000  🔴 Red\n00ff00  🟢 Green\n0000ff  🔵 Blue\nff00ff  🟣 Pink\n00ffff  🩵 Cyan\nffffff  ⚪ White\nffff00  🟡 Yellow\nffa500  🟠 Orange\nff69b4  🩷 Hot Pink\n800080  🟣 Purple\n00ff7f  🟢 Mint\nff4500  🔴 Red Orange" | rofi -dmenu \
            -p "💡 Color" \
            -theme-str 'window {width: 280px;}' \
            -theme-str 'listview {lines: 12;}' \
            -theme-str '* {font: "JetBrainsMono Nerd Font 11";}' \
            | awk '{print $1}')
        [ -z "$color" ] && exit 0
        asusctl aura static -c "$color"
        ;;

    *"Breathe"*)
        color1=$(echo -e "ff0000  🔴 Red\n00ff00  🟢 Green\n0000ff  🔵 Blue\nff00ff  🟣 Pink\n00ffff  🩵 Cyan\nffffff  ⚪ White\nffff00  🟡 Yellow\nffa500  🟠 Orange\nff69b4  🩷 Hot Pink\n800080  🟣 Purple" | rofi -dmenu \
            -p "🫧 Color 1" \
            -theme-str 'window {width: 280px;}' \
            -theme-str 'listview {lines: 10;}' \
            | awk '{print $1}')
        [ -z "$color1" ] && exit 0
        color2=$(echo -e "ff0000  🔴 Red\n00ff00  🟢 Green\n0000ff  🔵 Blue\nff00ff  🟣 Pink\n00ffff  🩵 Cyan\nffffff  ⚪ White\nffff00  🟡 Yellow\nffa500  🟠 Orange\nff69b4  🩷 Hot Pink\n800080  🟣 Purple\nskip  ⏭️ Skip (single color)" | rofi -dmenu \
            -p "🫧 Color 2 (optional)" \
            -theme-str 'window {width: 280px;}' \
            -theme-str 'listview {lines: 11;}' \
            | awk '{print $1}')
        [ -z "$color2" ] && exit 0
        speed=$(echo -e "low\nmed\nhigh" | rofi -dmenu \
            -p "🫧 Speed" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 3;}')
        [ -z "$speed" ] && exit 0
        if [ "$color2" = "skip" ]; then
            asusctl aura breathe -c "$color1" -s "$speed"
        else
            asusctl aura breathe -c "$color1" -C "$color2" -s "$speed"
        fi
        ;;

    *"Pulse"*)
        color=$(echo -e "ff0000  🔴 Red\n00ff00  🟢 Green\n0000ff  🔵 Blue\nff00ff  🟣 Pink\n00ffff  🩵 Cyan\nffffff  ⚪ White\nffff00  🟡 Yellow\nffa500  🟠 Orange\nff69b4  🩷 Hot Pink\n800080  🟣 Purple" | rofi -dmenu \
            -p "💥 Color" \
            -theme-str 'window {width: 280px;}' \
            -theme-str 'listview {lines: 10;}' \
            | awk '{print $1}')
        [ -z "$color" ] && exit 0
        asusctl aura pulse -c "$color"
        ;;
esac
