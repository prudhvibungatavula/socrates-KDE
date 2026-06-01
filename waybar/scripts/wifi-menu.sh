#!/bin/bash
# ── wifi-menu.sh ──────────────────────────────────────────

signal_icon() {
    local signal=$1
    if [ "$signal" -ge 80 ]; then echo "󰤨"
    elif [ "$signal" -ge 60 ]; then echo "󰤥"
    elif [ "$signal" -ge 40 ]; then echo "󰤢"
    elif [ "$signal" -ge 20 ]; then echo "󰤟"
    else echo "󰤯"
    fi
}


menu=""
seen=()

while IFS= read -r line; do
    in_use=$(echo "$line" | cut -c1)
    # SSID is from col 9 to col 27 (fixed width)
    ssid=$(echo "$line" | cut -c9-27 | xargs)
    signal=$(echo "$line" | awk '{print $(NF-1)}')
    security=$(echo "$line" | awk '{print $NF}')

    [ -z "$ssid" ] || [ "$ssid" = "--" ] && continue

    # Deduplicate
    [[ " ${seen[@]} " =~ " $ssid " ]] && continue
    seen+=("$ssid")

    icon=$(signal_icon "$signal")
    [ "$security" = "--" ] && lock="🔓" || lock="🔒"
    [ "$in_use" = "*" ] && marker="✅" || marker="  "

    menu+="$marker $icon $lock  $ssid  ${signal}%\n"
done < <(nmcli -f IN-USE,SSID,SIGNAL,SECURITY device wifi list 2>/dev/null | tail -n +2)

chosen=$(echo -e "$menu" | rofi -dmenu \
    -p "WiFi" \
    -theme-str 'window {width: 350px;}' \
    -theme-str 'listview {lines: 10;}' \
    -theme-str '* {font: "JetBrainsMono Nerd Font 12";}' \
    -i)

[ -z "$chosen" ] && exit 0

ssid=$(echo "$chosen" | sed 's/^[✅ ]*[󰤨󰤥󰤢󰤟󰤯] [🔒🔓]  //')

current=$(nmcli -t -f active,ssid dev wifi | grep '^yes' | cut -d':' -f2)
if [ "$current" = "$ssid" ]; then
    action=$(echo -e "Disconnect\nCancel" | rofi -dmenu \
        -p "Connected to $ssid" \
        -theme-str 'window {width: 250px;}' \
        -theme-str 'listview {lines: 2;}')
    [ "$action" = "Disconnect" ] && nmcli device disconnect wlan0
    exit 0
fi

saved=$(nmcli connection show | grep -c "$ssid")
if [ "$saved" -gt 0 ]; then
    nmcli device wifi connect "$ssid"
else
    password=$(rofi -dmenu \
    -p "🔑 Password for $ssid" \
    -theme-str 'window {width: 800px;}' \
    -theme-str 'listview {lines: 0;}' \
    -theme-str 'inputbar {children: [prompt, entry];}' \
    -password \
    < /dev/null)
    [ -z "$password" ] && exit 0
    nmcli device wifi connect "$ssid" password "$password"
fi
