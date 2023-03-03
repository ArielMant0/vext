<template>
    <div>
        <div class="text-caption">primary and secondary color</div>
        <v-item-group mandatory v-model="tmpActive" selected-class="color-choice" @update:modelValue="chooseColor" style="display: flex;">
            <v-item v-slot="{ toggle, isSelected }">
                <v-card :color="color0" @click="toggle" :width="50" :height="50" style="margin-right:5px;">
                    <v-icon v-if="isSelected" icon="mdi-check-circle-outline" size="50" style="opacity: 0.5" color="white"></v-icon>
                </v-card>
            </v-item>
            <v-item v-slot="{ toggle, isSelected }">
                <v-card :color="color1" @click="toggle" :width="50" :height="50">
                    <v-icon v-if="isSelected" icon="mdi-check-circle-outline" size="50" style="opacity: 0.5" color="white"></v-icon>
                </v-card>
            </v-item>
        </v-item-group>
        <div class="text-caption">color picker</div>
        <v-color-picker hide-inputs v-model="tmpColor" @update:modelValue="changeColor" :swatches="swatch" :width="275" class="mb-3"
            show-swatches swatches-max-height="150"/>
    </div>
</template>

<script>
import { ref, watch } from 'vue';
import { useNote } from '@/store/note'
import { storeToRefs } from 'pinia';

export default {
    setup() {

        const note = useNote();
        const { activeColor, color0, color1, swatch } = storeToRefs(note);

        const tmpColor = ref("#ff0000")
        const tmpActive = ref(0);

        function changeColor() {
            if (activeColor.value === 0) {
                note.setColorPrimary(tmpColor.value)
            } else {
                note.setColorSecondary(tmpColor.value)
            }
        }
        function chooseColor() {
            note.selectColor(tmpActive.value);
        }
        function readColor() {
            tmpColor.value = note.color;
            tmpActive.value = activeColor.value;
        }

        watch(() => activeColor.value, readColor);
        watch(() => note.color, readColor);

        return {
            color0,
            color1,
            swatch,
            tmpColor,
            tmpActive,
            changeColor,
            chooseColor
        }
    },
}
</script>