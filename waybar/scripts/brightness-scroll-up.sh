#!/bin/bash
state=$(cat /tmp/waybar-brightness-display 2>/dev/null || echo "laptop")
case "$state" in
    monitor)
        current=$(ddcutil getvcp 10 2>/dev/null | grep -oP 'current value =\s*\K[0-9]+')
        new=$(( current + 5 ))
        [ $new -gt 100 ] && new=100
        ddcutil setvcp 10 $new
        ;;
    keyboard)
        current=$(brightnessctl -d asus::kbd_backlight get)
        new=$(( current + 1 ))
        [ $new -gt 3 ] && new=3
        brightnessctl -d asus::kbd_backlight set $new
        ;;
    *)
        brightnessctl -d intel_backlight set +5%
        ;;
esac
