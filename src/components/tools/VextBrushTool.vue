<template>
    <div>
        <div class="text-caption">brush size</div>
        <v-slider v-model="size" :min="1" :max="250" step="1" thumb-size="15" density="compact" @update:modelValue="transferBrushSize">
            <template v-slot:append>
                <v-text-field
                    @update:modelValue="transferBrushSize"
                    v-model="size"
                    type="number"
                    style="width: 80px"
                    density="compact"
                    hide-details
                    variant="solo"
                ></v-text-field>
            </template>
        </v-slider>

        <div class="mb-2 d-flex" style="justify-content: space-evenly;">
            <v-btn @click="setBrushSize(1)" size="x-small" rounded="pill" color="primary">1</v-btn>
            <v-btn @click="setBrushSize(2)" size="x-small" rounded="pill" color="primary">2</v-btn>
            <v-btn @click="setBrushSize(3)" size="x-small" rounded="pill" color="primary">3</v-btn>
            <v-btn @click="setBrushSize(5)" size="x-small" rounded="pill" color="primary">5</v-btn>
            <v-btn @click="setBrushSize(10)" size="x-small" rounded="pill" color="primary">10</v-btn>
            <v-btn @click="setBrushSize(15)" size="x-small" rounded="pill" color="primary">15</v-btn>
        </div>

        <div class="text-caption">smoothing</div>
        <v-slider v-model="decimation" :min="0" :max="100" step="1" thumb-size="15" density="compact" @update:modelValue="transferDecimation">
            <template v-slot:append>
                <v-text-field
                    @update:modelValue="transferDecimation"
                    v-model="decimation"
                    type="number"
                    style="width: 80px"
                    density="compact"
                    hide-details
                    variant="solo"
                ></v-text-field>
            </template>
        </v-slider>

        <VextColorViewer @color-change="readColor"/>
    </div>
</template>

<script setup>
    /**
     * A tool that enables drawing on the NoteCanvas when active and handles
     * the brush configuration for drawing.
     */
    import { ref, watch, onMounted } from 'vue';
    import { useVextNote } from '@/store/note'
    import { useVextInput } from '@/store/input';
    import { useVextSettings } from '@/store/settings';
    import { fabric } from 'fabric';
    import { MODES } from '@/use/enums';

    import VextColorViewer from '@/components/tools/VextColorViewer';

    const note = useVextNote();
    const input = useVextInput();
    const settings = useVextSettings();

    const size = ref(settings.brushSize);
    const decimation = ref(settings.brushDecimation);

    const preview = new fabric.Circle({
        top: 10,
        left: 10,
        stroke: "black",
        strokeWidth: 1,
        fill: note.color,
        radius: size.value * 0.5
    });

    function readBrushSize() {
        if (settings.brushSize !== size.value) {
            size.value = settings.brushSize;
            preview.set({
                radius: size.value*0.5,
                dirty: true
            });
            note.canvas.requestRenderAll();
        }
    }
    function readBrushDecimation() {
        if (settings.brushDecimation !== decimation.value) {
            decimation.value = settings.brushDecimation;
        }
    }

    function transferBrushSize(value) {
        note.setBrushSize(value);
        preview.set({
            radius: value*0.5,
            dirty: true
        });
        note.canvas.requestRenderAll();
    }
    function transferDecimation(value) { note.setBrushDecimation(value); }

    function setBrushSize(brushSize) {
        if (brushSize !== size.value) {
            size.value = brushSize;
            transferBrushSize(size.value);
        }
    }

    function movePreview() {
        if (preview.visible) {
            const coords = input.getPointerMove(note.canvas.upperCanvasEl)
            preview.set({
                left: coords[0] - size.value*0.5,
                top: coords[1] - size.value*0.5,
                dirty: true
            });
            note.canvas.requestRenderAll();
        }
    }

    function onSwitch() {
        preview.visible = note.mode === MODES.BRUSH;
    }

    function readColor(color) {
        preview.set({
            fill: color,
            dirty: true
        });
        note.canvas.requestRenderAll();
    }

    onMounted(function() {
        readBrushSize();
        readBrushDecimation()
        note.canvas.add(preview);
    });

    watch(() => note.mode, onSwitch);
    watch(() => input.pointerMove, movePreview)

    watch(() => settings.brushSize, readBrushSize)
    watch(() => settings.brushDecimation, readBrushDecimation)

</script>

