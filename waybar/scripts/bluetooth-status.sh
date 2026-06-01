#!/bin/bash

device_icon() {
    local name=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    if echo "$name" | grep -qE "headphone|earphone|eah|wh|buds|airpod"; then echo "󰋋"
    elif echo "$name" | grep -qE "mouse|mx|trackpad"; then echo "󰍽"
    elif echo "$name" | grep -qE "keyboard|keychron|k[0-9]"; then echo "󰌌"
    elif echo "$name" | grep -qE "phone|iphone|android"; then echo "󰄜"
    elif echo "$name" | grep -qE "speaker|bar|soundbar|jbl|bose"; then echo "󰓃"
    else echo "󰂯"
    fi
}

battery_icon() {
    local pct=$1
    if [ "$pct" -ge 90 ]; then echo "󰁹"
    elif [ "$pct" -ge 70 ]; then echo "󰂁"
    elif [ "$pct" -ge 50 ]; then echo "󰁾"
    elif [ "$pct" -ge 30 ]; then echo "󰁼"
    elif [ "$pct" -ge 10 ]; then echo "󰁺"
    else echo "󰂎"
    fi
}

battery_color() {
    local pct=$1
    if [ "$pct" -ge 50 ]; then echo "#a6e3a1"
    elif [ "$pct" -ge 20 ]; then echo "#fab387"
    else echo "#bf616a"
    fi
}

short_name() {
    echo "$1" | awk '{print $1}' | cut -c1-8
}

BT_POWERED=$(bluetoothctl show | grep -i "powered: yes" | wc -l)

if [ "$BT_POWERED" -eq 0 ]; then
    echo '{"text":"[ 󰂲 Off ]","tooltip":"Bluetooth off","class":"disabled"}'
    exit 0
fi

CONNECTED=$(bluetoothctl devices Connected 2>/dev/null)
PAIRED=$(bluetoothctl devices Paired 2>/dev/null)

if [ -z "$CONNECTED" ]; then
    icon="[  Off ]"
    class="enabled"
else
    first_mac=$(echo "$CONNECTED" | head -1 | awk '{print $2}')
    first_name=$(echo "$CONNECTED" | head -1 | cut -d' ' -f3-)
    dev_icon=$(device_icon "$first_name")
    sname=$(short_name "$first_name")
    battery=$(bluetoothctl info "$first_mac" 2>/dev/null | grep -i "Battery Percentage" | grep -oP '\(\K[0-9]+')

    if [ -n "$battery" ]; then
        bat_icon=$(battery_icon "$battery")
        bat_color=$(battery_color "$battery")
        icon="[ $dev_icon $sname - <span foreground='$bat_color'>${battery}% $bat_icon</span> ]"
    else
        icon="[ $dev_icon $sname ]"
    fi
    class="connected"
fi

tooltip="Bluetooth on\n\nConnected:\n"
if [ -z "$CONNECTED" ]; then
    tooltip+="  none\n"
else
    while IFS= read -r line; do
        mac=$(echo "$line" | awk '{print $2}')
        name=$(echo "$line" | cut -d' ' -f3-)
        bat=$(bluetoothctl info "$mac" 2>/dev/null | grep -i "Battery Percentage" | grep -oP '\(\K[0-9]+')
        d_icon=$(device_icon "$name")
        if [ -n "$bat" ]; then
            bat_icon=$(battery_icon "$bat")
            bat_color=$(battery_color "$bat")
            tooltip+="  $d_icon $name — <span foreground='$bat_color'>${bat}% $bat_icon</span>\n"
        else
            tooltip+="  $d_icon $name\n"
        fi
    done <<< "$CONNECTED"
fi

tooltip+="\nPaired:\n"
if [ -z "$PAIRED" ]; then
    tooltip+="  none"
else
    while IFS= read -r line; do
        name=$(echo "$line" | cut -d' ' -f3-)
        tooltip+="  󰂯 $name\n"
    done <<< "$PAIRED"
fi

echo "{\"text\":\"$icon\",\"tooltip\":\"$tooltip\",\"class\":\"$class\"}"
