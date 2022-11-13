import Fuse from "fuse.js";
import { sendMessage } from "webext-bridge";
import { FUSE_OPTIONS } from "~/constants";

export const fuseSearch = async (word: string, searchItems: SearchItem[]) => {
  // FIXME: This is a workaround.
  // only when testing. because webext-bridge is not working in cypress.
  if ((window as any).Cypress) {
    const fuse = new Fuse(searchItems, FUSE_OPTIONS);
    return fuse.search<SearchItem>(word, { limit: 100 });
  }

  return await sendMessage("fuse-search", {
    word,
    searchItems,
  });
};
