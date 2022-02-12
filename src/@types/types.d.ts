type SearchItem = {
  title: string
  url: string
  faviconUrl: string
  type: 'history' | 'bookmark' | 'tab'
  tabId?: number
  folderName?: string
}

type ValueOf<T> = T[keyof T]
