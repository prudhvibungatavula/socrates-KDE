#!/bin/bash
mode=$(/usr/bin/supergfxctl --get 2>/dev/null)
case "$mode" in
    Integrated)  echo "<span foreground='#56b6c2'>[ IGP ]</span>" ;;
    Hybrid)      echo "<span foreground='#fab387'>[ HYB ]</span>" ;;
    AsusMuxDgpu) echo "<span foreground='#bf616a'>[ dGPU ]</span>" ;;
    *)           echo "<span foreground='#ffffff'>[ GPU? ]</span>" ;;
esac
