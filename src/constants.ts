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

export const THEME = {
  AUTO: 'auto',
  DARK: 'dark',
  LIGHT: 'light',
} as const

export const SEARCH_ICON_DATA_URL_LIGHT = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>'

export const SEARCH_ICON_DATA_URL_DARK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="lightgrey" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>'
