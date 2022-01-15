<script lang="ts">
import 'virtual:windi.css'

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
                'font-black inline-block bg-yellow-200/50 dark:bg-yellow-200/30',
          },
          el.text,
        )
        : el.text,
    )
    return h('span', {}, children)
  },
})
</script>
