<template>
    <v-navigation-drawer permanent rail>
        <v-list nav density="compact" :disabled="!enabled">
            <v-list-item :prepend-icon="open ? icons.open : icons.closed" @click="open = !open"/>
        </v-list>

        <v-divider></v-divider>

        <v-list nav density="compact" :selected="tmpMode" mandatory @update:selected="setMode" :disabled="!enabled">
            <v-list-item :active-color="selectColor" :prepend-icon="icons.layer" :value="MODES.LAYER"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.brush" :value="MODES.BRUSH"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.shape" :value="MODES.SHAPE"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.connect" :value="MODES.CONNECT"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.edit" :value="MODES.EDIT"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.whiteboard" :value="MODES.WHITEBOARD"/>
            <v-list-item :active-color="selectColor" :prepend-icon="icons.settings" :value="MODES.SETTINGS"/>
        </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="open" :temporary="floating" :width="width" class="pl-2 pr-2">
        <VextNoteConfiguration
            :icons="icons"
            :hotkeys="hotkeys"
            :hotkeyMap="hotkeyMap"
            :tooltip-delay="tooltipDelay"
            :auto-mode-switch="autoModeSwitch"
            :width="width-30"/>
    </v-navigation-drawer>

    <VextPointerMenu/>
    <VextGlobalToolTip/>
    <VextWhiteBoard :z-index="9999"/>
</template>

<script setup>
    import { storeToRefs } from 'pinia'
    import { ref, watch, computed } from 'vue';
    import { useVextNote } from '@/store/note'

    import VextNoteConfiguration from './VextNoteConfiguration.vue';
    import VextGlobalToolTip from '@/components/VextGlobalToolTip.vue';
    import VextWhiteBoard from '@/components/whiteboard/VextWhiteBoard.vue';
    import VextPointerMenu from '@/components/VextPointerMenu.vue';
    import { MODES } from '@/use/enums';

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
                    whiteboard: "mdi-human-male-board",
                    settings: "mdi-cog",
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
                    "6": "whiteboard",
                    "7": "settings",
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
        autoModeSwitch: {
            type: Boolean,
            default: true,
        }
    });

    const emit = defineEmits(["update:modelValue"])

    const note = useVextNote();
    const { mode, enabled } = storeToRefs(note);

    const tmpMode = ref([mode.value]);
    const open = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit("update:modelValue", value && enabled.value)
        }
    });

    function setMode(modeValue) {
        tmpMode.value[0] = modeValue[0];
        if (tmpMode.value[0] !== mode.value) {
            note.setMode(tmpMode.value[0]);
        } else {
            open.value = !open.value;
        }
    }
    function loadMode() {
        if (mode.value !== tmpMode.value[0]) {
            tmpMode.value = [mode.value];
        }
    }

    watch(mode, loadMode);

</script>