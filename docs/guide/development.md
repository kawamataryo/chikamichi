# Development

Use this page when working on Chikamichi or this documentation site locally.

## Requirements

- Node.js compatible with the repository toolchain
- pnpm `11.1.2`
- Chrome, Firefox, or Edge for extension testing

## Extension startup

```bash
pnpm i
pnpm dev
```

`pnpm dev` starts the Plasmo development build and syncs `_locales` into the build output. Load `build/chrome-mv3-dev` from `chrome://extensions` with Developer mode enabled.

Use `pnpm dev` instead of invoking `plasmo dev` directly.

## Documentation startup

```bash
pnpm docs:dev
```

The docs site runs with VitePress. By default, VitePress prints the local URL in the terminal.

## Production builds

| Command             | Output                                |
| ------------------- | ------------------------------------- |
| `pnpm build`        | Production extension build            |
| `pnpm zip:prod`     | Zipped Chrome production extension    |
| `pnpm package`      | Plasmo package output                 |
| `pnpm docs:build`   | Static documentation site             |
| `pnpm docs:preview` | Local preview for the built docs site |

## Checks

```bash
pnpm format:check
pnpm lint:check
pnpm test:ci
pnpm check
pnpm e2e:run
```

`pnpm check` runs the standard release-facing verification: format check, lint check, unit tests, and production build.

## Local extension settings to verify

When testing the popup manually, verify these settings:

| Setting               | Values                   |
| --------------------- | ------------------------ |
| Default Search Prefix | `none`, `/h`, `/b`, `/t` |
| Theme                 | `auto`, `light`, `dark`  |
| Open Link Action      | current tab or new tab   |

Also verify the key flows:

- `Alt + K` opens the popup.
- Search returns histories, bookmarks, and tabs.
- `/h`, `/b`, and `/t` narrow the search target.
- `>` opens Action Mode.
- `Ctrl + F` toggles a favorite.
- `Ctrl + C` copies the selected URL.

![Chikamichi popup settings](/screenshots/popup-settings.png)
