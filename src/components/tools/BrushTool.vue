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
        <ColorViewer/>
    </div>
</template>

<script>
import { ref, watch, onMounted } from 'vue';
import { useNote } from '@/store/note'
import ColorViewer from '@/components/tools/ColorViewer';

export default {
    name: "BrushTool",
    components: { ColorViewer },
    setup() {
        const note = useNote();
        const size = ref(1);

        function readBrushSize() {
            if (note.brushSize !== size.value) {
                size.value = note.brushSize;
            }
        }
        function transferBrushSize() { note.setBrushSize(size.value); }
        function setBrushSize(bsize) {
            if (bsize !== size.value) {
                size.value = bsize;
                transferBrushSize();
            }
        }

        onMounted(readBrushSize);

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
