#!/bin/bash
# Usage: switch.sh <desktop_number 1-4>
n=$1
uuid=$(qdbus6 --literal org.kde.KWin /VirtualDesktopManager org.freedesktop.DBus.Properties.Get org.kde.KWin.VirtualDesktopManager desktops 2>/dev/null | grep -oP '"[a-f0-9-]{36}"' | sed -n "${n}p" | tr -d '"')
qdbus6 org.kde.KWin /VirtualDesktopManager org.freedesktop.DBus.Properties.Set org.kde.KWin.VirtualDesktopManager current "$uuid"
