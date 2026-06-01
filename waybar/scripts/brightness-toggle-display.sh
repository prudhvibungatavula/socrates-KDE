#!/bin/bash
state_file="/tmp/waybar-brightness-display"
current=$(cat "$state_file" 2>/dev/null || echo "laptop")

# Check if external monitor is connected
monitor_connected=$(ddcutil detect 2>/dev/null | grep -c "Display")

if [ "$monitor_connected" -gt 0 ]; then
    # 3 way cycle: laptop → monitor → keyboard
    case "$current" in
        laptop)   echo "monitor"  > "$state_file" ;;
        monitor)  echo "keyboard" > "$state_file" ;;
        keyboard) echo "laptop"   > "$state_file" ;;
    esac
else
    # 2 way cycle: laptop → keyboard
    case "$current" in
        laptop)   echo "keyboard" > "$state_file" ;;
        keyboard) echo "laptop"   > "$state_file" ;;
        monitor)  echo "laptop"   > "$state_file" ;;
    esac
fi
