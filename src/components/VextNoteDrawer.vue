<template>
    <v-navigation-drawer permanent rail>
        <v-list nav density="compact" :disabled="!enabled">
            <v-list-item :prepend-icon="open ? icons.open : icons.closed" @click="open = !open"/>
        </v-list>

        <v-divider></v-divider>

        <v-list nav density="compact" :selected="tmpTool" mandatory @update:selected="setTool" :disabled="!enabled">
            <v-list-item :active-color="selectColor" :prepend-icon="icons.layer" :value="tools.LAYER"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.brush" :value="tools.BRUSH"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.shape" :value="tools.SHAPE"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.connect" :value="tools.CONNECT"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.edit" :value="tools.EDIT"/>
        </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="open" :temporary="floating" :width="width" class="pl-2 pr-2">
        <VextNoteConfiguration
            :icons="icons"
            :hotkeys="hotkeys"
            :hotkeyMap="hotkeyMap"
            :tooltip-delay="tooltipDelay"
            :auto-tool-switch="autoToolSwitch"
            :width="width-30"/>
    </v-navigation-drawer>

    <VextPointerMenu :options="pointerMenuOptions"/>
    <VextGlobalToolTip/>
</template>

<script setup>
    import { storeToRefs } from 'pinia'
    import { ref, watch, computed } from 'vue';
    import { useVextNote } from '@/store/note'

    import VextNoteConfiguration from './VextNoteConfiguration.vue';
    import VextGlobalToolTip from '@/components/VextGlobalToolTip.vue';
    import VextPointerMenu from '@/components/VextPointerMenu.vue';

    const props = defineProps({
        modelValue: {
            type: Boolean,
            required: true
        },
        /**
         * Object of icons to use for tools/modes etc.
         *
         * Default is:
         * {
         *     open: "mdi-backburger",
         *     closed: "mdi-forwardburger",
         *     layer: "mdi-layers",
         *     brush: "mdi-draw",
         *     shape: "mdi-shape",
         *     connect: "mdi-connection",
         *     edit: "mdi-cursor-pointer",
         * }
         */
        icons: {
            type: Object,
            default() {
                return {
                    open: "mdi-backburger",
                    closed: "mdi-forwardburger",
                    layer: "mdi-layers",
                    brush: "mdi-draw",
                    shape: "mdi-shape",
                    connect: "mdi-connection",
                    edit: "mdi-cursor-pointer",
                }
            }
        },
        /**
         * The width of the drawer (when opened).
         */
         width: {
            type: [Number, String],
            default: 320,
            validator(value) {
                return +value >= 0;
            }
        },
        /**
         * How to color the icons in the small nav bar when they are selected.
         */
        selectColor: {
            type: String,
            default: "default"
        },
        /**
         * Whether this component should take up space or float.
         */
        floating: {
            type: Boolean,
            default: true,
        },
        /**
         * Whether to use keyboard shortcuts (hotkeys) for tool switching.
         */
        hotkeys: {
            type: Boolean,
            default: false,
        },
        /**
         * Hotkey map to use when using hotkeys for tool switching.
         * By default, these are the 1, 2, 3, 4 keys are used for the layer,
         * brush, shape and edit tool respectively. The object should have the key
         * code as returned by the keydown event "key" property as key and the tool id
         * as value.
         */
        hotkeyMap: {
            type: Object,
            default() {
                return {
                    "1": "layer",
                    "2": "brush",
                    "3": "shape",
                    "4": "connect",
                    "5": "edit",
                }
            }
        },
        /**
         * The delay with which to open tooltips on hover (default 500).
         */
        tooltipDelay: {
            type: [Number, String],
            default: 500,
            validator(value) {
                return +value >= 0;
            }
        },
        /**
         * Whether to switch between brush and other modes automatically, depending
         * on whether the pen is used to interact (or the mouse/touch).
         */
        autoToolSwitch: {
            type: Boolean,
            default: true,
        }
    });

    const emit = defineEmits(["update:modelValue"])

    const note = useVextNote();
    const { tool, tools, enabled } = storeToRefs(note);

    const tmpTool = ref([tool.value]);
    const open = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit("update:modelValue", value && enabled.value)
        }
    });

    const pointerMenuOptions = [
        {
            id: "undo",
            icon: "mdi-undo",
            action: "undo",
            color: "default",
        },{
            id: "redo",
            icon: "mdi-redo",
            action: "redo",
            color: "default",
        },{
            id: "accept",
            icon: "mdi-check",
            action: "accept",
            color: "success",
        },{
            id: "accept_ignore",
            icon: "mdi-check-all",
            action: "accept_ignore",
            color: "success",
        },{
            id: "cancel",
            icon: "mdi-close-circle-outline",
            action: "cancel",
            color: "error",
        },{
            id: "cancel_ignore",
            icon: "mdi-close-circle-multiple-outline",
            action: "cancel_ignore",
            color: "error",
        },{
            id: "brush",
            icon: "mdi-draw",
            action: "mode"
        },{
            id: "shape",
            icon: "mdi-shape",
            action: "mode"
        },{
            id: "edit",
            icon: "mdi-cursor-pointer",
            action: "mode"
        },{
            id: "layer",
            icon: "mdi-layers",
            action: "mode"
        },{
            id: "connect",
            icon: "mdi-connection",
            action: "mode"
        }
    ];

    function setTool(toolValue) {
        tmpTool.value[0] = toolValue[0];
        if (tmpTool.value[0] !== tool.value) {
            note.setTool(tmpTool.value[0]);
        } else {
            open.value = !open.value;
        }
    }
    function loadTool() {
        if (tool.value !== tmpTool.value[0]) {
            tmpTool.value = [tool.value];
        }
    }

    watch(() => note.tool, loadTool);

</script>