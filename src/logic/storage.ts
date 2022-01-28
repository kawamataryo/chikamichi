import { useLocalStorage } from '@vueuse/core'

export const defaultSearchPrefix = useLocalStorage('chikamichi-default-search-prefix', '', { listenToStorageChanges: true })
