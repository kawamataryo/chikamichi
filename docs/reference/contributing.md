# Contributing

Contributions are welcome through pull requests.

## Accepted issues

- Questions about features
- Error or problem reports
- Feature additions or improvements

Open an issue from the [GitHub issue form](https://github.com/kawamataryo/chikamichi/issues/new).

## Pull requests

The project accepts pull requests for:

- Bug fixes
- New functionality
- Performance improvements
- Typo fixes

Keep one pull request focused on one feature or fix. Add tests for behavior changes and update documentation when user-facing behavior changes.

## Local development

```bash
pnpm i
pnpm dev
```

The development build is written to `build/chrome-mv3-dev`. Load that directory from `chrome://extensions` with Developer mode enabled.

Use `pnpm dev` instead of invoking `plasmo dev` directly. It also syncs `_locales` into the Plasmo build output.

## Checks

```bash
pnpm test:ci
pnpm check
pnpm e2e:run
```

`pnpm check` runs format check, lint check, unit tests, and production build.
