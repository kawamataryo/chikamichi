import { createApp } from "vue";
import App from "./Popup.vue";
import "../styles";
import { getSearchItems } from "~/popup/utils/getSearchItems";
import { STORE_KEY, useStore } from "~/popup/utils/store";

(async () => {
  const store = useStore();
  const app = createApp(App);
  app.provide(STORE_KEY, store);
  app.mount("#app");

  // Run in this position to prevent delays in mounting to app
  const { histories, bookmarks, tabs } = await getSearchItems();
  store.initialize({
    histories,
    bookmarks,
    tabs,
  });
})();
