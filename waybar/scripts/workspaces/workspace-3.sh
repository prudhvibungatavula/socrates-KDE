#!/bin/bash
current=$(qdbus6 org.kde.KWin /VirtualDesktopManager org.freedesktop.DBus.Properties.Get org.kde.KWin.VirtualDesktopManager current 2>/dev/null)
uuid=$(qdbus6 --literal org.kde.KWin /VirtualDesktopManager org.freedesktop.DBus.Properties.Get org.kde.KWin.VirtualDesktopManager desktops 2>/dev/null | grep -oP '"[a-f0-9-]{36}"' | sed -n '3p' | tr -d '"')
if [ "$current" = "$uuid" ]; then
  echo "<span foreground='#fab387'>[●]</span>"
else
  echo "<span foreground='#56b6c2'>[3]</span>"
fi
