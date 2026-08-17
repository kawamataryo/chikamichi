<img width="100" src="./src/images/logo.svg" alt="Chikamichi logo"/>

# Chikamichi - Quickly find a page

<a href="https://chrome.google.com/webstore/detail/chikamichi-quickly-find-a/gkhobepjbiepngbeikhbpnfgjcjgmgha"><img alt="Chrome web store version" src="https://img.shields.io/chrome-web-store/v/gkhobepjbiepngbeikhbpnfgjcjgmgha.svg"></a>
<a href="https://chrome.google.com/webstore/detail/chikamichi-quickly-find-a/gkhobepjbiepngbeikhbpnfgjcjgmgha"><img alt="Chrome web store rating" src="https://img.shields.io/chrome-web-store/stars/gkhobepjbiepngbeikhbpnfgjcjgmgha.svg"></a>
<a href="https://chrome.google.com/webstore/detail/chikamichi-quickly-find-a/gkhobepjbiepngbeikhbpnfgjcjgmgha"><img alt="Chrome Web Store users" src="https://img.shields.io/chrome-web-store/users/gkhobepjbiepngbeikhbpnfgjcjgmgha"></a>
[![CI:UT](https://github.com/kawamataryo/chikamichi/actions/workflows/test.yaml/badge.svg)](https://github.com/kawamataryo/chikamichi/actions/workflows/test.yaml)
[![CI:E2E](https://github.com/kawamataryo/chikamichi/actions/workflows/playwright-test.yaml/badge.svg)](https://github.com/kawamataryo/chikamichi/actions/workflows/playwright-test.yaml)

<a href="https://www.producthunt.com/posts/chikamichi?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-chikamichi" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=328833&theme=light" alt="Chikamichi - Chrome extension that enables fuzzy search for anything | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Chikamichi is an extension that makes navigating pages in Chrome or Firefox very easy. You can search and navigate across your browser history, bookmarks and tabs. Simple shortcuts and a simple interface make it easy to use.

Inspired by the [Sidekick](https://www.meetsidekick.com/) search dialogue.
The Japanese meaning of chikamichi is shorter way.

## ✨ Features

- ⚡️ Fuzzy search your browsing history and bookmark and tab. powered by [Fuse.js](https://fusejs.io/)
- 🔐 All processing is done within the browser. No history data will be sent to the any server.

## 🎬 Demo

https://user-images.githubusercontent.com/11070996/151462764-4c196ea8-e5d0-4190-be9b-e5d79bf454ab.mp4

## 📦 Install

Please install from:

- [Chrome Web Store](https://chrome.google.com/webstore/detail/chikamichi/gkhobepjbiepngbeikhbpnfgjcjgmgha)
- [Firefox Add-Ons Repository (AMO)](https://addons.mozilla.org/firefox/addon/chikamichi/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/chikamichi-quickly-find/kgbibnihcjkbcjbngneigamkphnoipli)

## 💻 Usage

### Shortcuts

| shortcut                              | action                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `Alt + k`                             | Open search dialog                                                      |
| `↓` or `↑` (`Ctrl + n` or `Ctrl + p`) | Move selection                                                          |
| `Enter`                               | Open the selected URL                                                   |
| `Ctrl + Enter`                        | Open the selected URL with the alternative open behavior                |
| `Ctrl + f`                            | Pin or unpin the selected item in Chikamichi                            |
| `Ctrl + c`                            | Copy the selected URL to the clipboard                                  |
| `Ctrl + d`                            | Delete the selected history, remove bookmark, or close tab by item type |
| `Ctrl + Shift + N`                    | Move the selected pinned item down (when search input is empty)         |
| `Ctrl + Shift + P`                    | Move the selected pinned item up (when search input is empty)           |

### Search commands

| commands | action                |
| -------- | --------------------- |
| `/h`     | Search only histories |
| `/b`     | Search only bookmarks |
| `/t`     | Search only tabs      |

### Action Mode

Type `>` in the search input to switch into Action Mode for the current page.

- `Copy Title`
- `Copy URL`
- `Copy Markdown Link`
- `Pin/Unpin Current Page`
- `Mute/Unmute Tab`
- `Pin/Unpin Tab`
- `Duplicate Tab`
- `Capture Visible Area`
- `Copy Visible Area to Clipboard`
- `Capture Full Page`
- `Copy Full Page to Clipboard`

### Help

Open Help from the sidebar to see a command-style reference for search, navigation, and actions.

### Favorite

Items with a star to the right of the search item are registered as favorites. Items registered as favorites will be displayed in the initial view. However, if a search prefix has been set, the search prefix will take precedence.

### Reordering Favorites

When the search input is empty and you have two or more pinned items, a drag handle (⠿) appears to the left of each favorite. You can change the display order in two ways:

- **Drag and drop** — grab the handle on the left side of any pinned item and drop it onto another item to swap positions.
- **Keyboard** — select a pinned item with `↑` / `↓`, then press `Ctrl + Shift + N` to move it down or `Ctrl + Shift + P` to move it up.

The new order is saved automatically and persists across sessions.

## 👨‍💻 Contributing

Contributions are welcome 🎉 We accept contributions via Pull Requests.

See [this guide](https://github.com/kawamataryo/chikamichi/blob/main/CONTRIBUTING.md) on how to make a contribution.

## 💕 Thanks

This extension uses the following library.

- [Fuse.js](https://fusejs.io/)
