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
        <div class="mb-2" style="display:flex;justify-content: space-evenly;">
            <v-btn @click="setBrushSize(1)" size="x-small" rounded="pill" color="info">1</v-btn>
            <v-btn @click="setBrushSize(2)" size="x-small" rounded="pill" color="info">2</v-btn>
            <v-btn @click="setBrushSize(3)" size="x-small" rounded="pill" color="info">3</v-btn>
            <v-btn @click="setBrushSize(5)" size="x-small" rounded="pill" color="info">5</v-btn>
            <v-btn @click="setBrushSize(10)" size="x-small" rounded="pill" color="info">10</v-btn>
            <v-btn @click="setBrushSize(15)" size="x-small" rounded="pill" color="info">15</v-btn>
        </div>
        <VextColorViewer/>
    </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useVextNote } from '@/store/note'
import VextColorViewer from '@/components/tools/VextColorViewer';

/**
 * A tool that enables drawing on the NoteCanvas when active and handles
 * the brush configuration for drawing.
 *
 * @displayName VextBrushTool
 */
export default {
    name: "VextBrushTool",
    components: { VextColorViewer },
    props: {
        /**
         * The initial size of the brush
         */
        initialSize: {
            type: Number,
            default: 1,
        }
    },
    setup(props) {
        const note = useVextNote();
        const size = ref(props.initialSize);

        function readBrushSize() {
            if (note.brushSize !== size.value) {
                size.value = note.brushSize;
            }
        }
        /**
         * Transfer the brush size to the note store
         */
        function transferBrushSize() { note.setBrushSize(size.value); }

        /**
         * Sets the brush size to brushSize
         * @param {Number} brushSize
         */
        function setBrushSize(brushSize) {
            if (brushSize !== size.value) {
                size.value = brushSize;
                transferBrushSize();
            }
        }

        onMounted(transferBrushSize);

        watch(() => note.brushSize, readBrushSize)

        return {
            size,
            setBrushSize,
            transferBrushSize
        }
    },
}
</script>

<style>
.v-card.color-choice {
    border: 3px outset gray;
}
</style>
