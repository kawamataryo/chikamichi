---
layout: home

hero:
  name: Chikamichi
  text: Quickly find a page.
  tagline: A modern browser command palette for jumping across history, bookmarks, tabs, and current-page actions without breaking flow.
  image:
    src: /screenshots/popup-search.png
    alt: Chikamichi popup search results
  actions:
    - theme: brand
      text: Install for Chrome
      link: https://chrome.google.com/webstore/detail/chikamichi/gkhobepjbiepngbeikhbpnfgjcjgmgha
    - theme: alt
      text: Read the guide
      link: /guide/getting-started
    - theme: alt
      text: GitHub
      link: https://github.com/kawamataryo/chikamichi

features:
  - title: Search everything
    details: Fuzzy-search browser history, bookmarks, and open tabs from one fast popup.
  - title: Act on the current page
    details: Type > to copy titles, URLs, Markdown links, capture screenshots, pin, mute, or duplicate the tab.
  - title: Private by design
    details: Search happens inside the browser. History data is not sent to any server.
  - title: Keyboard-first
    details: Open with Alt+K, move with arrow keys or Ctrl+N/Ctrl+P, and launch with Enter.
  - title: Favorite pages
    details: Pin frequently used results and reorder them so the initial view works like a personal launcher.
  - title: Modern extension stack
    details: Built with Plasmo, React, Fuse.js, local storage, and Playwright coverage.
---

<div class="hero-panel">
  <input value="docs vitepress" aria-label="Search example" readonly />
  <div class="result-row">
    <strong>Chikamichi documentation</strong>
    <span>history</span>
  </div>
  <div class="result-row">
    <strong>GitHub - kawamataryo/chikamichi</strong>
    <span>bookmark</span>
  </div>
  <div class="result-row">
    <strong>Current tab actions</strong>
    <span>type &gt;</span>
  </div>
</div>

## Built for fast browser movement

Chikamichi keeps navigation close to your keyboard. Search across the places your browser already knows about, open the right result in the current tab or a new tab, and keep favorite destinations one shortcut away.

![Chikamichi popup search results](/screenshots/popup-search.png)

<div class="command-grid">
  <div class="command-card"><strong>Open</strong><code>Alt + K</code></div>
  <div class="command-card"><strong>History</strong><code>/h</code></div>
  <div class="command-card"><strong>Bookmarks</strong><code>/b</code></div>
  <div class="command-card"><strong>Tabs</strong><code>/t</code></div>
  <div class="command-card"><strong>Actions</strong><code>&gt;</code></div>
  <div class="command-card"><strong>Favorite</strong><code>Ctrl + F</code></div>
</div>

## Install

- [Chrome Web Store](https://chrome.google.com/webstore/detail/chikamichi/gkhobepjbiepngbeikhbpnfgjcjgmgha)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/chikamichi/)
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/chikamichi-quickly-find/kgbibnihcjkbcjbngneigamkphnoipli)

## Documentation commands

```bash
pnpm docs:dev
pnpm docs:build
pnpm docs:preview
```

Use `pnpm docs:dev` while editing this site. Use `pnpm docs:build` before publishing changes.
