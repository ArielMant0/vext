<template>
    <VextCircleMenu v-if="mode === MODES.BRUSH" v-model="open"
            :items="brushOptions" :x="x" :y="y"
            :close-on-click="closeOnClick"
            @click="o => performAction(o)"
            @close="close"/>
    <VextCircleMenu v-else-if="mode === MODES.SHAPE" v-model="open"
            :items="shapeOptions" :x="x" :y="y"
            :close-on-click="closeOnClick"
            @click="o => performAction(o)"
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
        closeOnClick: {
            type: Boolean,
            default: true
        },
    })
    const emit = defineEmits(["update:modelValue", "close", "click"])

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
                value: 0,
                border: settings.activeColor === 0,
            },{
                id: "color-secondary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color1,
                value: 1,
                border: settings.activeColor === 1,
            },{
                id: "size-1",
                action: "brush-size",
                color: "default",
                value: 1,
            },{
                id: "size-3",
                action: "brush-size",
                color: "default",
                value: 3,
            },{
                id: "size-5",
                action: "brush-size",
                color: "default",
                value: 5,
            },{
                id: "size-10",
                action: "brush-size",
                color: "default",
                value: 10,
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
                value: "text",
            },{
                id: "shape-circle",
                icon: "mdi-circle",
                action: "shape",
                color: "default",
                value: "circle",
            },{
                id: "shape-rectangle",
                icon: "mdi-rectangle",
                action: "shape",
                color: "default",
                value: "rectangle",
            },{
                id: "shape-triangle",
                icon: "mdi-triangle",
                action: "shape",
                color: "default",
                value: "triangle",
            },{
                id: "color-primary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color0,
                value: 0,
                border: settings.activeColor === 0,
            },{
                id: "color-secondary",
                icon: "mdi-palette",
                action: "color",
                color: settings.color1,
                value: 1,
                border: settings.activeColor === 1,
            }
        ]
    });

    function performAction(item) {
        switch (item.action) {
            case "color":
                settings.selectColor(item.value);
                break;
            case "shape":
                settings.setShape(item.value);
                break;
            case "brush-size":
                settings.setBrushSize(item.value);
                break;
        }
        emit("click", item)
    }

    function close() {
        open.value = false;
        emit("close")
    }
</script>