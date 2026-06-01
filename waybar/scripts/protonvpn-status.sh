#!/bin/bash

STATUS=$(protonvpn status 2>/dev/null)

if echo "$STATUS" | grep -q "Connected"; then
    server=$(echo "$STATUS" | grep -i "^Server:" | cut -d':' -f2- | xargs)
    city=$(echo "$server" | grep -oP 'in \K.*' | cut -d',' -f1)
    country=$(echo "$server" | grep -oP ',\s*\K.*')
    load=$(echo "$STATUS" | grep -i "^Load:" | cut -d':' -f2- | xargs)
    protocol=$(echo "$STATUS" | grep -i "^Protocol:" | cut -d':' -f2- | xargs)
    server_id=$(echo "$server" | cut -d' ' -f1)

    text="<span foreground='#fab387'>󰦝 $city, $country</span>"
    tooltip="Server: $server_id\nLoad: $load\nProtocol: $protocol"
    echo "{\"text\":\"$text\",\"tooltip\":\"$tooltip\",\"class\":\"connected\"}"
else
    text="<span foreground='#bf616a'>󰦝 Off</span>"
    tooltip="VPN Disconnected"
    echo "{\"text\":\"$text\",\"tooltip\":\"$tooltip\",\"class\":\"disconnected\"}"
fi
