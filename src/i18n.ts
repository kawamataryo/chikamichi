const FALLBACK_MESSAGES = {
  actionCopyMarkdownLink: "Copy Markdown Link",
  actionCopyTitle: "Copy Title",
  actionCopyUrl: "Copy URL",
  actionDescriptionCopyMarkdownLink: "Copy the current page as a Markdown link.",
  actionDescriptionCopyTitle: "Copy the current page title.",
  actionDescriptionCopyUrl: "Copy the current page URL.",
  actionDescriptionDuplicateTab: "Open a duplicate of the current tab.",
  actionDescriptionMuteTab: "Mute audio for the current tab.",
  actionDescriptionPinTab: "Pin the current tab.",
  actionDescriptionScreenshotFullPage: "Save a full-page screenshot to Downloads.",
  actionDescriptionScreenshotFullPageClipboard: "Copy a full-page screenshot to the clipboard.",
  actionDescriptionScreenshotVisibleArea: "Save the visible area to Downloads.",
  actionDescriptionScreenshotVisibleAreaClipboard: "Copy the visible area to the clipboard.",
  actionDescriptionUnmuteTab: "Unmute audio for the current tab.",
  actionDescriptionUnpinTab: "Unpin the current tab.",
  actionDuplicateTab: "Duplicate Tab",
  actionModeEmpty: "No actions found.",
  actionModeLabel: "Actions",
  actionModePlaceholder: "Type an action for this page...",
  actionModeShortcutBody:
    "Type `>` to run commands like copy title, markdown link, mute, pin, and screenshots.",
  actionModeShortcutTitle: "Action mode",
  actionModeTitle: "Current page actions",
  actionMuteTab: "Mute Tab",
  actionPinTab: "Pin Tab",
  actionScreenshotFullPage: "Capture Full Page",
  actionScreenshotFullPageClipboard: "Copy Full Page to Clipboard",
  actionScreenshotVisibleArea: "Capture Visible Area",
  actionScreenshotVisibleAreaClipboard: "Copy Visible Area to Clipboard",
  actionUnmuteTab: "Unmute Tab",
  actionUnpinTab: "Unpin Tab",
  altOpen: "Alternative open",
  badgeAddFavorite: "Pinned",
  badgeCopied: "Copied to clipboard",
  badgeCopiedMarkdown: "Copied Markdown link",
  badgeCopiedTitle: "Copied title",
  badgeMutedTab: "Muted tab",
  badgePinnedTab: "Pinned tab",
  badgeRemoveFavorite: "Unpinned",
  badgeSavedScreenshot: "Saved screenshot",
  badgeUnmutedTab: "Unmuted tab",
  badgeUnpinnedTab: "Unpinned tab",
  browserSearch: 'Search "$1"',
  browserSearchEngine: "Browser",
  buttonOpenIssue: "Open Issue",
  favoriteDragHandle: "Drag to reorder pinned item",
  feedbackBody: "Bug reports and improvements can be sent to GitHub issues.",
  feedbackDescription: "You can collect usability problems and improvement ideas into an issue.",
  feedbackTitle: "Feedback",
  footerClose: "Close",
  footerOpen: "Open",
  footerOpenCurrentTab: "Current tab",
  footerOpenNewTab: "New tab",
  footerSelect: "Move",
  generalSectionTitle: "General",
  infoDescription: "Core shortcuts and commands at a glance.",
  infoTitle: "Info",
  labelAlternativeOpen: "Ctrl+Enter: $1",
  labelCurrentTab: "open in current tab",
  labelMoveSelection: "Move selection",
  labelNewTab: "open in new tab",
  labelOpenPopup: "Open popup",
  labelSearchTargets: "Search targets",
  labelUtilities: "Utilities",
  manifestDescription:
    "Command palette for the browser. Enables fuzzy search for histories, tabs and bookmarks.",
  manifestName: "Chikamichi - Quickly find a page -",
  openLinkActionDescription: "Switch how Enter and Ctrl+Enter open links.",
  openLinkActionTitle: "Open Link Action",
  openLinkCurrentTab: "Open link in current tab",
  openLinkNewTab: "Open link in new tab",
  pageInfoSummary: "Help and links",
  pageInfoTitle: "Info",
  pageSearchSummary: "Find and act",
  pageSearchTitle: "Search",
  pageSettingsSummary: "Behavior",
  pageSettingsTitle: "Settings",
  panelLabelCandidates: "Results",
  panelLabelRecentSearches: "Recent",
  placeholderSearch: "Search for...",
  prefixBookmark: "/b : search bookmarks",
  prefixDescription: "Choose the default target when typing starts.",
  prefixHistory: "/h : search history",
  prefixNone: "none",
  prefixTab: "/t : search tabs",
  prefixTitle: "Default Search Prefix",
  quickReferenceTitle: "Quick Reference",
  searchEmptyBody: "Bookmarks, histories, and tabs will appear here.",
  searchEmptyTitle: "Start Searching",
  searchTargetBookmarks: "/b Bookmarks",
  searchTargetHistory: "/h History",
  searchTargetTabs: "/t Tabs",
  settingDescription: "Adjust startup target, theme, and open behavior.",
  settingTitle: "Settings",
  shortcutOpenPopup: "`Alt+K`",
  shortcutUtilities: "`Ctrl+F` pin, `Ctrl+C` copy URL",
  shortcutsMoveSelection: "Arrow keys or `Ctrl+N` / `Ctrl+P`",
  themeAuto: "auto",
  themeDark: "dark",
  themeDescription: "Choose the popup color mode.",
  themeLight: "light",
  themeTitle: "Theme",
} as const;

export type MessageKey = keyof typeof FALLBACK_MESSAGES;

export const t = (key: MessageKey, substitutions?: string | string[]) => {
  const message = chrome.i18n?.getMessage(key, substitutions as string | string[] | undefined);

  if (message) {
    return message;
  }

  const fallback = FALLBACK_MESSAGES[key];

  if (substitutions === undefined) {
    return fallback;
  }

  const values = Array.isArray(substitutions) ? substitutions : [substitutions];

  return values.reduce((result, value, index) => result.replace(`$${index + 1}`, value), fallback);
};
