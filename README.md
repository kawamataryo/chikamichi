<img width="100" src="https://user-images.githubusercontent.com/11070996/147922657-3c079672-edbd-4993-a645-f71a2739b18c.png#gh-dark-mode-only"/>
<img width="100" src="https://user-images.githubusercontent.com/11070996/147922660-890e2d96-26ee-4358-afc4-8421e9a05d5d.png#gh-light-mode-only"/>

<a href="https://chrome.google.com/webstore/detail/chikamichi-quickly-find-a/gkhobepjbiepngbeikhbpnfgjcjgmgha"><img alt="Chrome web store version" src="https://img.shields.io/chrome-web-store/v/gkhobepjbiepngbeikhbpnfgjcjgmgha.svg"></a>
<a href="https://chrome.google.com/webstore/detail/chikamichi-quickly-find-a/gkhobepjbiepngbeikhbpnfgjcjgmgha"><img alt="Chrome web store rating" src="https://img.shields.io/chrome-web-store/stars/gkhobepjbiepngbeikhbpnfgjcjgmgha.svg"></a>
<a href="https://chrome.google.com/webstore/detail/chikamichi-quickly-find-a/gkhobepjbiepngbeikhbpnfgjcjgmgha"><img alt="Chrome Web Store users" src="https://img.shields.io/chrome-web-store/users/gkhobepjbiepngbeikhbpnfgjcjgmgha"></a>
[![CI:UT](https://github.com/kawamataryo/chikamichi/actions/workflows/cypress-test.yaml/badge.svg)](https://github.com/kawamataryo/chikamcichi/actions/workflows/cypress-test.yaml)
[![CI:E2E](https://github.com/kawamataryo/chikamichi/actions/workflows/test.yaml/badge.svg)](https://github.com/kawamataryo/chikamcichi/actions/workflows/test.yaml)

# Chikamichi - Quickly find a page

Chikamichi is an extension that makes it very easy to navigate pages in Chrome or Firefox. You can search and navigate across browser history, bookmarks, and tabs.
Simple shortcuts and a simple interface make it easy to use.  

Inspired by [Sidekick](https://www.meetsidekick.com/) search dialog.  
The Japanese meaning of `chikamichi` is a shorter way.
  
<a href="https://www.producthunt.com/posts/chikamichi?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-chikamichi" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=328833&theme=light" alt="Chikamichi - Chrome extension that enables fuzzy search for anything | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
## ✨ Features

- ⚡️ Fuzzy search your browsing history and bookmark and tab. powered by [Fuse.js](https://fusejs.io/)
- 🔐 All processing is done within the browser. No history data will be sent to the any server.

## 🎬 Demo

https://user-images.githubusercontent.com/11070996/151462764-4c196ea8-e5d0-4190-be9b-e5d79bf454ab.mp4

## 📦 Install

Please install from:
- [Firefox Add-Ons Repository (AMO)](https://addons.mozilla.org/firefox/addon/chikamichi/)
- [Chrome Web Store](https://chrome.google.com/webstore/detail/chikamichi/gkhobepjbiepngbeikhbpnfgjcjgmgha)

## 💻 Usage

### Shortcuts

| shortcut                              | action                                   |
|---------------------------------------|------------------------------------------|
| `Alt + k`                             | Open search dialog                       |
| `↓` or `↑` (`Ctrl + n` or `Ctrl + p`) | Select history                           |
| `Enter`                               | Open the selected url            |
| `Ctrl + Enter`                        | Open the selected url in new tab |
| `Ctrl + f`                            | Add favorite |

### Search commands

| commands | action                |
|----------|-----------------------|
| `/h`     | Search only histories |
| `/b`     | Search only bookmarks |
| `/t`     | Search only tabs      |

### Favorite
Items with a star to the right of the search item are registered as favorites. Items registered as favorites will be displayed in the initial view. However, if a search prefix has been set, the search prefix will take precedence.

## 👨‍💻 Contributing
Contributions are welcome 🎉 We accept contributions via Pull Requests.

## 💕 Thanks
This extension uses the following library.

* [Viteese-webext](https://github.com/antfu/vitesse-webext)
* [Fuse.js](https://fusejs.io/)
