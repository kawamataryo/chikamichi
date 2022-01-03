/* eslint-disable no-console */
import { onMessage } from 'webext-bridge'
import { createApp } from 'vue'
import App from './views/App.vue'
import { STORE_KEY, useStore } from '~/contentScripts/store'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  // initialise store
  const store = useStore()

  onMessage('history-search', ({ data }) => {
    store.changeSearchWord('')
    store.changeHistories(JSON.parse(data.result!))

    store.toggleModal()
  })

  // Mount Vue
  const container = document.createElement('div')
  const root = document.createElement('div')
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.body.appendChild(container)
  const app = createApp(App)

  app.provide(STORE_KEY, store)
  app.mount(root)
})()
