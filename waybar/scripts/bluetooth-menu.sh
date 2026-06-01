#!/bin/bash
# ── bluetooth-menu.sh ─────────────────────────────────────
# Description: Rofi bluetooth device picker
# Dependencies: bluetoothctl, rofi
# ──────────────────────────────────────────────────────────

device_icon() {
    local name=$1
    local name_lower=$(echo "$name" | tr '[:upper:]' '[:lower:]')
    if echo "$name_lower" | grep -qE "headphone|earphone|eah|wh|buds|airpod"; then
        echo "󰋋"
    elif echo "$name_lower" | grep -qE "mouse|mx|trackpad"; then
        echo "󰍽"
    elif echo "$name_lower" | grep -qE "keyboard|keychron|k[0-9]|mechan"; then
        echo "󰌌"
    elif echo "$name_lower" | grep -qE "phone|iphone|android|pixel|galaxy"; then
        echo "󰄜"
    elif echo "$name_lower" | grep -qE "speaker|bar|soundbar|jbl|bose|sonos"; then
        echo "󰓃"
    elif echo "$name_lower" | grep -qE "watch|band|fitness"; then
        echo "󰋒"
    elif echo "$name_lower" | grep -qE "gamepad|controller|dualsense|xbox"; then
        echo "󰊗"
    else
        echo "󰂯"
    fi
}

# Get connected devices
connected=$(bluetoothctl devices Connected 2>/dev/null | awk '{print $2}')

menu=""
while IFS= read -r line; do
    mac=$(echo "$line" | awk '{print $2}')
    name=$(echo "$line" | cut -d' ' -f3-)

    icon=$(device_icon "$name")

    # Check if connected
    if echo "$connected" | grep -q "$mac"; then
        status="✅"
    else
        status="  "
    fi

    menu+="$status $icon  $name|$mac\n"
done < <(bluetoothctl devices 2>/dev/null | sort -u -k3)

# Add toggle BT + scan options at top
bt_status=$(bluetoothctl show | grep -i "powered" | awk '{print $2}')
if [ "$bt_status" = "yes" ]; then
    header="🔵  Bluetooth On — turn off\n───\n"
else
    header="⚫  Bluetooth Off — turn on\n───\n"
fi

chosen=$(echo -e "${header}${menu}" | grep -v "───" | rofi -dmenu \
    -p "Bluetooth" \
    -theme-str 'window {width: 350px;}' \
    -theme-str 'listview {lines: 8;}' \
    -theme-str '* {font: "JetBrainsMono Nerd Font 12";}' \
    -i)

[ -z "$chosen" ] && exit 0

# Handle toggle
if echo "$chosen" | grep -q "Bluetooth"; then
    if [ "$bt_status" = "yes" ]; then
        bluetoothctl power off
    else
        bluetoothctl power on
    fi
    exit 0
fi

# Extract MAC
mac=$(echo "$chosen" | grep -oP '([0-9A-F]{2}:){5}[0-9A-F]{2}')
name=$(echo "$chosen" | sed 's/.*  //' | cut -d'|' -f1 | xargs)

[ -z "$mac" ] && exit 0

# Connect or disconnect
if echo "$connected" | grep -q "$mac"; then
    action=$(echo -e "Disconnect\nCancel" | rofi -dmenu \
        -p "$name" \
        -theme-str 'window {width: 250px;}' \
        -theme-str 'listview {lines: 2;}')
    [ "$action" = "Disconnect" ] && bluetoothctl disconnect "$mac"
else
    bluetoothctl connect "$mac"
fi
