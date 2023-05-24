<template>
    <div>
        <div :style="{ 'min-width': width+'px' }">
            <v-tabs v-model="tmpMode" density="compact" mandatory @update:modelValue="setMode">
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.layer" :value="MODES.LAYER"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.brush" :value="MODES.BRUSH"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.shape" :value="MODES.SHAPE"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.connect" :value="MODES.CONNECT"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.edit" :value="MODES.EDIT"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.whiteboard" :value="MODES.WHITEBOARD"></v-tab>
            </v-tabs>

            <v-window v-model="mode" continuous>
                <v-window-item :value="MODES.LAYER">
                    <KeepAlive :max="1">
                        <VextLayersTool :tooltip-delay="tooltipDelay"/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="MODES.BRUSH">
                    <KeepAlive :max="1">
                        <VextBrushTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="MODES.SHAPE">
                    <KeepAlive :max="1">
                        <VextShapeTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="MODES.CONNECT">
                    <KeepAlive :max="1">
                        <VextConnectTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="MODES.EDIT">
                    <KeepAlive :max="1">
                        <VextEditTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="MODES.WHITEBOARD">
                    <KeepAlive :max="1">
                        <VextWhiteBoardTool/>
                    </KeepAlive>
                </v-window-item>
            </v-window>
        </div>
    </div>
</template>

<script setup>
    /**
     * Component that includes all tools and handles state transfer from
     * the state store to the note store.
     */
    import VextEditTool from '@/components/tools/VextEditTool.vue';
    import VextBrushTool from '@/components/tools/VextBrushTool.vue';
    import VextShapeTool from '@/components/tools/VextShapeTool.vue';
    import VextLayersTool from '@/components/tools/VextLayersTool.vue';
    import VextConnectTool from '@/components/tools/VextConnectTool.vue';
    import VextWhiteBoardTool from './tools/VextWhiteBoardTool.vue';

    import { storeToRefs } from 'pinia'
    import { ref, onMounted, watch } from 'vue';
    import { useVextNote } from '@/store/note'
    import { useVextState } from '@/store/state';
    import { useVextInput } from '@/store/input';
    import { LAYER_MODES, MODES } from '@/use/enums';

    const props = defineProps({
        /**
         * The width of this component.
         */
         width: {
            type: Number,
            default: 280
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
                }
            }
        },
        /**
         * How to color the icons in the small nav bar when they are selected.
         */
        selectColor: {
            type: String,
            default: "black"
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
        autoModeSwitch: {
            type: Boolean,
            default: true,
        }
    });

    const input = useVextInput();
    const state = useVextState();
    const note = useVextNote();
    const { mode, enabled } = storeToRefs(note);

    const tmpMode = ref(mode.value);
    const lastMode = ref(mode.value);

    function setMode() {
        note.setMode(tmpMode.value);
    }
    function loadMode() {
        if (mode.value !== tmpMode.value) {
            tmpMode.value = mode.value;
        }
    }

    function init() {
        input.init();
        input.on("pointerdown", onPointerDown)
        input.on("keydown", onKeyDown)
        state.on("change", saveState);
    }

    function onPointerDown() {
        const type = input.pointerDownType;
        if (props.autoModeSwitch) {
            if (type === 'pen' && mode.value !== MODES.BRUSH) {
                lastMode.value = mode.value;
                note.setMode(MODES.BRUSH, false);
            } else if (type !== 'pen' && mode.value === MODES.BRUSH) {
                note.setMode(lastMode.value, false);
            }
        }
    }

    function onKeyDown() {
        const focus = document.activeElement;
        const active = note.getActiveObject();

        if (!enabled.value || (focus !== null && focus.tagName === "INPUT") ||
            (active && active.isEditing)) return;

        if (focus !== null) focus.blur()

        const event = input.getKey(true);

        if (event.key === "Delete" || event.key === "Backspace") {
            note.deleteActiveObject();
        } else {
            const which = props.hotkeyMap[event.key];
            if (which) {
                switch (typeof which) {
                    case 'string':
                        note.setMode(which, false);
                        break;
                    case 'object':
                        if ((which.shift && event.shift) ||
                            (which.alt && event.alt) ||
                            (which.ctrl && event.ctrl) ||
                            (which.meta && event.meta)) {
                            note.setMode(which.mode, false);
                        }
                        break;
                    case 'function':
                        if (which.validator(event)) {
                            note.setMode(which.mode, false);
                        }
                        break;
                }
            }
        }
    }

    function saveState() {
        if (note.layerMode === LAYER_MODES.STATE) {
            const layer = note.layerFromStateHash(state.hash);
            if (layer) {
                note.setActiveLayer(layer.id);
                note.setState(state.exportState(true))
            } else {
                note.addLayer(state.exportState(true), false)
            }
        } else {
            const layer = note.layerFromStateHash(state.hash);
            if (layer) {
                // load matching layer
                note.setActiveLayer(layer.id);
                note.setState(state.exportState(true));
            } else {
                // set state and hide current layer
                note.setState(state.exportState(false));
                if (note.layerMode === LAYER_MODES.ANNOTATE) {
                    note.selectPreviewLayer();
                }
            }
        }
    }

    function loadState() {
        if (note.currentLayer !== null) {
            state.loadState(note.currentLayer.state.state)
        }
    }

    onMounted(init);

    watch(mode, loadMode);
    watch(() => note.activeLayer, loadState)

</script>
