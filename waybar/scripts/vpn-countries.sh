#!/bin/bash
# ── vpn-countries.sh ──────────────────────────────────────
# Description: Rofi menu with full ProtonVPN country list
# Dependencies: protonvpn, rofi
# ──────────────────────────────────────────────────────────

# Force kill GUI
pkill -9 protonvpn-app 2>/dev/null
sleep 0.5

# Get full country list from protonvpn
raw=$(protonvpn c --help 2>/dev/null)

# Fetch countries dynamically
countries=$(protonvpn connect --country --help 2>/dev/null)

# Build menu with special options at top
menu="⚡  Fastest (auto)\n🔒  Secure Core\n🌐  P2P\n🧅  Tor\n❌  Disconnect\n───────────────"

# Get country list from protonvpn servers
while IFS= read -r line; do
    menu+="\n$line"
done < <(protonvpn server-list 2>/dev/null | grep -i "country" | sort -u || \
         curl -s "https://api.protonvpn.ch/vpn/logicals" 2>/dev/null | \
         python3 -c "
import sys, json
data = json.load(sys.stdin)
countries = sorted(set(s['ExitCountry'] for s in data['LogicalServers']))
for c in countries:
    print(c)
" 2>/dev/null)

# If dynamic fetch failed, use extended static list
if [ "$(echo -e "$menu" | wc -l)" -lt 10 ]; then
menu="⚡  Fastest (auto)
🔒  Secure Core
🌐  P2P
🧅  Tor
❌  Disconnect
───────────────
🇦🇱  Albania|AL
🇦🇷  Argentina|AR
🇦🇺  Australia|AU
🇦🇹  Austria|AT
🇧🇪  Belgium|BE
🇧🇷  Brazil|BR
🇧🇬  Bulgaria|BG
🇨🇦  Canada|CA
🇨🇱  Chile|CL
🇨🇴  Colombia|CO
🇭🇷  Croatia|HR
🇨🇾  Cyprus|CY
🇨🇿  Czech Republic|CZ
🇩🇰  Denmark|DK
🇪🇬  Egypt|EG
🇪🇪  Estonia|EE
🇫🇮  Finland|FI
🇫🇷  France|FR
🇩🇪  Germany|DE
🇬🇷  Greece|GR
🇭🇰  Hong Kong|HK
🇭🇺  Hungary|HU
🇮🇸  Iceland|IS
🇮🇳  India|IN
🇮🇩  Indonesia|ID
🇮🇪  Ireland|IE
🇮🇱  Israel|IL
🇮🇹  Italy|IT
🇯🇵  Japan|JP
🇱🇻  Latvia|LV
🇱🇹  Lithuania|LT
🇱🇺  Luxembourg|LU
🇲🇾  Malaysia|MY
🇲🇽  Mexico|MX
🇲🇩  Moldova|MD
🇳🇱  Netherlands|NL
🇳🇿  New Zealand|NZ
🇲🇰  North Macedonia|MK
🇳🇴  Norway|NO
🇵🇰  Pakistan|PK
🇵🇳  Panama|PA
🇵🇱  Poland|PL
🇵🇹  Portugal|PT
🇷🇴  Romania|RO
🇷🇸  Serbia|RS
🇸🇬  Singapore|SG
🇸🇰  Slovakia|SK
🇸🇮  Slovenia|SI
🇿🇦  South Africa|ZA
🇰🇷  South Korea|KR
🇪🇸  Spain|ES
🇸🇪  Sweden|SE
🇨🇭  Switzerland|CH
🇹🇼  Taiwan|TW
🇹🇭  Thailand|TH
🇹🇷  Turkey|TR
🇺🇦  Ukraine|UA
🇦🇪  UAE|AE
🇬🇧  United Kingdom|GB
🇺🇸  United States|US"
fi

# Show rofi
chosen=$(echo -e "$menu" | grep -v "───" | rofi -dmenu \
    -p "🌍 ProtonVPN" \
    -theme-str 'window {width: 320px;}' \
    -theme-str 'listview {lines: 12;}' \
    -i)

[ -z "$chosen" ] && exit 0

# Kill any running proton processes
pkill -9 protonvpn-app 2>/dev/null
pkill -9 protonvpn 2>/dev/null
sleep 0.5

# Match and connect
case "$chosen" in
    *"Fastest"*)    protonvpn connect ;;
    *"Disconnect"*) protonvpn disconnect ;;
    *"Secure Core"*)protonvpn connect --securecore ;;
    *"P2P"*)        protonvpn connect --p2p ;;
    *"Tor"*)        protonvpn connect --tor ;;
    *)
        code=$(echo "$chosen" | grep -oP '\|\K[A-Z]+$' || \
               echo "$chosen" | awk '{print $NF}' | tr -d '|')
        [ -n "$code" ] && protonvpn connect --country "$code"
        ;;
esac
