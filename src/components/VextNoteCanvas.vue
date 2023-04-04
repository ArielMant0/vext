<template>
    <div ref="wrapper" style="position: relative;">
        <canvas ref="canvasNode" :width="width" :height="height"></canvas>
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
            default: 300,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * Height of the canvas
         */
        height: {
            type: Number,
            default: 120,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * Value for the fabric.js decimate option. Larger values result in
         * more simplified lines when drawing.
         */
        decimate: {
            type: Number,
            default: 5,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * Background color of the canvas.
         */
        backgroundColor: {
            type: String,
            default: 'rgba(255, 255, 255, 0)',
            validator(value) {
                return CSS.supports("color", value)
            }
        },
        /**
         * CSS z-index to set for the canvas.
         */
        zIndex: {
            type: [String, Number],
            default: 100,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        },
        /**
         * Whether to draw a border around the canvas.
         */
        showBorder: {
            type: Boolean,
            default: true
        },
        /**
         * Color of the canvas border, if one should be shown.
         */
        borderColor: {
            type: String,
            default: "lightgray",
            validator(value) {
                return CSS.supports("color", value)
            }
        },
        /**
         * Size of the canvas border, if one should be shown.
         */
        borderSize: {
            type: [String, Number],
            default: 1,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        },
        /**
         * Style of the canvas border, if one should be shown.
         */
        borderStyle: {
            type: String,
            default: "solid",
            validator(value) {
                return [
                    "solid", "dashed", "dotted", "double",
                    "groove", "ridge", "inset", "outset"
                ].includes(value)
            }
        },
        /**
         * Radius of the canvas border corners, if one should be shown.
         */
        borderRadius: {
            type: [String, Number],
            default: 5,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0
            }
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
        const el = document.querySelector(`.${canvas.containerClass}`)
        el.style.position = "absolute";
        el.style.top = 0;
        el.style.left = 0;
        el.style.zIndex = props.zIndex;
        setBorderStyle();

        const brush = new fabric.PencilBrush(canvas);
        brush.decimate = props.decimate;
        brush.color = note.color0;
        brush.width = note.brushSize;
        canvas.freeDrawingBrush = brush;
    }

    function setBorderStyle() {
        const el = document.querySelector(`.${note.canvas.containerClass}`)
        if (props.showBorder) {
            const size = props.borderSize + (typeof props.borderSize === "string" ? "" : "px")
            el.style.border = `${size} ${props.borderStyle} ${props.borderColor}`;
            el.style.borderRadius = props.borderRadius + (typeof props.borderRadius === "string" ? "" : "px")
        } else {
            el.style.border = "none";
        }
    }

    onMounted(init);

    watch(() => {
        return [props.showBorder, props.borderColor, props.borderSize, props.borderStyle, props.borderRadius]
    }, setBorderStyle, { deep: true })

    watch(() => {
        return [props.width, props.height]
    }, () => note.resizeCanvas(props.width, props.height), { deep: true })

    watch(() => props.decimate, () => note.setBrushDecimation(props.decimate))
    watch(() => props.zIndex, () => note.setCanvasZIndex(props.zIndex));

</script>