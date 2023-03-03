<template>
    <canvas ref="el" v-show="show" :width="width" :height="height"></canvas>
</template>

<script>
import * as d3 from 'd3';
import { ref, computed, onMounted, reactive } from 'vue';
import { useNote } from '@/store/note';
import simplify from 'simplify-js'
import { useLink } from '@/store/link';

export default {
    props: {
        vis: {
            type: String,
            required: true
        },
        width: {
            type: Number,
            required: true
        },
        height: {
            type: Number,
            required: true
        },
        onSelect: {
            type: Function,
            required: true
        },
    },
    // emits: ["data-select"],
    setup(props) {

        const el = ref(null)

        const link = useLink();
        const note = useNote();

        let initialized = ref(false);
        const show = computed(() => !initialized.value || note.tool === note.tools.SELECT);

        const isDrawing = ref(false);
        let ctx, points = [];
        const selection = reactive({
            vis: "",
            data: null,
        })
        const polygons = ref([])

        const line = d3.line()
            .curve(d3.curveLinear)
            .x(d => d.x)
            .y(d => d.y)

        function init() {
            const canvas = d3.select(el.value);
            ctx = el.value.getContext("2d")
            ctx.strokeStyle = "darkred";
            ctx.fillStyle = "darkred";
            ctx.lineWidth = 2;
            line.context(ctx)
            canvas
                .style("cursor", "crosshair")
                .on("pointerdown", startDrawing)
                .on("pointermove", draw)
                .on("pointerup", stopDrawing)

            initialized.value = true;
        }

        function startDrawing(e) {
            isDrawing.value = true;
            const [x, y] = d3.pointer(e, el.value)
            points = []
            points.push({ x: x, y: y });

            ctx.clearRect(0, 0, props.width, props.height);
            ctx.beginPath();
        }

        function draw(e) {
            if (isDrawing.value) {
                const [x, y] = d3.pointer(e, el.value)
                points.push({ x: x, y: y })

                ctx.clearRect(0, 0, props.width, props.height);
                line(points)
                ctx.stroke();
            }
        }

        function stopDrawing() {
            isDrawing.value = false;
            ctx.clearRect(0, 0, props.width, props.height);
            points = simplify(points, 2);
            points.push(points[0])

            switch(note.selectionMode) {
                case note.modes.ADD:
                    polygons.value.push(points.map(d => [d.x, d.y]));
                    break;
                case note.modes.SUBTRACT:
                    // TODO
                    break;
                default:
                    polygons.value = [points.map(d => [d.x, d.y])];
                    break;
            }


            selection.vis = props.vis;
            selection.data = props.onSelect(polygons.value);
            link.setData(selection)

            ctx.clearRect(0, 0, props.width, props.height);
        }

        onMounted(init)

        return {
            el,
            show,
            selection
        }
    },
}
</script>

<style scoped>
canvas {
    position: absolute;
    top: 0;
    left: 0;
}
</style>