# ScorchedEveritt

**[Play in your browser](https://ericargyle.github.io/ScorchedEveritt/) · [Windows 11 download](https://github.com/ericargyle/ScorchedEveritt/releases/latest)**

A mobile-first, local two-player artillery duel: angle, power, gravity, wind, craters, upgrades and a little college nostalgia.

## The original team — UIUC ECE291, Spring 2001

- **Suneil Hosmane** — Game Engine, Physics, I/O Control
- **Terrence Janas** — Graphics, Multimedia Design, Webmaster
- **Yajur Parikh** — Physics, Intro

Their surviving Scorched Everitt design document is the foundation of this recreation. Original inspiration: _Scorched Earth_, by Wendell Hicken. No Scorched Earth code or assets were copied. Legacy timer/delay routines were credited to **Edwin Daniels**; the random-number routine to the ECE291 Spring 2001 class. Those historical routines are acknowledged, not claimed as part of this JavaScript implementation.

Modern recreation built with OpenClaw for Eric Argyle. Original team credits appear prominently in the main menu and full Credits screen.

## Provenance and specification decisions

The PDF is the only surviving source supplied. It includes assembly-like control-flow pseudocode and function contracts, not a complete compilable source tree or original artwork. This is an independently implemented **specification-based recreation**, not an emulation, exact visual restoration, or verified port of the original binary. The source PDF is not redistributed.

The original menu flow, player setup, option defaults, projectile collision, round scoring and upgrade concepts are preserved. Ten procedurally generated terrain profiles replace missing land.png. Original procedural vector artwork and Web Audio synthesis replace missing graphics/audio. The optional intro uses a short newly synthesized public-domain _Battle Hymn of the Republic_ motif.

Explicit resolutions of underspecified behavior:

- Two humans alternate shots on one device; there is no AI or online networking. Networking was an optional historical aspiration, not implemented in the supplied specification.
- Score is **max(0, 1600 − the winning player's failed shots in that round)**, following the prose “failed attempts” rather than counting the successful turn. Self-hit awards the other player; simultaneous destruction awards the non-shooter.
- Upgrade whenever cumulative score crosses a multiple of 1500 (not only exact equality). Blast radius = 30 + 7 × level world units.
- Match winner: rounds won, then points as a tiebreaker. Odd round counts prevent normal wins ties.
- Angles are relative to each tank's inward facing direction (5–175°), power 10–100%. Movement is unrestricted during aiming and does not consume a turn; tank overlap and leaving the field are prevented.
- Terrain deforms under blasts and tanks settle onto the new surface. Chassis choices are cosmetic and balanced.
- Wind is constant within a round, randomized between rounds. Ten maps cycle between rounds.
- Defaults: sound OFF, wind OFF, five rounds, midnight sky. Rounds: 1/3/5/7/9. Options persist locally when browser storage is available.
- Web Exit displays a safe-to-close screen; it cannot close arbitrary browser tabs. Close the desktop window to exit Windows.

## Play

Choose **Start a duel**, choose each player's callsign and chassis, and deploy. Use sliders to aim and set power. Move with the arrow buttons. Fire; then pass the device. Aim toward your opponent, account for elevation and optional wind, and avoid your own blast. An indicator labels each tank; colors aren't the only identity cue.

Keyboard: left/right = move, up/down = angle, +/− = power, Enter = fire, Esc = pause. When a form control has focus, normal accessible keyboard behavior takes priority (e.g. arrows adjust a slider; Enter activates a button). Pause offers help and a confirmed abandon action. The game pauses when a modal is open or the document is hidden.

Touch controls work in portrait and landscape. No external assets, fonts, tracking, accounts, or paid services are required. Enable sound with the top-right button or Options; browsers require user interaction before audio playback.

## Windows 11

Download **ScorchedEveritt-Windows-11-x64.exe** from Releases and run it. It is a portable x64 Electron application, usable offline after download. No installation or administrator access is required. This is an **unsigned community build**: Windows may show a SmartScreen warning. A SHA256 checksum is included in the release. Windows ARM machines may use Windows' x64 emulation; native ARM packaging is not provided.

The Windows runner builds the actual executable. Native Windows interactive play testing requires a Windows machine; CI packaging alone is not a claim of native runtime QA.

## Develop / reuse

Requires Node 22.12+ and npm.

```sh
npm ci
npm test
npm run dev
npm run build
npm run desktop  # after build
npm run dist:win # preferably on Windows
```

- src/engine.js — DOM-free simulation, deterministic terrain, injectable wind, fixed-step physics, score state; reusable independently of the renderer.
- src/app.js — menus, accessible DOM controls, rendering, audio, persistence. No runtime framework dependencies.
- desktop/main.cjs — isolated/sandboxed Electron wrapper; no Node access in renderer or remote navigation.
- test/engine.test.js — deterministic gameplay regression tests.
- .github/workflows/publish.yml — tests, GitHub Pages deployment and tag-triggered Windows packaging/release.

Existing-tooling preflight: native Canvas/Web Audio adequately cover this small game without a heavyweight engine; maintained Vite handles web builds and Electron/electron-builder handle Windows packaging. A custom game was explicitly requested, so the gameplay is original code on standard maintained tooling. No hosted backend required.

## Scope / limitations

Local pass-and-play only; no online multiplayer, AI, saved matches or exact legacy pixel art. No external commercial assets or signing certificate. Modern implementation licensing is intentionally not asserted over the historical team's document or designs; contact the repository owner for reuse permission and attribution requirements.
