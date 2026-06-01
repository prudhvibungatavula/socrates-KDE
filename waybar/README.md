# Waybar on KDE Plasma Wayland
```
 Built for ASUS laptops on Arch Linux - KDE plasma
```
<img width="2558" height="64" alt="maybar all on" src="https://github.com/user-attachments/assets/3299b5f8-742b-4492-831d-fb6cdbf845e9" />

<img width="2559" height="1439" alt="main screen" src="https://github.com/user-attachments/assets/2946b199-178c-46af-8843-888091cb4a28" />


---

## What is this?

Most Waybar dotfiles are made for Hyprland. This is a fully custom Waybar setup that runs on **KDE Plasma Wayland** : giving you the look and feel of a heavily riced Hyprland desktop while keeping all the convenience of KDE (easy app installs, Plasma widgets, better battery life, stability).

Inspired by PewDiePie's Arch/Hyprland rice but rebuilt from scratch for KDE. Almost nothing online documents running Waybar on KDE Wayland properly, so everything here was figured out independently.

---

## How it looks

The bar is split into three sections:

**Left:** Clock → Power Menu → Network → Bluetooth → Microphone → VPN

**Center:** Workspace 1 → Workspace 2 → GPU Mode → Workspace 3 → Workspace 4

**Right:** Battery → Volume → Brightness

---

## Features

### Workspaces
Custom scripts replace Hyprland's `hyprctl` with KDE's `qdbus6` DBus interface. Each workspace shows a Telugu numeral (`1 2 3 4`) when inactive and a filled circle (`⬤`) in orange when active. Clicking switches desktops. The UUIDs are KDE-specific and need to be updated on fresh installs (instructions below).

### Slide Animation
When you switch workspaces, Waybar restarts and slides down from the top like a curtain. A watcher script polls KWin for desktop changes every 150ms with a 150ms settle check : so if you switch desktops rapidly it waits until you stop before restarting. This prevents glitching while keeping the animation snappy.

> **Don't want the animation?** Just disable the watcher service and run Waybar normally : everything else still works perfectly.
> ```bash
> systemctl --user disable waybar-watcher.service
> systemctl --user stop waybar-watcher.service
> waybar &
> ```

### OLED Burn-in Protection
Running an OLED display means static elements (like a always-visible bar) can cause burn-in over time. The watcher script restarts Waybar on every workspace switch which causes the bar to briefly disappear and reappear : this naturally cycles the pixels under the bar. Combined with the slide animation, the bar never stays completely static for long periods. If you are **not** on OLED, you can disable this behavior as described above.

### ProtonVPN
- **Left click** : connects to fastest server or disconnects
- **Right click** : opens a rofi country picker with 60+ countries, special modes (Secure Core, P2P, Tor)
- **Bar shows** : current city and country when connected (e.g. `󰦝 Chicago, United States`)
- **Tooltip shows** : server ID, load percentage, protocol
- The GUI and CLI cannot run at the same time : the toggle script force-kills the GUI before connecting

### Bluetooth
- **Bar shows** : device type icon + short name + battery % with color-coded battery icon
  - Green = above 50%, Orange = 20–50%, Red = below 20%
  - Device icons: headphones `󰋋`, mouse `󰍽`, keyboard `󰌌`, phone `󰄜`, speaker `󰓃`
- **Left click** : toggles Bluetooth on/off and auto-reconnects to paired devices
- **Right click** : rofi device picker showing all paired devices with type icons
- **Tooltip** : lists all connected and paired devices with battery levels

### WiFi
- **Right click** : opens rofi network picker sorted by signal strength
- Shows signal icon (`󰤨 󰤥 󰤢 󰤟 󰤯`) and lock icon for secured networks
- Click a known network to connect instantly
- Click an unknown network to get a password prompt
- Click a connected network to disconnect

### Brightness
A single module that cycles between three displays with **left click**:
- 💻 **Laptop screen** (`intel_backlight`) : scroll to adjust
- 🖥️ **External monitor** (DDC/CI via `ddcutil`) : scroll to adjust
- ⌨️ **Keyboard backlight** (`asus::kbd_backlight`, levels: Off/Low/Mid/High) : scroll to adjust

**Right click** : opens keyboard aura mode picker:
- Static color (pick from color palette)
- Breathe (1 or 2 colors, speed control)
- Rainbow Wave (direction + speed)
- Rainbow Cycle (speed)
- Pulse (color)

> External monitor brightness requires DDC/CI support and the user in the `i2c` group.
> If your monitor does not support DDC, only laptop and keyboard brightness will work.

### Volume
- **Bar shows** : volume icon + ASCII bar + percentage
- **Left click** : mute/unmute
- **Right click** : rofi audio output switcher (switch between headphones, speakers, HDMI, etc. : moves all active audio streams instantly)
- **Scroll** : volume up/down in 5% steps

### Battery
- **Bar shows** : battery icon + ASCII bar + percentage with color thresholds (cyan/orange/red)
- **Tooltip shows** : charge status, time to empty/full, discharge rate (watts), voltage
- Automatically detects battery path (supports BAT0, BAT1, etc.)
- Ignores non-laptop batteries (e.g. Bluetooth mouse battery)

### SuperGFX GPU Mode
- **Bar shows** : current GPU mode: `[ IGP ]` (Integrated), `[ HYB ]` (Hybrid), `[ dGPU ]` (MUX)
- **Left click** : opens rofi picker to switch modes
- Switching requires `pkexec` (password prompt) and a logout for Hybrid, reboot for MUX
- Reading the current mode is passwordless via sudoers rule

