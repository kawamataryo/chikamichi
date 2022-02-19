import Fuse from 'fuse.js'

export const getHighlightedProperty = (result: Fuse.FuseResult<SearchItem>, key: keyof SearchItem) => ({
  indices: result.matches?.find(m => m.key === key)?.indices as ([number, number][] | undefined),
  text: result.item[key],
})

export const getHighlightedUrl = (result: Fuse.FuseResult<SearchItem>) => {
  const urlRegex = /^(?:https?:\/\/)?(?:www\.)?/i
  const urlMatch = result.item.url.match(urlRegex)
  const urlMatchedLength = urlMatch ? urlMatch[0].length : 0
  const indices = result.matches
    ?.find(m => m.key === 'url')
    ?.indices.map(([i, j]) => [i - urlMatchedLength, j - urlMatchedLength])
    .filter(indice => indice[0] >= 0)
  return {
    indices: indices as ([number, number][] | undefined),
    text: result.item.url.replace(urlRegex, ''),
  }
}
