#!/bin/bash

if rfkill list bluetooth | grep -q "Soft blocked: yes"; then
    rfkill unblock bluetooth
    sleep 0.3
    bluetoothctl power on
    sleep 0.3
    bluetoothctl devices Paired | awk '{print $2}' | while read mac; do
        bluetoothctl connect "$mac" 2>/dev/null &
    done
else
    rfkill block bluetooth
fi
