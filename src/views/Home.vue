<template>
  <div class="d-flex" style="height: 96%">
    <VextNoteDrawer :auto-tool-switch="false"/>
    <section ref="el" class="ma-2" style="width: 100%; height: 100%;">
        <div class="d-flex">
            <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight(500)">500</v-btn>
            <v-btn class="ma-1" size="small" variant="outlined" @click="setHeight(1000)">1000</v-btn>
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
      </div>
      <VextNoteCanvas :width="visAreaWidth" :height="visAreaHeight" show-border/>
      <ScatterPlot :n="count"/>
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
    import { useTestStore } from '@/store/test';
    import { storeToRefs } from 'pinia';
    import { onMounted } from 'vue';

    const el = ref(null);
    const visAreaWidth = computed(() => size.width);
    const visAreaHeight = computed(() => size.height);
    const size = reactive(useElementSize(el));

    const testStore = useTestStore()

    const { count } = storeToRefs(testStore);

    function setHeight(h) {
        el.value.style.height = h ? h+'px' : null;
    }

    onMounted(testStore.init)
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
