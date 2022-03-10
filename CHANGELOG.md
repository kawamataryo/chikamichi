# Change Log
All notable changes to this project will be documented in this file.

## 2.14.0
### feat
- set url if bookmark title is empty by @yktakaha4

### chore
- update dependencies

## 2.13.3
### refactor
- move search logic to useSearch
- change highlight logic to use fuse matches

## 2.13.2
### chore
- fix favorite logic

## 2.13.1
### fix
- fix history search settings

## 2.13.0
### feat
- improve search performance.
- change highlight logic

## 2.12.0
### feat
- improve search performance.
- show all parent folder name

## 2.11.2
### feat
- open new tab with cmd + enter

### clean
- add favorite click event test

## 2.11.1
### clean
- update dependencies
- add cypress test
- fix type error
- lint and format code

## 2.11.0
### feature
- add favorite shortcut

## 2.10.0
### feature
- add favorite items

## 2.9.0
### feature
- expand the number of search displays #26

## 2.8.0
### feature
- remove same title histories
- adding submit github action by @louisgv #24

## 2.7.2
### bugfix
- fixed overflow bug

## 2.7.1
### bugfix
- fixed to not show top-level bookmark folder name

## 2.7.0
### feature
- search bookmarks by parent folder name

## 2.6.3
### design
- fixed the layout of search results #21

## 2.6.2
### chore
- fix overflow-scroll. #19 thanks @Ademking

## 2.6.1
### chore
- add autocomplete off. #17 thanks @Ademking

## 2.6.0
### feature
- add theme setting

## 2.5.1
### bugfix
- fixed a problem with ctrl+enter not working on Windows #14

## 2.5.0
### feature
- use browser's search engine instead of Google. #12 thanks  @Merlin04

### bugfix
- fix overflow bug. #11 thanks @Merlin04

## 2.4.0
### feature
- add setting page and default search prefix

## 2.3.2
### chore
- fix button color

## 2.3.1
### fix
- fix selected color

## 2.3.0
### feature
- Add side menu and info page

## 2.2.0
### fix
- Improve search performance.
  - Enabled Fuse ExtendedSearch option

## 2.1.0
### fix
- Improve search performance.

## 2.0.0
### breaking change
- Stop injecting dom in ContentScript, and show form in popup.

## 1.2.0
### feat
- add highlight matches from [@turara](https://github.com/turara)
### internal
- add vitest
