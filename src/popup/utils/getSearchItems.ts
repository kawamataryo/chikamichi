import { Bookmarks, History, Tabs } from 'webextension-polyfill'
import { SEARCH_ITEM_TYPE } from '~/constants'

export const faviconUrl = (url: string) => `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`

const removeDeprecatedItem = (searchItems: SearchItem[], key: 'title' | 'url') => {
  return Array.from(
    searchItems
      .reduce(
        (map, currentItem) =>
          map.set(currentItem[key], currentItem),
        new Map<string, SearchItem>(),
      )
      .values(),
  )
}

export const convertToSearchItemsFromHistories = (histories: History.HistoryItem[]): SearchItem[] => {
  const searchItems = histories.filter((history) => {
    // remove google search's history
    if (/google\..+\/search/.test(history.url!))
      return false
    return true
  }).map(history => ({
    url: history.url!,
    title: history.title!,
    faviconUrl: faviconUrl(history.url!),
    type: SEARCH_ITEM_TYPE.HISTORY,
    folderName: '',
  }))

  // remove same title items
  return removeDeprecatedItem(searchItems, 'title')
}

export const convertToSearchItemsFromBookmarks = (bookmarkTreeNodes: Bookmarks.BookmarkTreeNode[]): SearchItem[] => {
  // FIXME: want to rewrites it into a clean recursive function that doesn't use side effects.
  const result: SearchItem[] = []
  const getTitleAndUrl = (bookmarkTreeNodes: Bookmarks.BookmarkTreeNode[], folderName = '') => {
    bookmarkTreeNodes.forEach((node) => {
      if (node.type !== 'bookmark' && node.children) {
        getTitleAndUrl(node.children, node.title)
        return
      }

      if (!node.url)
        return

      result.push({
        url: node.url,
        title: node.title,
        faviconUrl: faviconUrl(node.url),
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        folderName: node.parentId === '1' ? '' : folderName, // Exclude top level folder name.
      })
    })
  }
  getTitleAndUrl(bookmarkTreeNodes)
  return result
}

export const convertToSearchItemsFromTabs = (tabs: Tabs.Tab[]): SearchItem[] => {
  return tabs.map(tab => ({
    url: tab.url!,
    title: tab.title!,
    faviconUrl: faviconUrl(tab.url!),
    type: SEARCH_ITEM_TYPE.TAB,
    tabId: tab.id,
    folderName: '',
  }))
}

export const getSearchItems = async() => {
  const tabs = await browser.tabs.query({})
  const bookmarks = await browser.bookmarks.getTree()
  const histories = await browser.history.search({
    text: '',
    maxResults: 5000,
    // Search up to 30 days in advance.
    startTime: new Date().setDate(new Date().getDate() - 30),
  })

  return removeDeprecatedItem([
    ...convertToSearchItemsFromHistories(histories),
    ...convertToSearchItemsFromBookmarks(bookmarks),
    ...convertToSearchItemsFromTabs(tabs),
  ], 'url')
}
