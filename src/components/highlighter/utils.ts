import { HighlighterItem } from './types'

interface SplitHighlighterItem {
  highlight: boolean
  text: string
}

export const splitHighlighterItem = (
  item: HighlighterItem,
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
