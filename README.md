# 🎮 Minecraft Doom: BOSS UPDATE

A retro-style **FPS (First-Person Shooter)** game built entirely in vanilla JavaScript using **raycasting** technology. Battle creepers, skeletons, and an epic fire boss boss in a procedurally-themed maze!

## ✨ Features

- **3D Raycasting Engine** - Classic Wolfenstein 3D-style graphics
- **Multiple Enemies** - Creepers, Skeletons, and a powerful Boss
- **Dual Weapon System**:
  - 🔫 **Shotgun**: Wide blast radius, slower fire rate
  - 🎯 **Assault Rifle**: Precision shots with fast fire rate, magazine-based reloading
- **Dynamic Boss Encounters** - Special boss enemy that appears every 3 minutes
- **Score System** - Earn points for defeating enemies
- **Smooth Animations** - Walking animations, weapon sway, muzzle flash effects

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **W** / **↑** | Move forward |
| **S** / **↓** | Move backward |
| **A** / **←** | Turn left |
| **D** / **→** | Turn right |
| **1** | Select Shotgun |
| **2** | Select Rifle |
| **Space** / **Click** | Shoot |

## 🎯 Game Mechanics

### Enemy Types

| Enemy | HP | Speed | Damage/sec | Points |
|-------|-----|-------|-----------|--------|
| **Creeper** | 2 | Slow | 45 (instant death) | 100 |
| **Skeleton** | 3 | Medium | 12 | 200 |
| **BOSS** 👑 | 30 | Fast | 40 | 2000 |

### Spawning System
- **Regular Enemies**: 2 enemies spawn every 30 seconds
- **Ammo Reload**: +30 ammo every 30 seconds
- **Boss Spawn**: Every 180 seconds (3 minutes)

## 🚀 How to Run

1. Open `index.html` in a modern web browser
2. Click on the game canvas to focus
3. Start shooting!

## 🛠️ Technical Details

### Engine
- **Rendering**: Raycasting with depth buffering
- **Texturing**: Multi-color striped walls with distance-based shadows
- **Collision**: Grid-based collision detection
- **Performance**: ~60 FPS on most modern browsers

### Game Loop
- Update phase: Player movement, weapon logic, enemy AI
- Render phase: Wall rendering, enemy sprites, weapon display
- 60 FPS locked animation frame rendering

## 🎨 Technologies Used

- **Vanilla JavaScript** (no frameworks!)
- **HTML5 Canvas** for rendering
- **CSS3** for UI styling
- **ES6+** JavaScript features

## 📝 Version History

### v1.0.0 (Initial Release)
- Core raycasting engine
- Dual weapon system (Shotgun & Rifle)
- Multiple enemy types
- Boss enemy implementation
- Score tracking system
- Full game loop with collision detection

## 🎮 Tips & Tricks

1. **Ammo Management**: Conserve ammo for the boss - keep distance and use precise shots
2. **Boss Strategy**: The boss is tough! Use the rifle's precision and reload between waves
3. **Weapon Choice**: Use shotgun for tight spaces, rifle for open areas
4. **Enemy Spawning**: You'll get ammo resupply every 30 seconds to stay in combat

## 📄 License

This project is free to use and modify. Have fun!

---

**Created with ❤️ by Vibe Coding**

*A retro FPS experience for the browser*
