#!/bin/bash
# ── powermenu.sh ───────────────────────────────────────────
# Dependencies: rofi, systemctl, loginctl
# ──────────────────────────────────────────────────────────

options="Shutdown\nReboot\nLogout\nSuspend\nLock"

chosen=$(echo -e "$options" | rofi -dmenu \
    -p "Power" \
    -theme-str 'window {width: 200px;}' \
    -theme-str 'listview {lines: 5;}')

case $chosen in
    Shutdown) systemctl poweroff ;;
    Reboot)   systemctl reboot ;;
    Logout)   loginctl terminate-user "$USER" ;;
    Suspend)  systemctl suspend ;;
    Lock)     loginctl lock-session ;;
esac
