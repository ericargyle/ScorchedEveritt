# Verification record

2026-10-08:
- 13 deterministic engine tests passing: option defaults, ten terrain profiles, movement bounds, gravity, wind, double-fire guard, hits/self-hit/simultaneous blast, misses, craters, upgrade thresholds, full five-round scoring, projectile termination, nonnegative score.
- Vite production build passing; game JS ~12.5 KB before gzip, CSS ~5 KB. Zero production npm audit advisories.
- Playwright Chromium mobile-emulation smoke test passed against the actual GitHub Pages URL: credits, names/chassis setup, options persistence, movement, shot, result/handoff, pause/resume, no JS page errors. No horizontal overflow at 390×844, 844×390 and 1280×900.
- Mobile and desktop screenshots visually inspected. Touch-sized controls, names/scoreboard and battlefield visible.
- GitHub Pages HTTPS endpoint returned HTTP 200.
- Windows x64 portable executable built by Windows GitHub Actions. Release and checksum are the authoritative binary artifacts; no native Windows interactive gameplay testing performed on the Mac development host.

Reproduce browser smoke test with a local dev server running: npm run test:browser. Or set TEST_URL=https://ericargyle.github.io/ScorchedEveritt/ . Install the test browser first with npx playwright install chromium. Automated touch emulation does not replace physical iOS/Android device testing.

Known intentional historical differences are listed in README. The intro music is a short Battle Hymn motif rather than an exact seven-measure archival arrangement, and original raster artwork/implementation was not available.
