#!/bin/bash
# ── battery.sh ─────────────────────────────────────────────
# Description: Shows battery % with ASCII bar + dynamic tooltip
# Usage: Waybar `custom/battery` every 10s
# Dependencies: upower, awk, seq, printf
# ──────────────────────────────────────────────────────────

# Auto-detect battery (ignores mouse battery)
bat_path=$(ls /sys/class/power_supply/ | grep -iE '^BAT' | grep -v mouse | head -1)
bat_path="/sys/class/power_supply/$bat_path"
bat_dev=$(upower -e 2>/dev/null | grep -i battery | grep -v mouse | head -1)

capacity=$(cat "$bat_path/capacity" 2>/dev/null || echo "0")
bat_status=$(cat "$bat_path/status" 2>/dev/null || echo "Unknown")

# Get detailed info from upower
time_to_empty=$(upower -i "$bat_dev" 2>/dev/null | awk -F: '/time to empty/ {print $2}' | xargs)
time_to_full=$(upower -i "$bat_dev" 2>/dev/null | awk -F: '/time to full/ {print $2}' | xargs)

# Icons
charging_icons=(󰢜 󰂆 󰂇 󰂈 󰢝 󰂉 󰢞 󰂊 󰂋 󰂅)
default_icons=(󰁺 󰁻 󰁼 󰁽 󰁾 󰁿 󰂀 󰂁 󰂂 󰁹)

index=$((capacity / 10))
[ "$index" -ge 10 ] && index=9

if [[ "$bat_status" == "Charging" ]]; then
    icon=${charging_icons[$index]}
    time_info="Time to full: ${time_to_full:-N/A}"
elif [[ "$bat_status" == "Full" ]]; then
    icon="󰂅"
    time_info="Fully charged"
else
    icon=${default_icons[$index]}
    time_info="Time to empty: ${time_to_empty:-N/A}"
fi

# ASCII bar
filled=$((capacity / 10))
[ "$capacity" -eq 100 ] && filled=10
empty=$((10 - filled))
bar=""
pad=""
for (( i=0; i<filled; i++ )); do bar+="█"; done
for (( i=0; i<empty; i++ )); do pad+="░"; done
ascii_bar="[$bar$pad]"

# Color thresholds
if [ "$capacity" -lt 20 ]; then
    fg="#bf616a"
elif [ "$capacity" -lt 55 ]; then
    fg="#fab387"
else
    fg="#56b6c2"
fi

# Tooltip
# Get discharge rate from upower
discharge_rate=$(upower -i "$bat_dev" 2>/dev/null | awk -F: '/energy-rate/ {print $2}' | xargs)
voltage=$(upower -i "$bat_dev" 2>/dev/null | awk -F: '/voltage/ {print $2}' | xargs)

tooltip="$bat_status — $capacity%\n$time_info\nDischarge rate: ${discharge_rate:-N/A}\nVoltage: ${voltage:-N/A}"

# JSON output
echo "{\"text\":\"<span foreground='$fg'>$icon $ascii_bar $capacity%</span>\",\"tooltip\":\"$tooltip\"}"
