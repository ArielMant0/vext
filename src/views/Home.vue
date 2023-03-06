<template>
  <div style="display: flex;">
    <div style="height: 96vh; position: sticky; top: 0; left: 0; margin: 5px;">
        <NoteConfiguration/>
    </div>
    <section ref="el" style="margin:5px; width: 100%;">
      <div style="position: relative;">
          <NoteCanvas :width="visAreaWidth" :height="visAreaHeight"/>
        </div>
    </section>
  </div>
</template>

<script>
import NoteCanvas from '@/components/NoteCanvas.vue'
import NoteConfiguration from '@/components/NoteConfiguration.vue'

import { ref, reactive, computed } from 'vue'
import { useElementSize } from '@vueuse/core'

export default {
  name: 'App',
  components: { NoteCanvas, NoteConfiguration },
  setup() {

      const el = ref(null);
      const visAreaWidth = computed(() => size.width);
      const visAreaHeight = computed(() => size.height);
      const size = reactive(useElementSize(el));

      return {
          el,
          size,
          visAreaWidth,
          visAreaHeight,
      }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

body {
  margin:0;
}

.no-input-details .v-input__details {
  display: none;
}
</style>
