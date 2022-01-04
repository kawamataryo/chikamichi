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

const getSearchItemsFromHistories = (histories: History.HistoryItem[]) => {
  // remove duplicates
  return Array.from(
    histories
      .reduce(
        (map, currentItem) => map.set(currentItem.title!, {
          url: currentItem.url!,
          title: currentItem.title!,
          faviconUrl: faviconUrl(currentItem.url!),
          type: 'history',
        }),
        new Map<string, SearchItem>(),
      )
      .values(),
  )
}

// FIXME: want to rewrite it into a clean recursive function that doesn't use side effects.
const getSearchItemsFromBookmarks = (bookmarkTreeNodes: Bookmarks.BookmarkTreeNode[]) => {
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

const getSearchItemsFromTabs = (tabs: Tabs.Tab[]) => {
  return tabs.map(tab => ({
    url: tab.url,
    title: tab.title,
    faviconUrl: faviconUrl(tab.url!),
    type: 'tab',
    tabId: tab.id,
  }))
}

browser.commands.onCommand.addListener(async() => {
  const tabs = await browser.tabs.query({})
  const bookmarks = await browser.bookmarks.getTree()
  const histories = await browser.history.search({
    text: '',
    maxResults: 10000,
  })
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  await sendMessage(
    'history-search',
    {
      result: JSON.stringify([
        ...getSearchItemsFromTabs(tabs),
        ...getSearchItemsFromBookmarks(bookmarks),
        ...getSearchItemsFromHistories(histories),
      ]),
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
