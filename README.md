# Logitech G Hub Style Linux Game Launcher 🎮

A high-performance, visually immersive desktop game launcher built with Electron for Linux Mint. Designed with the premium, dark-mode neon aesthetic of Logitech G Hub, this launcher provides an ultra-low overhead hub for tracking, organizing, and launching both native Linux games and Wine/Proton emulated Windows titles.

## ✨ Features Implemented
* **Zero-Overhead Performance HUD:** Real-time sidebar diagnostic tracker monitoring desktop CPU load and RAM usage utilizing native system queries.
* **In-Game FPS & Temperature Overlay:** Single-toggle settings switch to automatically execute games wrapped in `MangoHud` for real-time frame rates, CPU/GPU temperatures, and VRAM monitoring.
* **Automated Playtime Analytics:** Background monitoring loops log session lengths, track total aggregate play hours, and track the exact date a title was last played.
* **Smart Scan & Artwork Fetching:** Automated one-click scanner maps internal directory structures and seamlessly fetches missing game banners directly from the SteamGridDB API.
* **Fluid Drag-and-Drop Sorting:** Grid engine equipped with full mouse sorting capabilities that automatically scale to maintain layout integrity during window resizes.

## 🛠️ Technical Stack
* **Runtime:** Electron (Node.js + Chromium)
* **Styling:** Vanilla CSS3 with accelerated WebGL layer filters
* **System Integrations:** Native Linux binaries (`ps`, `top`, `free`, `mangohud`)

## 🚀 Installation & Local Development

install the .deb or download the .exe
it should work and if it dosen't just report it so that i can fix it,
i made this in a day so don't be surprised if it has some bugs, but from my testing it does work well
anyways, i hope you enjoy your new game launcher
