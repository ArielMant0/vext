<template>
    <div v-show="wb.visible" id="wrapper" :style="{ 'z-index': props.zIndex }">
        <div class="ma-6 pa-2">
            <div style="height: 50px">
                <v-btn icon="mdi-close" color="error" @click="close" style="float: right" variant="text" rounded="0"/>
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

    const size = reactive(useElementSize(parent))

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
    }

    function close() {
        note.setMode(MODES.LAYER, false)
    }

    onMounted(init);

    watch(() => props.zIndex, () => wb.setCanvasZIndex(props.zIndex))
    watch(size, () => wb.resizeCanvas(size.width-20, size.height-10), { deep: true })

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