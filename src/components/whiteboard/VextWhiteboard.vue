<template>
    <div v-show="wb.enabled" id="wrapper" :style="{ 'z-index': props.zIndex }">
        <div class="ma-6 pa-2">
            <div class="d-flex" style="position: relative; height: 50px; align-items: center;">
                <v-btn-toggle v-model="tmpMode" @update:model-value="m => wb.setMode(m)" class="mr-2" divided>
                    <v-btn icon="mdi-cursor-move" @click="wb.setMode(MODES.EDIT)" :value="MODES.EDIT"/>
                    <v-btn icon="mdi-brush" @click="wb.setMode(MODES.BRUSH)" :value="MODES.BRUSH"/>
                </v-btn-toggle>
                <div v-if="layerNames.length > 0" class="d-flex ml-1 mt-1 mr-2">
                    <v-select v-model="selectLayer" :items="layerNames"
                        density="compact" hide-details
                        style="min-width: 150px; max-width: 300px;"
                        class="mr-1" append-icon="mdi-check"
                        @click:append="selectLayerItems"/>
                </div>
                <v-btn icon="mdi-close" color="error" @click="close" style="position: absolute; right: 0; top: 0;" variant="text" rounded="0"/>
            </div>
            <div ref="parent" style="min-height: 95%; border: thin solid grey; border-radius: 5px;" class="ma-2">
                <canvas ref="canvasNode" :width="size.width-20" :height="size.height-10"></canvas>
            </div>
        </div>
    </div>
</template>

<script setup>

    /**
     * Component that creates the fabric.js canvas for the whiteboard.
     */
    import { fabric } from 'fabric';
    import { onMounted, ref, reactive, watch, computed } from 'vue';
    import { useVextNote } from '@/store/note';
    import { useVextWhiteboard } from '@/store/whiteboard';
    import { MODES } from '@/use/enums';
    import { useElementSize } from '@vueuse/core';
    import { storeToRefs } from 'pinia';

    const props = defineProps({
        /**
         * Background color of the canvas.
         */
        backgroundColor: {
            type: String,
            default: 'white',
            validator(value) {
                return CSS.supports("color", value)
            }
        },
        /**
         * CSS z-index to set for the canvas.
         */
        zIndex: {
            type: [String, Number],
            default: 200,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        },
    });

    const parent = ref(null);
    const canvasNode = ref(null);
    const wb = useVextWhiteboard();
    const note = useVextNote();

    const { mode } = storeToRefs(wb);

    const size = reactive(useElementSize(parent))

    const tmpMode = ref(mode.value)
    const selectLayer = ref("")
    const layerNames = computed(() => note.userLayers.map(d => d.id))

    function init() {
        const canvas = new fabric.Canvas(canvasNode.value, {
            backgroundColor: props.backgroundColor,
            isDrawingMode: false,
            renderOnAddRemove: true,
            enablePointerEvents: true,
            borderColor: null
        });
        wb.setCanvas(canvas);

        const el = canvas.wrapperEl;
        el.style.zIndex = props.zIndex;

        wb.setMode(MODES.EDIT);
    }

    function close() {
        note.setMode(MODES.LAYER, false)
    }

    function selectLayerItems() {
        if (selectLayer.value) {
            wb.selectLayer(selectLayer.value);
        }
    }

    onMounted(init);

    watch(() => props.zIndex, () => wb.setCanvasZIndex(props.zIndex))
    watch(size, () => wb.resizeCanvas(size.width-20, size.height-10), { deep: true })
    watch(layerNames, () => selectLayer.value = layerNames.value[0])

    watch(mode, m => tmpMode.value = m)

</script>

<style scoped>
#wrapper {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
    background-color: rgba(0, 0, 0, 0.5);
}
#wrapper > * {
    width: 100%;
    background-color: white;
}
</style>