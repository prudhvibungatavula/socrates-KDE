#!/bin/bash
# ── brightness-menu.sh ────────────────────────────────────

make_bar() {
    local val=$1
    local max=$2
    local slots=15
    local filled=$(( val * slots / max ))
    local empty=$(( slots - filled ))
    local bar=""
    local pad=""
    [ $filled -gt 0 ] && bar=$(printf '█%.0s' $(seq 1 $filled))
    [ $empty -gt 0 ]  && pad=$(printf '░%.0s' $(seq 1 $empty))
    echo "$bar$pad"
}

# Get current values
laptop=$(brightnessctl -d intel_backlight get)
laptop_max=$(brightnessctl -d intel_backlight max)
laptop_pct=$((laptop * 100 / laptop_max))

kbd=$(brightnessctl -d asus::kbd_backlight get)
case $kbd in
    0) kbd_label="Off" ;;
    1) kbd_label="Low" ;;
    2) kbd_label="Mid" ;;
    3) kbd_label="High" ;;
esac

monitor=$(ddcutil getvcp 10 2>/dev/null | grep -oP 'current value =\s*\K[0-9]+')
monitor=${monitor:-0}

# Build simple 3-item menu
menu="💻  Laptop    [$(make_bar $laptop_pct 100)]  ${laptop_pct}%
🖥️   Monitor   [$(make_bar $monitor 100)]  ${monitor}%
⌨️   Keyboard  [$(make_bar $kbd 3)]  ${kbd_label}"

chosen=$(echo -e "$menu" | rofi -dmenu \
    -p "💡 Lighting" \
    -theme-str 'window {width: 440px;}' \
    -theme-str 'listview {lines: 3;}' \
    -theme-str '* {font: "JetBrainsMono Nerd Font 11";}' \
    -i)

[ -z "$chosen" ] && exit 0

# Ask for level after selection
case "$chosen" in
    *"Laptop"*)
        level=$(echo -e "25%\n50%\n75%\n100%" | rofi -dmenu \
            -p "💻 Laptop brightness" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 4;}')
        [ -n "$level" ] && brightnessctl -d intel_backlight set "$level"
        ;;
    *"Monitor"*)
        level=$(echo -e "25\n50\n75\n100" | rofi -dmenu \
            -p "🖥️ Monitor brightness" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 4;}')
        [ -n "$level" ] && ddcutil setvcp 10 "$level"
        ;;
    *"Keyboard"*)
        level=$(echo -e "Off\nLow\nMid\nHigh" | rofi -dmenu \
            -p "⌨️ Keyboard backlight" \
            -theme-str 'window {width: 200px;}' \
            -theme-str 'listview {lines: 4;}')
        case "$level" in
            Off)  brightnessctl -d asus::kbd_backlight set 0 ;;
            Low)  brightnessctl -d asus::kbd_backlight set 1 ;;
            Mid)  brightnessctl -d asus::kbd_backlight set 2 ;;
            High) brightnessctl -d asus::kbd_backlight set 3 ;;
        esac
        ;;
esac
