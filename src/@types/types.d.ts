type SearchItem = {
  title: string
  url: string
  faviconUrl: string
  type: 'history' | 'bookmark' | 'tab'
  tabId?: number
}
type ValueOf<T> = T[keyof T]
