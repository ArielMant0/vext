<template>
    <div style="min-width: 280px">
        <v-tabs v-model="tmpTool" density="compact" mandatory @update:modelValue="setTool">
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.layerIcon" :value="tools.LAYER"></v-tab>
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.brushIcon" :value="tools.BRUSH"></v-tab>
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.shapeIcon" :value="tools.SHAPE"></v-tab>
            <v-tab :color="selectColor" style="min-width: 50px;padding: 0 4px 0 16px;" :prepend-icon="props.editIcon" :value="tools.EDIT"></v-tab>
        </v-tabs>

        <v-window v-model="tool">
            <v-window-item :value="tools.LAYER">
                <KeepAlive>
                    <VextLayersTool/>
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
            default: "blue"
        },
    });

    const state = useVextState();
    const note = useVextNote();
    const { tool, tools } = storeToRefs(note);
    const tmpTool = ref(tool.value);

    const activeText = ref(null);

    function setTool() { note.setTool(tmpTool.value); }
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
            default:
                activeText.value.set("text", text + key)
        }
        note.canvas.requestRenderAll();
    }

    function init() {
        window.onkeyup = function(event) {
            if (activeText.value !== null && event.key !== "Delete") {
                updateTextNode(event.key)
            } else if (event.key === "Delete" || event.key === "Backspace") {
                note.deleteCurrentObj();
            }
        };
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
            note.setState(state.exportState(false))
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

</script>
