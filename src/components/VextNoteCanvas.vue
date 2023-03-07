<template>
    <div ref="wrapper">
        <canvas ref="canvasNode" :width="width" :height="height" style="border: 1px solid lightgray;"></canvas>
    </div>
</template>

<script setup>
    /**
     * Component that creates the fabric.js canvas.
     */
    import { fabric } from 'fabric';
    import { onMounted, ref, watch } from 'vue';
    import { useVextNote } from '@/store/note';

    const props = defineProps({
        /**
         * Width of the canvas
         */
        width: {
            type: Number,
            default: 300
        },
        /**
         * Height of the canvas
         */
        height: {
            type: Number,
            default: 120
        },
        /**
         * Value for the fabric.js decimate option. Larger values result in
         * more simplified lines when drawing.
         */
        decimate: {
            type: Number,
            default: 5,
        },
        /**
         * Background color of the canvas
         */
        backgroundColor: {
            type: String,
            default: 'rgba(0, 0, 0, 0)',
        },
    });

    const wrapper = ref(null);
    const canvasNode = ref(null);
    const note = useVextNote();

    function init() {
        const canvas = new fabric.Canvas(canvasNode.value, {
            isDrawingMode: note.tool === note.tools.BRUSH,
            renderOnAddRemove: true,
            backgroundColor: props.backgroundColor
        });
        note.setCanvas(canvas);

        // hacky but okay
        const el = document.querySelector(".canvas-container")
        el.style.position = "absolute";
        el.style.top = 0;
        el.style.left = 0;

        const brush = new fabric.PencilBrush(canvas);
        brush.decimate = props.decimate;
        brush.color = note.color0;
        brush.width = note.brushSize;
        canvas.freeDrawingBrush = brush;
    }

    onMounted(init);

    watch(() => props.width, () => note.resizeCanvas(props.width, props.height))
    watch(() => props.height, () => note.resizeCanvas(props.width, props.height))

</script>

<style>
.noshow {
    display: none;
}
</style>