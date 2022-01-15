import { HighlighterItem } from './types'

interface SplitHighlighterItem {
  highlight: boolean
  text: string
}

export const splitHighlighterItem = (
  item: HighlighterItem
): SplitHighlighterItem[] => {
  if (!item.indices || item.indices.length === 0)
    return [{ highlight: false, text: item.text }]

  const texts: SplitHighlighterItem[] = []

  let i = 0
  let currentText = ''
  let currentIndice: [number, number] | undefined = item.indices[i]

  for (let j = 0; j < item.text.length; j++) {
    if (currentIndice && j === currentIndice[0]) {
      if (currentText.length)
        texts.push({ highlight: false, text: currentText })
      currentText = ''
    }

    currentText += item.text[j]

    if (currentIndice && j === currentIndice[1]) {
      texts.push({ highlight: true, text: currentText })
      currentText = ''
      currentIndice = item.indices[++i]
    }
  }

  if (currentText.length) texts.push({ highlight: false, text: currentText })

  return texts
}

// Test splitTexts
// ;(() => {
//   const equals = (a: SplitHighlighterItem[], b: SplitHighlighterItem[]) => {
//     if (a.length !== b.length) return false
//     for (let i = 0; i < a.length; i++) {
//       if (a[i].highlight !== b[i].highlight || a[i].text !== b[i].text)
//         return false
//     }
//     return true
//   }

//   {
//     const item = {
//       indices: [],
//       text: 'abcdefg',
//     }
//     const split = splitHighlighterItem(item)
//     console.assert(equals(split, [{ highlight: false, text: 'abcdefg' }]))
//   }

//   {
//     const item: HighlighterItem = {
//       indices: [
//         [0, 1],
//         [2, 3],
//       ],
//       text: 'abcdefg',
//     }
//     const split = splitHighlighterItem(item)
//     console.assert(
//       equals(split, [
//         { highlight: true, text: 'ab' },
//         { highlight: true, text: 'cd' },
//         { highlight: false, text: 'efg' },
//       ])
//     )
//   }

//   {
//     const item: HighlighterItem = {
//       indices: [
//         [1, 1],
//         [2, 3],
//       ],
//       text: '日本語のテスト',
//     }
//     const split = splitHighlighterItem(item)
//     console.assert(
//       equals(split, [
//         { highlight: false, text: '日' },
//         { highlight: true, text: '本' },
//         { highlight: true, text: '語の' },
//         { highlight: false, text: 'テスト' },
//       ])
//     )
//   }
// })()
