<script lang="ts">
import { PropType, defineComponent } from 'vue'
import { h } from 'vue-demi'
import { HighlighterItem } from './types'
import { splitHighlighterItem } from './utils'

export default defineComponent({
  props: {
    item: {
      type: Object as PropType<HighlighterItem>,
      required: true,
    },
  },
  render() {
    const { item } = this.$props
    const split = splitHighlighterItem(item)
    const children = split.map(el =>
      el.highlight
        ? h(
          'span',
          {
            class:
                'dark:text-blue-400 text-blue-600 inline-block font-bold',
          },
          el.text,
        )
        : el.text,
    )
    return h('span', {}, children)
  },
})
</script>
