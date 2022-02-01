import { useLocalStorage } from '@vueuse/core'
import { THEME } from '~/constants'

export const defaultSearchPrefix = useLocalStorage('chikamichi-default-search-prefix', '', { listenToStorageChanges: true })
export const theme = useLocalStorage('chikamichi-theme', THEME.AUTO, { listenToStorageChanges: true })
