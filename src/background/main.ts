import { sendMessage } from 'webext-bridge'
import { Bookmarks, History } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

const getSearchItemsFromHistories = (histories: History.HistoryItem[]) => {
  // remove duplicates
  return Array.from(
    histories
      .reduce(
        (map, currentItem) => map.set(currentItem.title!, {
          url: currentItem.url!,
          title: currentItem.title!,
          hostname: new URL(currentItem.url!).hostname,
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
        hostname: new URL(node.url!).hostname,
        type: 'bookmark',
      })
    })
  }
  getTitleAndUrl(bookmarkTreeNodes)
  return result
}

browser.commands.onCommand.addListener(async() => {
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
