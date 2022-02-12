import { randCatchPhrase, randNumber, randUrl, randUuid } from '@ngneat/falso'
import { Bookmarks } from 'webextension-polyfill'
import { convertToSearchItemsFromBookmarks, faviconUrl } from '~/popup/utils/getSearchItems'
import { SEARCH_ITEM_TYPE } from '~/constants'

vi.mock('webextension-polyfill', () => ({}))

const generateBookmark = (): Bookmarks.BookmarkTreeNode => ({
  id: randUuid(),
  parentId: randUuid(),
  index: randNumber(),
  url: randUrl(),
  title: randCatchPhrase(),
  dateAdded: randNumber(),
  dateGroupModified: randNumber(),
  type: 'bookmark' as const,
})

describe('convertToSearchItemsFromBookmarks', () => {
  it('get search items from bookmarks', () => {
    const bookmark1 = generateBookmark()
    const bookmark2 = generateBookmark()
    const bookmark3 = generateBookmark()
    const nestedFolder = {
      ...generateBookmark(),
      type: 'folder' as const,
      children: [
        bookmark3,
      ],
    }
    const folder = {
      ...generateBookmark(),
      type: 'folder' as const,
      children: [
        bookmark2,
        nestedFolder,
      ],
    }
    const bookmarks = [
      bookmark1,
      folder,
    ]

    const searchItems = convertToSearchItemsFromBookmarks(bookmarks)

    expect(searchItems.length).toBe(3)
    expect(searchItems).toEqual([{
      url: bookmark1.url,
      title: bookmark1.title,
      faviconUrl: faviconUrl(bookmark1.url!),
      type: SEARCH_ITEM_TYPE.BOOKMARK,
      folderName: '',
    },
    {
      url: bookmark2.url,
      title: bookmark2.title,
      faviconUrl: faviconUrl(bookmark2.url!),
      type: SEARCH_ITEM_TYPE.BOOKMARK,
      folderName: folder.title,

    },
    {
      url: bookmark3.url,
      title: bookmark3.title,
      faviconUrl: faviconUrl(bookmark3.url!),
      type: SEARCH_ITEM_TYPE.BOOKMARK,
      folderName: nestedFolder.title,
    },
    ])
  })
})
