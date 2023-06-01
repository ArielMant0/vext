<template>
    <VextCircleMenu v-if="mode === MODES.BRUSH || isWbBrush" v-model="open"
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

    <v-card v-if="showColorPicker" density="compact" rounded="sm"
        :style="{ 'position': 'fixed', 'left': cpX+'px', 'top': cpY+'px', 'z-index': zIndex+2 }">
        <v-card-text>
            <v-color-picker v-model="tmpColor" hide-inputs/>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
            <v-btn icon="mdi-close"
                color="error"
                size="x-small"
                rounded="sm"
                variant="tonal"
                @click="cancelColor"/>
            <v-btn icon="mdi-check"
                color="success"
                size="x-small"
                rounded="sm"
                variant="tonal"
                @click="chooseColor"/>
        </v-card-actions>
    </v-card>
</template>

<script setup>
    import VextCircleMenu from './VextCircleMenu.vue';
    import { ref, computed } from 'vue';
    import { useVextNote } from '@/store/note';
    import { useVextSettings } from '@/store/settings';
    import { storeToRefs } from 'pinia';
    import { ACTIONS, MODES } from '@/use/enums';
    import { useVextWhiteboard } from '..';

    const note = useVextNote();
    const settings = useVextSettings();
    const wb = useVextWhiteboard();

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

    const isWbBrush = computed(() => {
        return mode.value === MODES.WHITEBOARD && wb.mode === MODES.BRUSH;
    })
    const showColorPicker = ref(false);
    const tmpColor = ref(settings.color);

    const cpX = computed(() => {
        return props.x + 350 < window.innerWidth ? props.x : props.x - 350;
    });
    const cpY = computed(() => {
        return props.y + 350 < window.innerHeight ? props.y : props.y - 350;
    });

    const brushOptions = computed(() => {
        return [
            {
                id: "color-primary",
                icon: "mdi-palette",
                action: ACTIONS.COLOR_CHANGE,
                color: settings.color0,
                value: 0,
                border: settings.activeColor === 0,
            },{
                id: "color-secondary",
                icon: "mdi-palette",
                action: ACTIONS.COLOR_CHANGE,
                color: settings.color1,
                value: 1,
                border: settings.activeColor === 1,
            },{
                id: "choose-color",
                icon: "mdi-select-color",
                action: ACTIONS.COLOR_VALUE,
                color: settings.color,
                value: 1,
            },{
                id: "size-1",
                icon: "mdi-numeric-1-box-outline",
                action: ACTIONS.BRUSH_SIZE,
                color: "default",
                value: 1,
            },{
                id: "size-3",
                icon: "mdi-numeric-3-box-outline",
                action: ACTIONS.BRUSH_SIZE,
                color: "default",
                value: 3,
            },{
                id: "size-5",
                icon: "mdi-numeric-5-box-outline",
                action: ACTIONS.BRUSH_SIZE,
                color: "default",
                value: 5,
            },{
                id: "size-10",
                icon: "mdi-numeric-10-box-outline",
                action: ACTIONS.BRUSH_SIZE,
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
                action: ACTIONS.SHAPE,
                color: "default",
                value: "text",
            },{
                id: "shape-circle",
                icon: "mdi-circle",
                action: ACTIONS.SHAPE,
                color: "default",
                value: "circle",
            },{
                id: "shape-rectangle",
                icon: "mdi-rectangle",
                action: ACTIONS.SHAPE,
                color: "default",
                value: "rectangle",
            },{
                id: "shape-triangle",
                icon: "mdi-triangle",
                action: ACTIONS.SHAPE,
                color: "default",
                value: "triangle",
            },{
                id: "color-primary",
                icon: "mdi-palette",
                action: ACTIONS.COLOR_CHANGE,
                color: settings.color0,
                value: 0,
                border: settings.activeColor === 0,
            },{
                id: "color-secondary",
                icon: "mdi-palette",
                action: ACTIONS.COLOR_CHANGE,
                color: settings.color1,
                value: 1,
                border: settings.activeColor === 1,
            }
        ]
    });

    function performAction(item) {
        switch (item.action) {
            case ACTIONS.COLOR_CHANGE:
                settings.selectColor(item.value);
                break;
            case ACTIONS.COLOR_VALUE:
                tmpColor.value = settings.color;
                showColorPicker.value = true;
                break;
            case ACTIONS.SHAPE:
                settings.setShape(item.value);
                break;
            case ACTIONS.BRUSH_SIZE:
                settings.setBrushSize(item.value);
                break;
        }
        emit("click", item)
    }

    function chooseColor() {
        showColorPicker.value = false;
        settings.setColor(tmpColor.value);
        if (props.closeOnClick) {
            open.value = false;
        }
    }
    function cancelColor() {
        showColorPicker.value = false;
        if (props.closeOnClick) {
            open.value = false;
        }
    }

    function close() {
        open.value = false;
        emit("close")
    }
</script>