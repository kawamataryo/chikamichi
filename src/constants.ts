import Fuse from 'fuse.js'

export const SEARCH_TARGET_REGEX = {
  HISTORY: /^\/h\s(.*)/,
  BOOKMARK: /^\/b\s(.*)/,
  TAB: /^\/t\s(.*)/,
  EITHER: /^\/[hbt]\s(.*)/,
} as const

export const SEARCH_ITEM_TYPE = {
  HISTORY: 'history',
  BOOKMARK: 'bookmark',
  TAB: 'tab',
} as const

export const FUSE_OPTIONS: Fuse.IFuseOptions<any> = {
  useExtendedSearch: true,
  includeMatches: true,
  keys: ['title', 'url'],
  threshold: 0.4,
}

export const PAGES = {
  SEARCH: 'search',
  INFO: 'info',
  SETTING: 'setting',
} as const

export const SEARCH_PREFIX = {
  HISTORY: '/h ',
  BOOKMARK: '/b ',
  TAB: '/t ',
}
