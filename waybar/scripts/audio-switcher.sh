#!/bin/bash
# ── audio-switcher.sh ─────────────────────────────────────
# Description: Rofi popup to switch audio output
# Dependencies: wpctl, pactl, rofi
# ──────────────────────────────────────────────────────────

# Get all sinks with their IDs
declare -A sink_map
current_sink=$(wpctl status | awk '/Sinks:/,/Sources:/' | grep '\*' | cut -d'.' -f2- | sed 's/^\s*//; s/\[.*//' | xargs)

# Build list of sinks for rofi
sink_list=""
while IFS= read -r line; do
    # Get sink id and name
    id=$(echo "$line" | awk '{print $1}')
    name=$(echo "$line" | cut -d'.' -f2- | sed 's/^\s*//; s/\[.*//' | xargs)
    sink_map["$name"]=$id

    # Mark current sink
    if [[ "$name" == "$current_sink" ]]; then
        sink_list+="  $name\n"
    else
        sink_list+="  $name\n"
    fi
done < <(pactl list short sinks | awk '{print $1, $2}' | while read id name; do
    friendly=$(pactl list sinks | grep -A20 "Name: $name" | grep "Description:" | cut -d':' -f2- | xargs)
    echo "$id. $friendly"
done)

# Show rofi menu
chosen=$(echo -e "$sink_list" | rofi -dmenu \
    -p "Audio Output" \
    -theme-str 'window {width: 400px;}' \
    -theme-str 'listview {lines: 5;}' \
    | xargs)

[ -z "$chosen" ] && exit 0

# Get sink id from chosen name
chosen_clean=$(echo "$chosen" | sed 's/^  //; s/^  //')
chosen_id=$(pactl list short sinks | while read id name rest; do
    friendly=$(pactl list sinks | grep -A20 "Name: $name" | grep "Description:" | cut -d':' -f2- | xargs)
    if [[ "$friendly" == "$chosen_clean" ]]; then
        echo "$id"
        break
    fi
done)

# Switch to chosen sink
if [ -n "$chosen_id" ]; then
    pactl set-default-sink "$chosen_id"
    # Move all active streams to new sink
    pactl list short sink-inputs | awk '{print $1}' | while read stream; do
        pactl move-sink-input "$stream" "$chosen_id"
    done
fi
