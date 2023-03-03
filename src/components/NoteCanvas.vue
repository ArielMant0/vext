<template>
    <div ref="wrapper">
        <canvas ref="canvasNode" :width="width" :height="height" style="border: 1px solid lightgray;"></canvas>
    </div>
</template>

<script>
import * as d3 from 'd3';
import { fabric } from 'fabric';
import { onMounted, ref, watch, inject } from 'vue';
import { useNote } from '@/store/note';

export default {

    props: {
        width: {
            type: Number,
            default: 300
        },
        height: {
            type: Number,
            default: 120
        },
    },
    setup(props) {
        const wrapper = ref(null);
        const canvasNode = ref(null);
        const note = useNote();

        const activeText = ref(null);

        const init = () => {
            const canvas = new fabric.Canvas(canvasNode.value, {
                isDrawingMode: note.tool === note.tools.BRUSH,
                renderOnAddRemove: true,
                backgroundColor: 'rgba(0, 0, 0, 0)'
            });
            note.setCanvas(canvas);

            // hacky but okay
            d3.select(".canvas-container")
                .style("position", "absolute")
                .style("top", 0)
                .style("left", 0)

            const brush = new fabric.PencilBrush(canvas);
            brush.decimate = 5;
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