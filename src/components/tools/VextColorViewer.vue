<template>
    <div>
        <div class="text-caption">primary and secondary color</div>
        <v-item-group mandatory v-model="tmpActive" selected-class="vext-color-choice" @update:modelValue="chooseColor" class="d-flex mb-2">
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
        <v-color-picker hide-inputs v-model="tmpColor" @update:modelValue="changeColor" :width="275" class="mb-3"
            show-swatches swatches-max-height="150"/>
    </div>
</template>

<script setup>
    /**
     * Vuetify color picker that let's the user set a primary and
     * secondary color, both of which are stored in the note store.
     */

    import { ref, watch } from 'vue';
    import { useVextNote } from '@/store/note'
    import { storeToRefs } from 'pinia';
    import { useVextSettings } from '@/store/settings';

    const props = defineProps({
        /**
         * Initial color of the primary color
         */
        colorPrimary: {
            type: String,
            default: "#ff0000",
            validator(value) {
                return CSS.supports("color", value)
            }
        },
        /**
         * Initial color of the secondary color
         */
        colorSecondary: {
            type: String,
            default: "#000000",
            validator(value) {
                return CSS.supports("color", value)
            }
        },
    });

    const emits = defineEmits(["color-change"]);

    const note = useVextNote();
    const settings = useVextSettings();
    const { activeColor, color0, color1, color } = storeToRefs(settings);

    settings.setColorPrimary(props.colorPrimary, false)
    settings.setColorSecondary(props.colorSecondary, false)

    const tmpColor = ref(props.colorPrimary)
    const tmpActive = ref(0);

    function changeColor() {
        if (activeColor.value === 0) {
            note.setColorPrimary(tmpColor.value)
        } else {
            note.setColorSecondary(tmpColor.value)
        }
        emits("color-change", tmpColor.value);
    }
    function chooseColor() {
        note.selectColor(tmpActive.value);
        emits("color-change", note.color);
    }
    function readColor() {
        tmpColor.value = note.color;
        tmpActive.value = activeColor.value;
    }

    watch(activeColor, readColor);
    watch(color, readColor);

</script>