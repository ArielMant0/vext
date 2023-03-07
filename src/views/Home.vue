<template>
  <div style="display: flex;">
    <div style="height: 96vh; position: sticky; top: 0; left: 0; margin: 5px;">
        <VextNoteConfiguration/>
    </div>
    <section ref="el" style="margin:5px; width: 100%;">
      <div style="position: relative;">
          <VextNoteCanvas :width="visAreaWidth" :height="visAreaHeight"/>
        </div>
    </section>
  </div>
</template>

<script setup>

  import VextNoteCanvas from '@/components/VextNoteCanvas.vue'
  import VextNoteConfiguration from '@/components/VextNoteConfiguration.vue'

  import { ref, reactive, computed } from 'vue'
  import { useElementSize } from '@vueuse/core'

  const el = ref(null);
  const visAreaWidth = computed(() => size.width);
  const visAreaHeight = computed(() => size.height);
  const size = reactive(useElementSize(el));

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
