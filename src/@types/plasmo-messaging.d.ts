import "@plasmohq/messaging";

declare module "@plasmohq/messaging" {
  interface MessagesMetadata {
    "change-current-tab": {};
    "open-new-tab-page": {};
    "update-current-page": {};
  }
}
