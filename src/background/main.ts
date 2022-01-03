import { sendMessage } from 'webext-bridge'
import { History } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

const removeDuplicates = (histories: History.HistoryItem[]) => {
  return Array.from(
    histories
      .reduce(
        (map, currentItem) => map.set(currentItem.title!, currentItem),
        new Map<string, History.HistoryItem>(),
      )
      .values(),
  )
}

const addHostname = (histories: History.HistoryItem[]) => {
  return histories.map((item) => {
    const url = new URL(item.url!)
    return {
      ...item,
      hostname: url.hostname,
    }
  },
  )
}

browser.commands.onCommand.addListener(async() => {
  const result = await browser.history.search({
    text: '',
    maxResults: 10000,
  })
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  })

  await sendMessage(
    'history-search',
    { result: JSON.stringify(addHostname(removeDuplicates(result))) },
    {
      context: 'content-script',
      tabId: tab.id!,
    },
  )
})
