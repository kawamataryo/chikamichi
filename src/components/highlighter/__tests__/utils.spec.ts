import { splitHighlighterItem } from '~/components/highlighter/utils'
import { HighlighterItem } from '~/components/highlighter/types'

describe('can be split without a indices.', () => {
  it('can be split with do not match', () => {
    const item = {
      indices: [],
      text: 'abcdefg',
    }
    const split = splitHighlighterItem(item)
    expect(split).toEqual([{ highlight: false, text: 'abcdefg' }])
  })

  it('can be split English input', () => {
    const item: HighlighterItem = {
      indices: [
        [0, 1],
        [2, 3],
      ],
      text: 'abcdefg',
    }
    const split = splitHighlighterItem(item)
    expect(split).toEqual([
      { highlight: true, text: 'ab' },
      { highlight: true, text: 'cd' },
      { highlight: false, text: 'efg' },
    ])
  })

  it('can be split Japanese input', () => {
    const item: HighlighterItem = {
      indices: [
        [1, 1],
        [2, 3],
      ],
      text: '日本語のテスト',
    }
    const split = splitHighlighterItem(item)
    expect(split).toEqual([
      { highlight: false, text: '日' },
      { highlight: true, text: '本' },
      { highlight: true, text: '語の' },
      { highlight: false, text: 'テスト' },
    ])
  })
})
