<template>
    <VextCircleMenu v-if="mode === MODES.BRUSH" v-model="open"
            :items="brushOptions" :x="x" :y="y"
            :items-per-level="itemsPerLevel"
            :background="background"
            :z-index="zIndex"
            :close-on-click="closeOnClick"
            @click="performAction"
            @close="close"/>
    <VextCircleMenu v-else-if="mode === MODES.SHAPE" v-model="open"
            :items="shapeOptions" :x="x" :y="y"
            :items-per-level="itemsPerLevel"
            :background="background"
            :z-index="zIndex"
            :close-on-click="closeOnClick"
            @click="performAction"
            @close="close"/>
</template>

<script setup>
    import VextCircleMenu from './VextCircleMenu.vue';
    import { computed } from 'vue';
    import { useVextNote } from '@/store/note';
    import { useVextSettings } from '@/store/settings';
    import { storeToRefs } from 'pinia';
    import { MODES } from '@/use/enums';

    const note = useVextNote();
    const settings = useVextSettings();
    const { mode } = storeToRefs(note)

    const props = defineProps({
        /**
         * Whether to show the menu - use with v-model.
         */
        modelValue: {
            type: Boolean,
            required: true
        },
        /**
         * Menu center position on the x axis
         */
        x: {
            type: Number,
            default: 10,
        },
         /**
         * Menu center position on the y axis
         */
        y: {
            type: Number,
            default: 10,
        },
        /**
         * Whether to close the menu after an item was clicked.
         */
        closeOnClick: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to display a background for the menu.
         */
        background: {
            type: Boolean,
            default: true
        },
        /**
         * How many items per level to allow (default 8), must be greater than 0.
         * Could be useful when doing custom rendering.
         */
        itemsPerLevel: {
            type: Number,
            default: 8,
            validator(value) {
                return value > 0;
            }
        },
        /**
         * CSS z-index to use for the menu
         */
        zIndex: {
            type: [Number, String],
            default: 300,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        }
    })
    const emit = defineEmits({
        /**
         * Called when the modelValue is updated
         * @param {Boolean} value new model value
         */
        "update:modelValue": null,
        /**
         * Called when the menu is closed via the close button or an outside click.
         */
        "close": null,
        /**
         * Called when an item is clicked - with the item as parameter.
         * @param {Object} item the item that was clicked
         */
        "click": value => value !== null && typeof value === "object"
    })

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
                icon: "mdi-numeric-1-box-outline",
                action: "brush-size",
                color: "default",
                value: 1,
            },{
                id: "size-3",
                icon: "mdi-numeric-3-box-outline",
                action: "brush-size",
                color: "default",
                value: 3,
            },{
                id: "size-5",
                icon: "mdi-numeric-5-box-outline",
                action: "brush-size",
                color: "default",
                value: 5,
            },{
                id: "size-10",
                icon: "mdi-numeric-10-box-outline",
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