# Getting Started

Chikamichi is a browser extension that makes it quick to search and move between browser history, bookmarks, and tabs.

## Install

Install Chikamichi from the extension store for your browser:

- [Chrome Web Store](https://chrome.google.com/webstore/detail/chikamichi/gkhobepjbiepngbeikhbpnfgjcjgmgha)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/chikamichi/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/chikamichi-quickly-find/kgbibnihcjkbcjbngneigamkphnoipli)

## Open the popup

Press `Alt + K` to open Chikamichi.

Start typing to search history, bookmarks, and open tabs. Use the arrow keys, `Ctrl + N`, or `Ctrl + P` to move selection, then press `Enter` to open the selected item.

## Core flow

1. Open Chikamichi with `Alt + K`.
2. Type part of a title, URL, or keyword.
3. Move to the best result.
4. Press `Enter` to open it, or `Ctrl + Enter` to use the alternative open action.

![Chikamichi popup search results](/screenshots/popup-search.png)

## What Chikamichi can search

- Browser history
- Bookmarks
- Open tabs
- Browser search fallback for typed queries

The search is powered by [Fuse.js](https://fusejs.io/) and runs locally in the browser.

## Local development commands

Use these commands when working on Chikamichi locally:

| Command             | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `pnpm i`            | Install dependencies                                |
| `pnpm dev`          | Start the extension development build               |
| `pnpm build`        | Build the extension for production                  |
| `pnpm check`        | Run format check, lint check, unit tests, and build |
| `pnpm test:ci`      | Run unit tests                                      |
| `pnpm e2e:run`      | Run Playwright e2e tests                            |
| `pnpm docs:dev`     | Start this documentation site                       |
| `pnpm docs:build`   | Build this documentation site                       |
| `pnpm docs:preview` | Preview the built documentation site                |

When `pnpm dev` is running, load `build/chrome-mv3-dev` from `chrome://extensions` with Developer mode enabled.
