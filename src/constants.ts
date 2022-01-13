export const FUSE_THRESHOLD_VALUE = 0.3

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
