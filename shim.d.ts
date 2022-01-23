import { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'tab-prev': { title: string | undefined }
    'get-current-tab': ProtocolWithReturn<{ tabId: number }, { title?: string }>
    'history-search': { result: string | undefined }
    'change-current-tab': { tabId: number }
    'update-current-page': { url: string }
    'open-new-tab-page': { url: string }
  }
}
