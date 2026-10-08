# Security notes

The game has no accounts, server, analytics or remote content. Player names are HTML-escaped. The Electron renderer is sandboxed with context isolation and no Node integration; new windows and navigation are blocked. Options alone are stored locally.

The production web bundle has no third-party runtime packages. At initial delivery, npm audit --omit=dev reports zero vulnerabilities. The packaging toolchain has a moderate transitive sprintf-js denial-of-service advisory (GHSA-hp3w-g68c-fv3c), via electron-builder's build-time logging chain. It is not shipped in the browser game and does not process player input. Current upstream sprintf-js has no patched release; retain the current maintained builder rather than blindly downgrade it. Re-evaluate tooling advisories before future releases.

Windows releases are unsigned; checksums support integrity comparison but are not a substitute for a signing certificate. No claim of vendor certification is made.
