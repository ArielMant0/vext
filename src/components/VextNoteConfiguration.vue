<template>
    <div>
        <div :style="{ 'min-width': width+'px' }">
            <v-tabs v-model="tmpTool" density="compact" mandatory @update:modelValue="setTool">
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.layer" :value="tools.LAYER"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.brush" :value="tools.BRUSH"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.shape" :value="tools.SHAPE"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.connect" :value="tools.CONNECT"></v-tab>
                <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="icons.edit" :value="tools.EDIT"></v-tab>
            </v-tabs>

            <v-window v-model="tool">
                <v-window-item :value="tools.LAYER">
                    <KeepAlive>
                        <VextLayersTool :tooltip-delay="tooltipDelay"/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="tools.BRUSH">
                    <KeepAlive>
                        <VextBrushTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="tools.SHAPE">
                    <KeepAlive>
                        <VextShapeTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="tools.CONNECT">
                    <KeepAlive>
                        <VextConnectTool/>
                    </KeepAlive>
                </v-window-item>
                <v-window-item :value="tools.EDIT">
                    <KeepAlive>
                        <VextEditTool/>
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
    import VextConnectTool from './tools/VextConnectTool.vue';

    import { storeToRefs } from 'pinia'
    import { ref, onMounted, watch } from 'vue';
    import { useVextNote } from '@/store/note'
    import { useVextState } from '@/store/state';
    import { useVextInput } from '@/store/input';
    import { toRaw } from 'vue';

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
        autoToolSwitch: {
            type: Boolean,
            default: true,
        }
    });

    const input = useVextInput();
    const state = useVextState();
    const note = useVextNote();
    const { tool, tools, enabled } = storeToRefs(note);

    const tmpTool = ref(tool.value);
    const lastTool = ref(tool.value);

    function setTool() {
        note.setTool(tmpTool.value);
    }
    function loadTool() {
        if (tool.value !== tmpTool.value) {
            tmpTool.value = tool.value;
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
        if (props.autoToolSwitch) {
            if (type === 'pen' && tool.value !== tools.value.BRUSH) {
                lastTool.value = tool.value;
                note.setTool(tools.value.BRUSH, false);
            } else if (type !== 'pen' && tool.value === tools.value.BRUSH) {
                note.setTool(lastTool.value, false);
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
                        note.setTool(which, false);
                        break;
                    case 'object':
                        if ((which.shift && event.shift) ||
                            (which.alt && event.alt) ||
                            (which.ctrl && event.ctrl) ||
                            (which.meta && event.meta)) {
                            note.setTool(which.mode, false);
                        }
                        break;
                    case 'function':
                        if (which.validator(event)) {
                            note.setTool(which.mode, false);
                        }
                        break;
                }
            }
        }
    }

    function saveState() {
        if (note.layerMode === note.layerModeEnum.STATE) {
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
                if (note.layerMode === note.layerModeEnum.ANNOTATE) {
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

    watch(() => note.tool, loadTool);
    watch(() => note.activeLayer, loadState)

</script>
