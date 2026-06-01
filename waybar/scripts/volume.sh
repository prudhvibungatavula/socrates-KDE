#!/bin/bash
# ── volume.sh ─────────────────────────────────────────────
# Description: Shows current audio volume with ASCII bar + tooltip
# Dependencies: wpctl, awk, seq, printf
# ──────────────────────────────────────────────────────────

# Get raw volume and convert to int (no bc needed)
vol_raw=$(wpctl get-volume @DEFAULT_AUDIO_SINK@ | awk '{ print $2 }')
vol_int=$(awk "BEGIN { printf \"%d\", $vol_raw * 100 }")

# Check mute status
is_muted=$(wpctl get-volume @DEFAULT_AUDIO_SINK@ | grep -q MUTED && echo true || echo false)

# Get default sink name
sink=$(wpctl status | awk '/Sinks:/,/Sources:/' | grep '\*' | cut -d'.' -f2- | sed 's/^\s*//; s/\[.*//')

# Icon logic
if [ "$is_muted" = true ]; then
    icon="󰝟"
elif [ "$vol_int" -lt 30 ]; then
    icon="󰕿"
elif [ "$vol_int" -lt 70 ]; then
    icon="󰖀"
else
    icon="󰕾"
fi

# ASCII bar
filled=$((vol_int / 10))
empty=$((10 - filled))
bar=$(printf '█%.0s' $(seq 1 $filled))
pad=$(printf '░%.0s' $(seq 1 $empty))
ascii_bar="[$bar$pad]"

# Color logic
if [ "$is_muted" = true ] || [ "$vol_int" -lt 10 ]; then
    fg="#bf616a"
elif [ "$vol_int" -lt 50 ]; then
    fg="#fab387"
else
    fg="#56b6c2"
fi

# Tooltip
if [ "$is_muted" = true ]; then
    tooltip="Audio: Muted\nOutput: $sink"
else
    tooltip="Audio: $vol_int%\nOutput: $sink"
fi

echo "{\"text\":\"<span foreground='$fg'>$icon $ascii_bar $vol_int%</span>\",\"tooltip\":\"$tooltip\"}"
