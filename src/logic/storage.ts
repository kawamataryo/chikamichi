import { useLocalStorage } from "@vueuse/core";
import { THEME } from "~/constants";

export const defaultSearchPrefix = useLocalStorage(
  "chikamichi-default-search-prefix",
  "",
  { listenToStorageChanges: true }
);
export const favoriteItems = useLocalStorage(
  "chikamichi-favorite-items",
  "[]",
  { listenToStorageChanges: true }
);
export const theme = useLocalStorage("chikamichi-theme", THEME.AUTO, {
  listenToStorageChanges: true,
});

export const openLinkInCurrentTab = useLocalStorage(
  "chikamichi-open-link-in-current-tab",
  true,
  { listenToStorageChanges: true }
);
