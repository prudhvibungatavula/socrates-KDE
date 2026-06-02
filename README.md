# socrates-KDE

```
 A complete KDE Plasma Wayland rice
 Built on CachyOS — ASUS Zephyrus G16 2024
```

---

## The Story

I have an ASUS Zephyrus G16 2024 - an OLED laptop with an Intel iGPU, an NVIDIA dGPU, and an ASUS MUX switch. When I got into Linux ricing, everything I found online was for Hyprland. The dotfiles, the guides, the YouTube videos - all Hyprland. Nobody was documenting how to do any of this on KDE Plasma Wayland.

I didn't want to switch to Hyprland. KDE gives me things Hyprland doesn't - stable app installs, Plasma widgets, better battery life out of the box, and a proper settings GUI when I need it. But I still wanted my desktop to look and feel like a proper rice. Inspired by PewDiePie's Arch/Hyprland setup, I decided to figure it out myself.

The OLED screen added another problem. Static UI elements sitting in the same position for hours cause burn-in on OLED panels. I couldn't find a single documented solution for preventing Waybar burn-in on KDE Wayland. So I built one myself - a watcher script that restarts Waybar on every workspace switch, cycling the pixels under the bar and preventing any static retention. It doubles as a slide-down animation trigger, so the bar drops from the top every time you switch desktops.

Everything in this repo was figured out from scratch. No existing dotfiles worked out of the box for this setup.

---

## What this repo contains

```
socrates-KDE/
├── waybar/          Custom Waybar bar with full script suite
├── klassy/          Klassy window decoration config
├── krohnkite/       KWin tiling script
├── kde/             KDE global configs
├── themes/          Color schemes and GTK settings
├── wallpapers/      Wallpapers used in the setup
└── README.md        This file
```

---

## Screenshots

<img width="2559" height="1599" alt="main screen" src="https://github.com/user-attachments/assets/80abfce2-f28c-4c15-a0df-d3c88a8d44f1" />

<img width="2559" height="1439" alt="2026-06-01_15-34" src="https://github.com/user-attachments/assets/0b880326-1ada-4739-b325-500873c9ab0b" />

<img width="2559" height="62" alt="maybar all off" src="https://github.com/user-attachments/assets/c0154d46-cdca-4c7a-9f88-9f07834469a8" />

<img width="2558" height="64" alt="maybar all on" src="https://github.com/user-attachments/assets/1d476eae-c8d1-4387-9837-2ec4ef371b66" />


---

## Theme Stack

| Component         | Value                        |
|-------------------|------------------------------|
| OS                | CachyOS (Arch-based)         |
| Desktop           | KDE Plasma 6 on Wayland      |
| Bar               | Waybar                       |
| Window decoration | Klassy                       |
| Color scheme      | Main (included in repo)      |
| Plasma theme      | Sweet                        |
| Icons             | Papirus-Dark                 |
| Font              | JetBrains Mono Medium 11     |
| Cursor            | capitaine-cursors-light      |
| Tiling            | Krohnkite (KWin script)      |
| Terminal          | Konsole                      |

---

## Waybar

The centerpiece of this rice. A fully custom Waybar running on KDE Plasma Wayland — something almost nobody had documented before this.

**Key challenges solved:**
- Workspace scripts rewritten from Hyprland (`hyprctl`) to KWin DBus (`qdbus6`) — workspaces detect the active desktop and highlight accordingly
- OLED burn-in prevention via a watcher script that restarts Waybar on every workspace switch
- Slide-down curtain animation on workspace switch
- External monitor brightness via DDC/CI (`ddcutil`) without X11
- ProtonVPN CLI/GUI conflict resolution
- SuperGFX GPU mode switching (Integrated / Hybrid / dGPU MUX)

**Modules:**
- Clock with calendar tooltip
- Power menu (rofi)
- Network with WiFi picker (rofi, signal strength icons)
- Bluetooth with device type icon, name and battery level
- Microphone mute indicator
- ProtonVPN with country picker (60+ countries, Secure Core, P2P, Tor)
- Workspace switcher (1-4, KWin DBus)
- SuperGFX GPU mode indicator
- Battery with ASCII bar, discharge rate, voltage
- Volume with ASCII bar and audio output switcher
- Brightness cycling between laptop screen, external monitor and keyboard backlight with keyboard aura picker

