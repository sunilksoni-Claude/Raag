# Raaag PWA — Session Memory

## What Was Built
A fully working standalone PWA music player (single HTML file, no build step) optimised for iPhone Safari. Started as a broken React/Vite app, now a polished app with professional design.

## Live URL
**https://sunilksoni-claude.github.io/Raag/**
Repo: `https://github.com/sunilksoni-Claude/Raag.git`
GitHub user: `sunilksoni-Claude` (capital C)

## Current Version
**Service Worker: raaag-v33** | **~162KB** | Last stable commit: `3215457`

## File Locations
| File | Purpose |
|------|---------|
| `pwa/index.html` | The entire app — self-contained source of truth |
| `index.html` | Repo root — what GitHub Pages actually serves (keep in sync!) |
| `pwa/manifest.json` | PWA manifest |
| `pwa/sw.js` | Service worker (bump version on every push) |
| `pwa/icons/Raag 1.png` | Source icon |
| `pwa/icons/icon-192.png` | PWA icon 192px |
| `pwa/icons/icon-512.png` | PWA icon 512px |
| `pwa/icons/apple-touch-icon.png` | iPhone home screen icon 180px |

## CRITICAL: Two index.html files
The repo has TWO locations that must BOTH be updated on every push:
- `pwa/index.html` — source of truth (edit here)
- `index.html` (repo root) — what GitHub Pages actually serves

**Always copy pwa/index.html → root index.html before pushing, and pwa/icons/ → root icons/ too.**

## App Architecture
- **Pure vanilla JS** — no framework, no build step
- **IndexedDB** stores audio as ArrayBuffer (iOS Safari compatible)
- **localStorage** stores library index, playlists, favorites, settings, EQ gains, theme
- **Audio**: HTML5 `<audio playsinline>` element, blob URLs from IndexedDB
- **Icon** embedded as base64 `const ICON='data:image/png;base64,...'`
- **EQ**: Web Audio API (lazy init — see critical note below)
- **Font**: Outfit (Google Fonts)

## UI Design (Final)
- **Theme**: Glassmorphism — warm peach-to-lavender gradient background, frosted glass cards (`backdrop-filter: blur`), saffron orange `#ff6f00` accent
- **Dark mode**: full dark glass theme, toggle in Settings → Appearance
- **Home screen**: 3-column grid of 45px text-only artist cards, ↻ Refresh + Clear buttons
- **Artist screen**: compact single-row header (40px avatar, name, Play, Shuffle)
- **Album screen**: Spotify-style blurred hero, large cover art, Play/Shuffle, numbered tracks
- **Now Playing**: blurred album art background, 145px art with breathing animation, glowing progress bar, transport controls, volume, EQ preset picker + 10 band sliders
- **Mini player**: frosted glass bar, progress strip, play/next
- **Transitions**: slide-in from right on navigate, no scrollbars visible

## Features
- Dark/light mode toggle (persists)
- Slide screen transitions
- Glowing music-bar loader during import
- Breathing album art animation (pulses while playing)
- Glowing saffron progress bar
- Ambient background colour extracted from album art on now-playing
- 10-band EQ with preset scroll picker (Flat/Bass/Treble/Rock/Classical/Vocal/Jazz/Pop/Electronic/Hip-Hop)
- EQ preset scroll picker (vertical, single item visible, 40px)
- ↻ Refresh button to re-import folder and merge new songs

## CRITICAL: EQ + Background Audio (iOS)
**Problem**: Web Audio API (`createMediaElementSource`) routes audio through an `AudioContext`. iOS suspends AudioContexts in background → audio stops on lock screen.

**Solution implemented (v33)**: EQ AudioContext is initialised LAZILY — only when user actually interacts with EQ (scrolls preset picker or drags a band slider). Default playback uses native `<audio>` with no AudioContext → full background/lock screen support.

**Rule**: Never call `EQ.init()` in `doPlay()` or on page load. Only call it in EQ interaction handlers.

**Trade-off**: If user activates EQ then locks screen, audio may stop (iOS limitation). Music plays in background fine as long as EQ is not activated.

## Screens
`library` → `artist` → `album` → `now-playing` / `queue` / `favorites` / `settings`

## Music Import Flow
1. Tap + or ↻ Refresh → iOS: `webkitdirectory` picker / Desktop: `showDirectoryPicker()`
2. Walk directory tree, collect audio files (mp3/m4a/aac/flac/ogg/wav)
3. Read ID3 tags via `jsmediatags` CDN (fallback: parse filename)
4. Save each file as ArrayBuffer to IndexedDB + metadata separately
5. Build library index (songs/albums/artists) → save to localStorage
6. Merge with existing library on re-import (doesn't clear old songs)

## Key Technical Rules
1. **iOS IndexedDB** — store `ArrayBuffer` not `Blob`
2. **File writing** — always strip null bytes with `.rstrip(b'\x00')`; write via `/tmp/` then copy to mounted path
3. **SW version** — bump `raaag-vN` in `pwa/sw.js` on every push (copy to root `sw.js` too)
4. **Unknown Album** — filtered from discography; songs shown in flat "Songs" section
5. **EQ lazy init** — see critical note above
6. **Syntax check** — always run `node --check` on extracted JS before pushing

## Push Instructions (nex