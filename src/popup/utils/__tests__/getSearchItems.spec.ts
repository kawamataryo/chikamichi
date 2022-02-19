import { randCatchPhrase, randNumber, randUrl, randUuid } from '@ngneat/falso'
import { Bookmarks, History } from 'webextension-polyfill'
import { convertToSearchItemsFromBookmarks, convertToSearchItemsFromHistories, faviconUrl } from '~/popup/utils/getSearchItems'
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

const generateHistory = (args: { title?: string; url?: string} = {}): History.HistoryItem => ({
  id: randUuid(),
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
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

  describe('convertToSearchItemsFromHistories', () => {
    it('get search items from histories', () => {
      const histories = [generateHistory(), generateHistory()]

      const searchItems = convertToSearchItemsFromHistories(histories)

      expect(searchItems.length).toBe(2)
      expect(searchItems).toEqual([
        {
          url: histories[0].url,
          title: histories[0].title!,
          faviconUrl: faviconUrl(histories[0].url!),
          type: SEARCH_ITEM_TYPE.HISTORY,
          folderName: '',
        },
        {
          url: histories[1].url,
          title: histories[1].title!,
          faviconUrl: faviconUrl(histories[1].url!),
          type: SEARCH_ITEM_TYPE.HISTORY,
          folderName: '',
        },
      ])
    })
  })

  it('remove google search histories', () => {
    const histories = [generateHistory({ url: 'https://www.google.com/search?q=Compiler+API' }), generateHistory()]

    const searchItems = convertToSearchItemsFromHistories(histories)

    expect(searchItems.length).toBe(1)
    expect(searchItems).toEqual([
      {
        url: histories[1].url,
        title: histories[1].title!,
        faviconUrl: faviconUrl(histories[1].url!),
        type: SEARCH_ITEM_TYPE.HISTORY,
        folderName: '',
      },
    ])
  })

  it('remove same title histories', () => {
    const histories = [generateHistory({ title: 'titleA' }), generateHistory({ title: 'titleB' }), generateHistory({ title: 'titleA' })]

    const searchItems = convertToSearchItemsFromHistories(histories)

    expect(searchItems.length).toBe(2)
    expect(searchItems).toContainEqual(
      {
        url: histories[1].url,
        title: histories[1].title!,
        faviconUrl: faviconUrl(histories[1].url!),
        type: SEARCH_ITEM_TYPE.HISTORY,
        folderName: '',
      },
    )
    expect(searchItems).toContainEqual(
      {
        url: histories[2].url,
        title: histories[2].title!,
        faviconUrl: faviconUrl(histories[2].url!),
        type: SEARCH_ITEM_TYPE.HISTORY,
        folderName: '',
      },
    )
  })
})
