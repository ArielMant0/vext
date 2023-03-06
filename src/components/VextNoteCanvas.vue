<template>
    <div ref="wrapper">
        <canvas ref="canvasNode" :width="width" :height="height" style="border: 1px solid lightgray;"></canvas>
    </div>
</template>

<script>
import { fabric } from 'fabric';
import { onMounted, ref, watch } from 'vue';
import { useVextNote } from '@/store/note';

export default {
    name: "VextNoteCanvas",
    props: {
        width: {
            type: Number,
            default: 300
        },
        height: {
            type: Number,
            default: 120
        },
        decimate: {
            type: Number,
            default: 5,
        }
    },
    setup(props) {
        const wrapper = ref(null);
        const canvasNode = ref(null);
        const note = useVextNote();

        const activeText = ref(null);

        const init = () => {
            const canvas = new fabric.Canvas(canvasNode.value, {
                isDrawingMode: note.tool === note.tools.BRUSH,
                renderOnAddRemove: true,
                backgroundColor: 'rgba(0, 0, 0, 0)'
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

        return {
            canvasNode,
            wrapper,
            activeText
        }
    },
}
</script>

<style>
.noshow {
    display: none;
}
</style>