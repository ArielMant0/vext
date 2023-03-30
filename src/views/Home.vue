<template>
  <div class="d-flex" style="height: 96%">
    <VextNoteDrawer/>
    <section ref="el" class="ma-2" style="width: 100%; height: 100%;">
      <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight(500)">500</v-btn>
      <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight(1000)">1000</v-btn>
      <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight()">reset</v-btn>
      <VextNoteCanvas :width="visAreaWidth" :height="visAreaHeight" show-border/>
      <ScatterPlot/>
      <VextGlobalToolTip/>
    </section>
  </div>
</template>

<script setup>

  import VextNoteCanvas from '@/components/VextNoteCanvas.vue'
  import VextGlobalToolTip from '@/components/VextGlobalToolTip.vue';
  import VextNoteDrawer from '@/components/VextNoteDrawer.vue';

  import { ref, reactive, computed } from 'vue'
  import { useElementSize } from '@vueuse/core'
  import ScatterPlot from '@/components/test/ScatterPlot.vue';

  const el = ref(null);
  const visAreaWidth = computed(() => size.width);
  const visAreaHeight = computed(() => size.height);
  const size = reactive(useElementSize(el));

  function setHeight(h) {
    el.value.style.height = h ? h+'px' : null;
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
