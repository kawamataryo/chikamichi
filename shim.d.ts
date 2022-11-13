import "webext-bridge";
import { ProtocolWithReturn } from "webext-bridge";

declare module "webext-bridge" {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    "change-current-tab": { tabId: number };
    "update-current-page": { url: string };
    "open-new-tab-page": { url: string };
    "fuse-search": ProtocolWithReturn<
      { word: string; searchItems: SearchItem[] },
      Fuse.FuseResult<SearchItem>[]
    >;
  }
}
