<template>
  <section ref="el" class="ma-2" style="width: 100%;">
      <div class="d-flex">
          <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight(500)">500</v-btn>
          <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight(2500)">2500</v-btn>
          <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight()">reset</v-btn>
          <div class="d-flex">
              <v-slider min="1" step="1" max="5000"
                  style="width: 200px"
                  hide-details
                  density="compact"
                  :model-value="count"
                  @update:model-value="n => testStore.setCount(Number.parseInt(n))"/>
              <v-text-field type="number"
                  hide-details
                  density="compact"
                  :model-value="count"
                  @update:model-value="n => testStore.setCount(Number.parseInt(n))"/>
          </div>
          <div class="d-flex">
              <v-slider min="1" step="1" max="25"
                  style="width: 200px"
                  hide-details
                  density="compact"
                  :model-value="rows"
                  @update:model-value="n => testStore.setRows(Number.parseInt(n))"/>
              <v-text-field type="number"
                  hide-details
                  density="compact"
                  :model-value="rows"
                  @update:model-value="n => testStore.setRows(Number.parseInt(n))"/>
          </div>
    </div>
    <VextNoteCanvas :width="visAreaWidth" :height="visAreaHeight" show-border/>
    <div class="d-flex" style="align-items: flex-start;">
      <ScatterPlot :n="count"/>
      <SmallMultiples :rows="rows"/>
    </div>
  </section>
</template>

<script setup>

    import VextNoteCanvas from '@/components/VextNoteCanvas.vue'

    import { ref, reactive, computed } from 'vue'
    import { useElementSize } from '@vueuse/core'

    import ScatterPlot from '@/components/test/ScatterPlot.vue';
    import SmallMultiples from '@/components/test/SmallMultiples.vue';

    import { useTestStore } from '@/store/test';
    import { storeToRefs } from 'pinia';

    const el = ref(null);
    const visAreaWidth = computed(() => size.width);
    const visAreaHeight = computed(() => size.height);
    const size = reactive(useElementSize(el));

    const testStore = useTestStore()
    testStore.init();

    const { count, rows } = storeToRefs(testStore);

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
</style>
