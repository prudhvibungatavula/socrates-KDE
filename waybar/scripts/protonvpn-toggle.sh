#!/bin/bash
# ── vpn-toggle.sh ─────────────────────────────────────────
# Description: Toggle ProtonVPN on/off
# Dependencies: protonvpn
# ──────────────────────────────────────────────────────────

# Force kill GUI first
pkill -9 protonvpn-app 2>/dev/null
pkill -9 protonvpn 2>/dev/null
sleep 1

STATUS=$(protonvpn status 2>/dev/null)

if echo "$STATUS" | grep -q "Connected"; then
    protonvpn disconnect
else
    protonvpn connect
fi
