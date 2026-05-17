# Settings

Chikamichi includes lightweight settings for startup behavior, display mode, and link opening.

![Chikamichi popup settings](/screenshots/popup-settings.png)

## Default search prefix

Choose which target should be active when typing starts:

| Setting | Behavior                                       |
| ------- | ---------------------------------------------- |
| none    | Search histories, bookmarks, and tabs together |
| `/h`    | Start with history search                      |
| `/b`    | Start with bookmark search                     |
| `/t`    | Start with tab search                          |

This setting controls the initial search mode when the popup opens. Use `none` if you want the broadest search by default, or choose a prefix if your normal workflow starts from one source.

## Theme

The popup supports:

- Auto
- Light
- Dark

`Auto` follows the browser or system color preference. Use `Light` or `Dark` when you want Chikamichi to keep a fixed popup appearance.

## Open link action

Configure how `Enter` and `Ctrl + Enter` behave. This lets you decide whether the primary action opens in the current tab or a new tab.

| Setting                  | Behavior                                             |
| ------------------------ | ---------------------------------------------------- |
| Open link in current tab | `Enter` opens the selected result in the current tab |
| Open link in new tab     | `Enter` opens the selected result in a new tab       |

`Ctrl + Enter` uses the alternative behavior, so both open styles remain available from the keyboard.
