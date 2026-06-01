#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────
#  Waybar KDE Plasma Wayland — Install Script
#  Works on Arch/CachyOS/Manjaro
# ──────────────────────────────────────────────────────────────────────────

set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Waybar KDE Plasma Wayland -- Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Check we are on KDE Wayland ────────────────────────────────────────
if [ "$XDG_SESSION_TYPE" != "wayland" ]; then
    echo "WARNING: Not running on Wayland. Some features may not work."
fi

if [ -z "$KDE_FULL_SESSION" ]; then
    echo "WARNING: KDE session not detected. This config is built for KDE Plasma."
fi

# ── 2. Install dependencies ───────────────────────────────────────────────
echo "-> Installing dependencies..."

if command -v pacman &>/dev/null; then
    sudo pacman -S --needed --noconfirm \
        waybar \
        brightnessctl \
        ddcutil \
        rofi-wayland \
        networkmanager \
        ttf-jetbrains-mono-nerd \
        pipewire \
        wireplumber \
        bluez \
        bluez-utils \
        upower \
        curl
    echo "   Done."
else
    echo "WARNING: pacman not found. Please install dependencies manually:"
    echo "   waybar brightnessctl ddcutil rofi bluez bluez-utils upower curl"
    echo "   ttf-jetbrains-mono-nerd pipewire wireplumber networkmanager"
fi

# ── 3. Install optional ASUS dependencies ─────────────────────────────────
echo ""
read -p "-> Are you on an ASUS laptop with supergfxctl/asusctl? (y/n): " asus_answer
if [ "$asus_answer" = "y" ]; then
    if command -v pacman &>/dev/null; then
        sudo pacman -S --needed --noconfirm supergfxctl asusctl 2>/dev/null || \
        yay -S --needed --noconfirm supergfxctl asusctl 2>/dev/null || \
        echo "WARNING: Could not install supergfxctl/asusctl -- install manually"
    fi
    echo "   ASUS tools installed."
fi

# ── 4. Install optional ProtonVPN ─────────────────────────────────────────
echo ""
read -p "-> Do you use ProtonVPN? (y/n): " vpn_answer
if [ "$vpn_answer" = "y" ]; then
    if command -v pacman &>/dev/null; then
        sudo pacman -S --needed --noconfirm proton-vpn-cli 2>/dev/null || \
        yay -S --needed --noconfirm proton-vpn-cli 2>/dev/null || \
        echo "WARNING: Could not install proton-vpn-cli -- install manually"
    fi
    echo "   ProtonVPN CLI installed."
fi

# ── 5. Add user to i2c group for DDC monitor brightness ───────────────────
echo ""
echo "-> Adding user to i2c group for external monitor brightness..."
sudo usermod -aG i2c "$USER" 2>/dev/null && echo "   Done." || echo "WARNING: Could not add to i2c group."
sudo modprobe i2c-dev 2>/dev/null

# ── 6. Make scripts executable ────────────────────────────────────────────
echo ""
echo "-> Making scripts executable..."
chmod +x ~/.config/waybar/scripts/*.sh
chmod +x ~/.config/waybar/scripts/workspaces/*.sh
echo "   Done."

# ── 7. Auto-detect battery path ───────────────────────────────────────────
echo ""
echo "-> Detecting battery..."
BAT=$(ls /sys/class/power_supply/ | grep -iE '^BAT' | grep -iv mouse | head -1)
if [ -n "$BAT" ]; then
    echo "   Battery found: $BAT"
    sed -i "s|bat_path=\"/sys/class/power_supply/BAT.*\"|bat_path=\"/sys/class/power_supply/$BAT\"|g" \
        ~/.config/waybar/scripts/battery.sh
else
    echo "WARNING: No battery found -- may be a desktop system."
fi

# ── 8. Auto-detect backlight ──────────────────────────────────────────────
echo ""
echo "-> Detecting backlight..."
BL=$(ls /sys/class/backlight/ | grep -v nvidia | head -1)
if [ -n "$BL" ]; then
    echo "   Backlight found: $BL"
    sed -i "s|brightnessctl -d intel_backlight|brightnessctl -d $BL|g" \
        ~/.config/waybar/scripts/brightness.sh \
        ~/.config/waybar/scripts/brightness-scroll-up.sh \
        ~/.config/waybar/scripts/brightness-scroll-down.sh \
        ~/.config/waybar/scripts/brightness-toggle-display.sh
else
    echo "WARNING: No backlight found."
fi

# ── 9. Set up KWin virtual desktop count ──────────────────────────────────
echo ""
echo "-> Checking KWin virtual desktops..."
DESKTOP_COUNT=$(qdbus6 org.kde.KWin /VirtualDesktopManager org.freedesktop.DBus.Properties.Get org.kde.KWin.VirtualDesktopManager count 2>/dev/null)
if [ -z "$DESKTOP_COUNT" ]; then
    echo "WARNING: Could not detect KWin desktops -- make sure KDE is running."
else
    echo "   Found $DESKTOP_COUNT virtual desktops."
    if [ "$DESKTOP_COUNT" -lt 4 ]; then
        echo "   Less than 4 desktops detected. Adding more..."
        for i in $(seq "$DESKTOP_COUNT" 3); do
            qdbus6 org.kde.KWin /VirtualDesktopManager org.kde.KWin.VirtualDesktopManager.createDesktop "$i" "Desktop $((i+1))" 2>/dev/null
        done
        echo "   Now have 4 virtual desktops."
    fi
fi

# ── 10. Install systemd services ──────────────────────────────────────────
echo ""
read -p "-> Install systemd services for autostart and workspace animation? (y/n): " systemd_answer
if [ "$systemd_answer" = "y" ]; then
    mkdir -p ~/.config/systemd/user

    cp ~/.config/waybar/waybar.service ~/.config/systemd/user/ 2>/dev/null || \
    cat > ~/.config/systemd/user/waybar.service << 'SVCEOF'
[Unit]
Description=Waybar
After=graphical-session.target
PartOf=graphical-session.target

[Service]
ExecStart=/usr/bin/waybar
Restart=on-failure
RestartSec=2

[Install]
WantedBy=graphical-session.target
SVCEOF

    cp ~/.config/waybar/waybar-watcher.service ~/.config/systemd/user/ 2>/dev/null || \
    cat > ~/.config/systemd/user/waybar-watcher.service << 'SVCEOF'
[Unit]
Description=Waybar Desktop Switch Watcher
After=waybar.service

[Service]
ExecStart=/home/$USER/.config/waybar/scripts/waybar-watcher.sh
Restart=on-failure
RestartSec=2

[Install]
WantedBy=graphical-session.target
SVCEOF

    sed -i "s|/home/akash/|/home/$USER/|g" ~/.config/systemd/user/waybar-watcher.service
    systemctl --user daemon-reload
    systemctl --user enable waybar.service waybar-watcher.service
    systemctl --user start waybar.service waybar-watcher.service
    echo "   Systemd services installed and started."
else
    echo "   Skipping systemd services. Launch Waybar manually with: waybar &"
fi

# ── 11. Font cache refresh ────────────────────────────────────────────────
echo ""
echo "-> Refreshing font cache..."
fc-cache -fv &>/dev/null
echo "   Done."

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installation complete."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Next steps:"
echo "  1. Log out and back in for i2c group to take effect"
echo "  2. If not using systemd: run 'waybar &' to start"
echo "  3. If using ProtonVPN: run 'protonvpn signin' first"
echo "  4. Right click Waybar modules to access menus"
echo ""
echo "  Repo: https://github.com/prudhvibungatavula/waybar-kde-plasma-wayland"
echo ""
