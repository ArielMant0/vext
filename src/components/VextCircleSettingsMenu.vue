<template>
    <VextCircleMenu v-if="mode === MODES.BRUSH" v-model="open"
            :items="brushOptions" :x="x" :y="y"
            @click="o => performAction(o.action, o.id)"
            @close="close"/>
    <VextCircleMenu v-else-if="mode === MODES.SHAPE" v-model="open"
            :items="shapeOptions" :x="x" :y="y"
            @click="o => performAction(o.action, o.id)"
            @close="close"/>
</template>

<script setup>
    import { computed } from 'vue';
    import VextCircleMenu from './VextCircleMenu.vue';
    import { useVextNote } from '@/store/note';
    import { useVextNoteSettings } from '@/store/note-settings';
    import { storeToRefs } from 'pinia';
    import { MODES } from '@/use/enums';

    const note = useVextNote();
    const settings = useVextNoteSettings();
    const { mode } = storeToRefs(note)

    const props = defineProps({
        modelValue: {
            type: Boolean,
            required: true
        },
        x: {
            type: Number,
            default: 10
        },
        y: {
            type: Number,
            default: 10
        },
    })
    const emit = defineEmits(["update:modelValue", "close"])

    const open = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit("update:modelValue", value);
        }
    })

    const brushOptions = computed(() => {
        return [
            {
                id: "color-primary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color0,
            },{
                id: "color-secondary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color1,
            }
        ]
    });
    const shapeOptions = computed(() => {
        return [
            {
                id: "shape-text",
                icon: "mdi-format-text",
                action: "shape",
                color: "default",
            },{
                id: "shape-circle",
                icon: "mdi-circle",
                action: "shape",
                color: "default",
            },{
                id: "shape-rectangle",
                icon: "mdi-rectangle",
                action: "shape",
                color: "default",
            },{
                id: "shape-triangle",
                icon: "mdi-triangle",
                action: "shape",
                color: "default",
            },{
                id: "color-primary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color0,
            },{
                id: "color-secondary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color1,
            }
        ]
    });

    function performAction(action, id) {
        switch (action) {
            case "color":
                settings.selectColor(id === "color-primary" ? 0 : 1);
                break;
            case "shape":
                settings.setShape(id.slice(6));
                break;
        }
    }

    function close() {
        open.value = false;
        emit("close")
    }
</script>