See `waybar/README.md` for full documentation and install instructions.

---

## Klassy

Klassy is a KDE window decoration that gives precise control over title bar style, button appearance, spacing and borders. The config in `klassy/klassyrc` is my personal setup — minimal title bars with clean borders that match the color scheme.

**Install:**
```bash
yay -S klassy
cp klassy/klassyrc ~/.config/klassy/klassyrc
```
Then apply in System Settings -> Window Decoration -> Klassy.

---

## Krohnkite

Krohnkite is a KWin tiling script that adds dynamic tiling to KDE — similar to how tiling works in i3 or Hyprland but running natively inside KWin. Windows tile automatically when you open them and you can drag to resize.

**Install:**
```bash
yay -S krohnkite
cp -r krohnkite/krohnkite ~/.local/share/kwin/scripts/
```
Then enable in System Settings -> KWin Scripts -> Krohnkite.

---

## KDE Configs

The `kde/` folder contains:

| File                    | What it does                                      |
|-------------------------|---------------------------------------------------|
| `kdeglobals`            | Global KDE settings - colors, fonts, icon theme  |
| `kwinrc`                | KWin config - effects, tiling, window rules       |
| `plasmarc`              | Plasma theme settings                             |
| `plasmashellrc`         | Panel layout and visibility settings              |
| `kglobalshortcutsrc`    | All keyboard shortcuts                            |
| `kscreenlockerrc`       | Lock screen config                                |

**Apply:**
```bash
cp kde/kdeglobals ~/.config/kdeglobals
cp kde/kwinrc ~/.config/kwinrc
cp kde/plasmarc ~/.config/plasmarc
cp kde/plasmashellrc ~/.config/plasmashellrc
cp kde/kglobalshortcutsrc ~/.config/kglobalshortcutsrc
```
Log out and back in after applying.

---

## Themes

The `themes/` folder contains:

- `color-schemes/Main.colors` - the primary color scheme used across the entire setup. Install by copying to `~/.local/share/color-schemes/` and selecting in System Settings -> Colors.
- `gtk/gtk3-settings.ini` - GTK3 app theming (icon theme, font, cursor)
- `gtk/gtk4-settings.ini` - GTK4 app theming

**Install color scheme:**
```bash
cp themes/color-schemes/Main.colors ~/.local/share/color-schemes/
```
Then apply in System Settings -> Colors & Themes -> Colors -> Main.

**Install GTK settings:**
```bash
cp themes/gtk/gtk3-settings.ini ~/.config/gtk-3.0/settings.ini
cp themes/gtk/gtk4-settings.ini ~/.config/gtk-4.0/settings.ini
```

**Install required packages:**
```bash
sudo pacman -S papirus-icon-theme
yay -S capitaine-cursors sweet-kde-theme-git
```

---

## Wallpapers

The `wallpapers/` folder contains the wallpapers used in the setup. Copy to your wallpapers folder:

```bash
cp wallpapers/* ~/.local/share/wallpapers/
```

Then right click the desktop -> Configure Desktop -> pick the wallpaper.

---

## Quick Install

Clone the repo and run the Waybar install script to get started:

```bash
git clone https://github.com/prudhvibungatavula/socrates-KDE ~/socrates-KDE
cd ~/socrates-KDE/waybar
./install.sh
```

The install script handles dependencies, auto-detects hardware paths, and sets up systemd services. For the rest of the setup (Klassy, Krohnkite, themes) follow the sections above.

---

## Requirements

- Arch Linux, CachyOS, or Manjaro
- KDE Plasma 6 on Wayland
- An AUR helper (`yay` or `paru`) for some packages

> Most things will work on any KDE Wayland setup. ASUS-specific modules (SuperGFX, keyboard aura) are optional and the install script will ask if you have an ASUS laptop.

---

## OLED Users

If you are on an OLED display, keep the Waybar watcher service enabled. It restarts Waybar on every workspace switch which cycles the pixels under the bar and prevents burn-in. If you are not on OLED, you can disable it:

```bash
systemctl --user disable waybar-watcher.service
systemctl --user stop waybar-watcher.service
```

---

## Credits

Waybar config structure originally inspired by [pewdiepie-archdaemon/dionysus](https://github.com/pewdiepie-archdaemon/dionysus). All scripts were rewritten from scratch for KDE Plasma Wayland.
