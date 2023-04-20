<template>
    <div :style="{ 'min-width': width+'px' }">
        <v-tabs v-model="tmpTool" density="compact" mandatory @update:modelValue="setTool">
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.layerIcon" :value="tools.LAYER"></v-tab>
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.brushIcon" :value="tools.BRUSH"></v-tab>
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.shapeIcon" :value="tools.SHAPE"></v-tab>
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.editIcon" :value="tools.EDIT"></v-tab>
        </v-tabs>

        <v-window v-model="tool">
            <v-window-item :value="tools.LAYER">
                <KeepAlive>
                    <VextLayersTool :tooltip-delay="tooltipDelay"/>
                </KeepAlive>
            </v-window-item>
            <v-window-item :value="tools.EDIT">
                <KeepAlive>
                    <VextEditTool/>
                </KeepAlive>
            </v-window-item>
            <v-window-item :value="tools.BRUSH">
                <KeepAlive>
                    <VextBrushTool/>
                </KeepAlive>
            </v-window-item>
            <v-window-item :value="tools.SHAPE">
                <KeepAlive>
                    <VextShapeTool @select="onTextSelect" @deselect="onTextDeselect"/>
                </KeepAlive>
            </v-window-item>
        </v-window>
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

    import { storeToRefs } from 'pinia'
    import { ref, onMounted, watch } from 'vue';
    import { useVextNote } from '@/store/note'
    import { useVextState } from '@/store/state';

    const props = defineProps({
        /**
         * The width of this component.
         */
         width: {
            type: Number,
            default: 280
        },
        /**
         * Vuetify icon for the layers tool
         */
        layerIcon: {
            type: String,
            default: "mdi-layers"
        },
        /**
         * Vuetify icon for the edit tool
         */
        editIcon: {
            type: String,
            default: "mdi-cursor-pointer"
        },
        /**
         * Vuetify icon for the shape tool
         */
        shapeIcon: {
            type: String,
            default: "mdi-shape"
        },
        /**
         * Vuetify icon for the brush tool
         */
        brushIcon: {
            type: String,
            default: "mdi-draw"
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
                    "4": "edit",
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

    const state = useVextState();
    const note = useVextNote();
    const { tool, tools, enabled } = storeToRefs(note);
    const tmpTool = ref(tool.value);

    const activeText = ref(null);
    const lastTool = ref(tool.value);

    function setTool() {
        note.setTool(tmpTool.value);
    }
    function loadTool() {
        if (tool.value !== tmpTool.value) {
            tmpTool.value = tool.value;
        }
    }

    function updateTextNode(key) {
        const text = activeText.value.text;

        switch(key) {
            case "Backspace":
                activeText.value.set("text", text.slice(0, text.length-1));
                break;
            case "Enter":
                activeText.value.set("text", text + "\n");
                break;
            case "Delete": case "Control": case "Shift": case "CapsLock":
            case "Escape": case "PrintScreen": case "ScrollLock": case "Pause":
            case "NumLock": case "ArrowUp": case "ArrowDown": case "ArrowLeft":
            case "ArrowRight": case "Clear": case "Home": case "PageUp":
            case "PageDown": case "Insert": case "ContextMenu": case "Meta":
            case "F1": case "F2": case "F3": case "F4":
            case "F5": case "F6": case "F7": case "F8": case "F9":
                break;
            default:
                activeText.value.set("text", text + key)
        }
        note.canvas.requestRenderAll();
    }

    function init() {
        window.addEventListener("keyup", onKeyUp);
        setToolSwitch();
    }

    function onPointerDown(event) {
        const type = event.pointerType;
        if (type === 'pen' && tool.value !== tools.value.BRUSH) {
            lastTool.value = tool.value;
            note.setTool(tools.value.BRUSH, false);
        } else if (type !== 'pen' && tool.value === tools.value.BRUSH) {
            note.setTool(lastTool.value, false);
        }
    }

    function onKeyUp(event) {
        const focus = document.activeElement;
        if (!enabled.value || (focus !== null && focus.tagName === "INPUT")) return;

        if (focus !== null) focus.blur()

        if (activeText.value !== null && event.key !== "Delete") {
            updateTextNode(event.key)
        } else if (event.key === "Delete" || event.key === "Backspace") {
            note.deleteCurrentObj();
        } else {
            const which = props.hotkeyMap[event.key];
            if (which) {
                switch (typeof which) {
                    case 'string':
                        note.setTool(which, false);
                        break;
                    case 'object':
                        if ((which.shift && event.shiftKey) ||
                            (which.alt && event.altKey) ||
                            (which.ctrl && event.ctrlKey) ||
                            (which.meta && event.metaKey)) {
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

    function setToolSwitch() {
        if (props.autoToolSwitch) {
            window.addEventListener("pointerdown", onPointerDown);
        } else {
            window.removeEventListener("pointerdown", onPointerDown)
        }
    }

    function onTextSelect(obj) { activeText.value = obj; }
    function onTextDeselect() { activeText.value = null; }

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
                note.setState(state.exportState(true))
            } else {
                // set state and hide current layer
                note.setState(state.exportState(false))
                note.setLayerVisibility(false);
            }
        }
    }

    function loadState() {
        if (note.currentLayer !== null) {
            state.loadState(note.currentLayer.state.state)
        }
    }

    onMounted(init);

    watch(() => state.hash, saveState)
    watch(() => note.tool, loadTool);
    watch(() => note.activeLayer, loadState)

    watch(() => props.autoToolSwitch, setToolSwitch)

</script>
