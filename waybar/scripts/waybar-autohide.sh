#!/bin/bash
trap '' SIGUSR1

HIDDEN=false
SCRIPT_ID=""

hide_waybar() {
    if [ "$HIDDEN" = false ]; then
        pkill -SIGUSR1 waybar 2>/dev/null
        HIDDEN=true
    fi
}

show_waybar() {
    if [ "$HIDDEN" = true ]; then
        pkill -SIGUSR1 waybar 2>/dev/null
        HIDDEN=false
    fi
}

# Write KWin script to count windows
cat > /tmp/kwin-count.js << 'JSEOF'
var clients = workspace.windowList();
var count = 0;
for (var i = 0; i < clients.length; i++) {
    var c = clients[i];
    if (!c.dock && !c.desktop && !c.toolbar && !c.menu && c.normalWindow) {
        count++;
    }
}
print(count);
JSEOF

while true; do
    # Check Win+D state
    showing=$(qdbus6 org.kde.KWin /KWin org.freedesktop.DBus.Properties.Get org.kde.KWin showingDesktop 2>/dev/null | tail -1 | xargs)

    # Count real windows via KWin script
    script_id=$(qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.loadScript /tmp/kwin-count.js 2>/dev/null)
    win_count=$(qdbus6 org.kde.KWin /Scripting/Script${script_id} org.kde.kwin.Script.run 2>/dev/null | tr -d '[:space:]')
    qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "kwin-count.js" 2>/dev/null

    # Hide if desktop shown or no windows
    if [ "$showing" = "true" ] || [ "$win_count" = "0" ] || [ -z "$win_count" ]; then
        hide_waybar
    else
        show_waybar
    fi

    sleep 0.5
done
