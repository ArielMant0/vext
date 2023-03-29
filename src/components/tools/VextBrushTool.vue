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
            <v-btn @click="setBrushSize(1)" size="x-small" rounded="pill" color="primary">1</v-btn>
            <v-btn @click="setBrushSize(2)" size="x-small" rounded="pill" color="primary">2</v-btn>
            <v-btn @click="setBrushSize(3)" size="x-small" rounded="pill" color="primary">3</v-btn>
            <v-btn @click="setBrushSize(5)" size="x-small" rounded="pill" color="primary">5</v-btn>
            <v-btn @click="setBrushSize(10)" size="x-small" rounded="pill" color="primary">10</v-btn>
            <v-btn @click="setBrushSize(15)" size="x-small" rounded="pill" color="primary">15</v-btn>
        </div>
        <VextColorViewer/>
    </div>
</template>

<script setup>
    /**
     * A tool that enables drawing on the NoteCanvas when active and handles
     * the brush configuration for drawing.
     */
    import { ref, watch, onMounted } from 'vue';
    import { useVextNote } from '@/store/note'
    import VextColorViewer from '@/components/tools/VextColorViewer';

    const props = defineProps({
        /**
         * The initial size of the brush
         */
        initialSize: {
            type: Number,
            default: 1,
            validator(value) {
                return value >= 0
            }
        }
    });

    const note = useVextNote();
    const size = ref(props.initialSize);

    function readBrushSize() {
        if (note.brushSize !== size.value) {
            size.value = note.brushSize;
        }
    }

    function transferBrushSize() { note.setBrushSize(size.value); }

    function setBrushSize(brushSize) {
        if (brushSize !== size.value) {
            size.value = brushSize;
            transferBrushSize();
        }
    }

    onMounted(transferBrushSize);

    watch(() => note.brushSize, readBrushSize)

    defineExpose({
        /**
         * Sets the brush size to brushSize
         * @param {Number} brushSize size of the brush in pixels
         */
        setBrushSize,
        /**
         * Transfer the brush size to the note store
         */
        transferBrushSize
    })

</script>

<style>
.v-card.color-choice {
    border: 3px outset gray;
}
</style>
