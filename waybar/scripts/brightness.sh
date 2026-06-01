#!/bin/bash

state=$(cat /tmp/waybar-brightness-display 2>/dev/null || echo "laptop")

make_bar() {
    local val=$1 max=$2 slots=10
    local filled=$(( val * slots / max ))
    [ "$val" -eq "$max" ] && filled=$slots
    local empty=$(( slots - filled ))
    local bar="" pad=""
    local i
    for (( i=0; i<filled; i++ )); do bar+="█"; done
    for (( i=0; i<empty; i++ )); do pad+="░"; done
    echo "[$bar$pad]"
}

case "$state" in
    monitor)
        pct=$(ddcutil getvcp 10 2>/dev/null | grep -oP 'current value =\s*\K[0-9]+')
        pct=${pct:-0}
        icon="󰍹"
        bar=$(make_bar $pct 100)
        tooltip="🖥️ External Monitor: ${pct}%\nLeft click: switch display\nScroll: adjust brightness"
        ;;
    keyboard)
        kbd=$(brightnessctl -d asus::kbd_backlight get)
        case $kbd in
            0) label="Off" ;;
            1) label="Low" ;;
            2) label="Mid" ;;
            3) label="High" ;;
        esac
        icon="󰌌"
        bar=$(make_bar $kbd 3)
        pct=$label
        tooltip="⌨️ Keyboard: ${label}\nLeft click: switch display\nScroll: adjust level\nRight click: aura modes"
        ;;
    *)
bl_dev=$(ls /sys/class/backlight/ | grep -v nvidia | head -1)
brightness=$(brightnessctl -d "$bl_dev" get)
max=$(brightnessctl -d "$bl_dev" max)
        pct=$((brightness * 100 / max))
        icon="󰛨"
        bar=$(make_bar $pct 100)
        tooltip="💻 Laptop Screen: ${pct}%\nLeft click: switch display\nScroll: adjust brightness"
        ;;
esac

if [[ "$state" == "keyboard" ]]; then
    fg="#a6e3a1"
elif [[ "$pct" -lt 20 ]] 2>/dev/null; then
    fg="#bf616a"
elif [[ "$pct" -lt 55 ]] 2>/dev/null; then
    fg="#fab387"
else
    fg="#56b6c2"
fi

echo "{\"text\":\"<span foreground='$fg'>$icon $bar $pct</span>\",\"tooltip\":\"$tooltip\"}"
