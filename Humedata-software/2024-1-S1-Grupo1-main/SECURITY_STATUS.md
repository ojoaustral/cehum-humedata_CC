# Security status

This project is no longer running anywhere. The dependency tree has been frozen since completion and pakages updates are due, which is why GitHub flags a large number of advisories here (see the Security and Quality tab on GitHub).

**Root cause:** stale dependencies, mainly `next@14.2.3`, pinned since 2024 and never bumped — accounting for the majority of the alerts, with the rest spread across transitive build-tooling packages (React Native CLI, Turbo, etc.) that drifted the same way.

**Action taken (2026-10-05):** all open Dependabot alerts for this folder were bulk-dismissed as tolerable risk, since there is no live deployment for any of this to be exploited on.

**Remaining work:** if this code is ever reused or redeployed, the dependency tree needs a full update pass first (`pnpm update` at minimum, likely with manual bumps for `next` and anything with a breaking major version) before it should go live again.

CC, 2026-10-05.