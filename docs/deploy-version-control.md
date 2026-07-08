# Deploy Version Control

## 2026-07-08 Regression Cause

The footer change was deployed from a dirty working copy instead of a clean latest checkout.
At the time of the audit, the previous working copy had 455 modified entries and 454 changed files.
Deploying with `--commit-dirty=true` allowed unrelated and stale generated HTML to be published together with the intended footer change.

The visible header regression came from generated HTML that still contained:

```html
<a class="header-random-encounter" href="/?random=1">...</a>
```

The shared footer script also injected the random encounter label into `.header-links`, so pages with the old direct link displayed the header item twice.

## Required Rule

Do not deploy from an existing dirty work folder.

Before production deployment:

1. Fetch the latest `origin/main`.
2. Apply the requested change on a clean checkout.
3. Commit and push the exact deployed change.
4. Run `node tools/predeploy-check.mjs`.
5. Deploy only after the check passes.

`--commit-dirty=true` must not be used for normal production deployment.
