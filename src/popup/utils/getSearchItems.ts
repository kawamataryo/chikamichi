import { Bookmarks, History, Tabs } from 'webextension-polyfill'
import { SEARCH_ITEM_TYPE } from '~/constants'

const faviconUrl = (url: string) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`

const convertToSearchItemsFromHistories = (histories: History.HistoryItem[]): SearchItem[] => {
  return histories.map(history => ({
    url: history.url!,
    title: history.title!,
    faviconUrl: faviconUrl(history.url!),
    type: SEARCH_ITEM_TYPE.HISTORY,
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
        type: SEARCH_ITEM_TYPE.BOOKMARK,
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
    type: SEARCH_ITEM_TYPE.TAB,
    tabId: tab.id,
  }))
}

const removeDeprecatedItem = (searchItems: SearchItem[]) => {
  return Array.from(
    searchItems
      .reduce(
        (map, currentItem) =>
          map.set(currentItem.url, currentItem),
        new Map<string, SearchItem>(),
      )
      .values(),
  )
}

export const getSearchItems = async() => {
  const tabs = await browser.tabs.query({})
  const bookmarks = await browser.bookmarks.getTree()
  const histories = await browser.history.search({
    text: '',
    maxResults: 10000,
    // Search up to 30 days in advance.
    startTime: new Date().setDate(new Date().getDate() - 30),
  })

  return removeDeprecatedItem([
    ...convertToSearchItemsFromHistories(histories),
    ...convertToSearchItemsFromBookmarks(bookmarks),
    ...convertToSearchItemsFromTabs(tabs),
  ])
}
