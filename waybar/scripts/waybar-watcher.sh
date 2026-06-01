#!/bin/bash

last_desktop=$(qdbus6 org.kde.KWin /VirtualDesktopManager \
    org.freedesktop.DBus.Properties.Get \
    org.kde.KWin.VirtualDesktopManager current 2>/dev/null)

while true; do
    sleep 0.15
    current_desktop=$(qdbus6 org.kde.KWin /VirtualDesktopManager \
        org.freedesktop.DBus.Properties.Get \
        org.kde.KWin.VirtualDesktopManager current 2>/dev/null)

    if [ "$current_desktop" != "$last_desktop" ]; then
        last_desktop="$current_desktop"
        sleep 0.2
        settled=$(qdbus6 org.kde.KWin /VirtualDesktopManager \
            org.freedesktop.DBus.Properties.Get \
            org.kde.KWin.VirtualDesktopManager current 2>/dev/null)
        if [ "$settled" = "$current_desktop" ]; then
            systemctl --user restart waybar.service
        fi
    fi
done
