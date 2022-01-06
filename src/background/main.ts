import { onMessage, sendMessage } from 'webext-bridge'
import { Bookmarks, History, Tabs } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

const faviconUrl = (url: string) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`

const convertToSearchItemsFromHistories = (histories: History.HistoryItem[]): SearchItem[] => {
  return histories.map(history => ({
    url: history.url!,
    title: history.title!,
    faviconUrl: faviconUrl(history.url!),
    type: 'history',
  }))
}

const convertToSearchItemsFromBookmarks = (bookmarkTreeNodes: Bookmarks.BookmarkTreeNode[]): SearchItem[] => {
  // FIXME: want to rewrites it into a clean recursive function that doesn't use side effects.
  const result: SearchItem[] = []
  const getTitleAndUrl = (bookmarkTreeNodes: Bookmarks.BookmarkTreeNode[]) => {
    bookmarkTreeNodes.forEach((node) => {
      if (node.children) {
        getTitleAndUrl(node.children)
        return
      }

      result.push({
        url: node.url!,
        title: node.title,
        faviconUrl: faviconUrl(node.url!),
        type: 'bookmark',
      })
    })
  }
  getTitleAndUrl(bookmarkTreeNodes)
  return result
}

const convertToSearchItemsFromTabs = (tabs: Tabs.Tab[]): SearchItem[] => {
  return tabs.map(tab => ({
    url: tab.url!,
    title: tab.title!,
    faviconUrl: faviconUrl(tab.url!),
    type: 'tab',
    tabId: tab.id,
  }))
}

const removeDeprecatedItem = (searchItems: SearchItem[]) => {
  return Array.from(
    searchItems
      .reduce(
        (map, currentItem) =>
          // Remove duplicates in url with Anchors link removed
          map.set(currentItem.url.split('#')[0]!, currentItem),
        new Map<string, SearchItem>(),
      )
      .values(),
  )
}

browser.commands.onCommand.addListener(async() => {
  const tabs = await browser.tabs.query({})
  const bookmarks = await browser.bookmarks.getTree()
  const histories = await browser.history.search({
    text: '',
    maxResults: 10000,
    // Search up to 30 days in advance.
    startTime: new Date().setDate(new Date().getDate() - 30),
  })
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  await sendMessage(
    'history-search',
    {
      result: JSON.stringify(removeDeprecatedItem([
        ...convertToSearchItemsFromHistories(histories),
        ...convertToSearchItemsFromBookmarks(bookmarks),
        ...convertToSearchItemsFromTabs(tabs),
      ])),
    },
    {
      context: 'content-script',
      tabId: tab.id!,
    },
  )
})

onMessage('change-current-tab', async(request) => {
  const tab = await browser.tabs.get(request.data.tabId)
  await browser.tabs.update(request.data.tabId, { active: true })
  await browser.windows.update(tab.windowId!, { focused: true })
})