### Microphone
- **Left click** : mute/unmute default microphone via `pactl`
- Script shows current mute state

### Power Menu
- **Left click** : opens rofi power menu via `powermenu.sh`

### Network
- **Bar shows** : WiFi signal icon or ethernet icon
- **Left click** : opens `nm-connection-editor`
- **Right click** : opens WiFi picker (see WiFi section above)
- **Tooltip** : shows SSID, download and upload bandwidth

---

## File Structure

```
~/.config/waybar/
├── config                          # Main Waybar configuration
├── style.css                       # All styling and animations
├── waybar.service                  # systemd user service for Waybar
├── waybar-watcher.service          # systemd user service for animation watcher
├── README.md
└── scripts/
    ├── asus-gpu-switch.sh          # SuperGFX GPU mode rofi picker
    ├── asus-profile.sh             # SuperGFX current mode status
    ├── audio-switcher.sh           # Rofi audio output switcher
    ├── battery.sh                  # Battery status with ASCII bar
    ├── bluetooth-menu.sh           # Rofi Bluetooth device picker
    ├── bluetooth-status.sh         # Bluetooth status with device + battery
    ├── bluetooth-toggle.sh         # Toggle Bluetooth + auto-reconnect
    ├── brightness-menu.sh          # Old brightness menu (unused)
    ├── brightness-scroll-down.sh   # Decrease active display brightness
    ├── brightness-scroll-up.sh     # Increase active display brightness
    ├── brightness-toggle-display.sh # Cycle between laptop/monitor/keyboard
    ├── brightness-toggle.sh        # Simple brightness toggle (unused)
    ├── brightness.sh               # Brightness status for active display
    ├── kbd-aura.sh                 # Keyboard aura mode/color picker
    ├── mic.sh                      # Microphone mute status
    ├── powermenu.sh                # Rofi power menu
    ├── protonvpn-status.sh         # ProtonVPN connection status
    ├── protonvpn-toggle.sh         # ProtonVPN connect/disconnect
    ├── volume.sh                   # Volume status with ASCII bar
    ├── vpn-countries.sh            # ProtonVPN rofi country picker
    ├── waybar-autohide.sh          # Autohide script (experimental)
    ├── waybar-watcher.sh           # KWin desktop switch watcher
    ├── wifi-menu.sh                # Rofi WiFi network picker
    └── workspaces/
        ├── workspace-1.sh          # KWin workspace 1 status
        ├── workspace-2.sh          # KWin workspace 2 status
        ├── workspace-3.sh          # KWin workspace 3 status
        └── workspace-4.sh          # KWin workspace 4 status
```

---

## Dependencies

Install all required packages:
```bash
sudo pacman -S waybar brightnessctl ddcutil rofi-wayland blueman \
               networkmanager ttf-jetbrains-mono-nerd asusctl \
               supergfxctl proton-vpn-cli pipewire wireplumber
```

Add yourself to the `i2c` group for DDC monitor brightness:
```bash
sudo usermod -aG i2c $USER
sudo modprobe i2c-dev
```

---

## Installation

### 1. Clone the repo
```bash
git clone https://github.com/prudhvibungatavula/waybar-kde-plasma-wayland ~/.config/waybar
```

### 2. Make scripts executable
```bash
chmod +x ~/.config/waybar/scripts/*.sh
chmod +x ~/.config/waybar/scripts/workspaces/*.sh
```

### 3. Update workspace UUIDs
KDE assigns unique UUIDs to virtual desktops. Get yours:
```bash
qdbus6 --literal org.kde.KWin /VirtualDesktopManager \
  org.freedesktop.DBus.Properties.Get \
  org.kde.KWin.VirtualDesktopManager desktops
```
Update the UUID in each `scripts/workspaces/workspace-*.sh` and in the `on-click` lines in `config`.

### 4. Install systemd services (optional but recommended)
```bash
cp ~/.config/waybar/waybar.service ~/.config/systemd/user/
cp ~/.config/waybar/waybar-watcher.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable waybar.service waybar-watcher.service
systemctl --user start waybar.service waybar-watcher.service
```

### 5. Or just launch manually
```bash
waybar &
```

---

## Configuration

### Disabling the workspace animation (non-OLED users)
If you don't need the slide animation on workspace switch:
```bash
systemctl --user disable waybar-watcher.service
systemctl --user stop waybar-watcher.service
```
Waybar will stay running permanently without restarting.

### Disabling external monitor brightness
If you don't have a DDC-compatible monitor, edit `brightness-toggle-display.sh` and remove the `monitor` case : it will cycle between laptop and keyboard only.

### Changing VPN provider
The scripts use `protonvpn` CLI. If you use a different VPN, edit `protonvpn-status.sh` and `protonvpn-toggle.sh` with your VPN's CLI commands.

### Changing keyboard aura colors
Edit `kbd-aura.sh` to add or remove colors from the palette. Colors are standard hex values (e.g. `ff00ff`).

---

## Notes

- Workspace UUIDs change on fresh KDE installs : always update them after reinstalling
- ProtonVPN GUI and CLI conflict : the toggle script kills the GUI before running CLI commands
- SuperGFX mode switching always requires a logout (Hybrid) or reboot (MUX)
- The `brightness-menu.sh` and `brightness-toggle.sh` files are unused leftovers and can be deleted
- Tested on KDE Plasma 6 with KWin Wayland on CachyOS

---

## Credits

Config structure inspired by [pewdiepie-archdaemon/dionysus](https://github.com/pewdiepie-archdaemon/dionysus) : all scripts rewritten for KDE Plasma Wayland.
