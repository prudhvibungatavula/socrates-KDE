#!/bin/bash
if pactl get-source-mute @DEFAULT_SOURCE@ | grep -q 'yes'; then
    echo "<span foreground='#f38ba8'>[ 󰍭 ]</span>"
else
    echo "<span foreground='#a6e3a1'>[ 󰍬 ]</span>"
fi
