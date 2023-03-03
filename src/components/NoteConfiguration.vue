<template>
    <div style="min-width: 280px">
        <v-tabs v-model="tmpTool" density="compact" mandatory @update:modelValue="setTool">
            <v-tab prepend-icon="mdi-layers" :value="tools.LAYER"></v-tab>
            <v-tab prepend-icon="mdi-draw" :value="tools.BRUSH"></v-tab>
            <v-tab prepend-icon="mdi-shape" :value="tools.SHAPE"></v-tab>
            <v-tab prepend-icon="mdi-cursor-pointer" :value="tools.EDIT"></v-tab>
            <!-- <v-tab prepend-icon="mdi-lasso" :value="tools.SELECT"></v-tab> -->
        </v-tabs>

        <v-window v-model="tool">
            <v-window-item :value="tools.LAYER">
                <LayersTool/>
            </v-window-item>
            <v-window-item :value="tools.EDIT">
                <EditTool/>
            </v-window-item>
            <v-window-item :value="tools.BRUSH">
                <BrushTool/>
            </v-window-item>
            <v-window-item :value="tools.SHAPE">
                <ShapeTool :onSelect="onTextSelect" :onDeselect="onTextDeselect"/>
            </v-window-item>
        </v-window>
    </div>
</template>

<script>
import EditTool from '@/components/tools/EditTool.vue';
import BrushTool from '@/components/tools/BrushTool.vue';
import ShapeTool from '@/components/tools/ShapeTool.vue';
import LayersTool from '@/components/tools/LayersTool.vue';

import { storeToRefs } from 'pinia'
import { ref, onMounted, watch } from 'vue';
import { useNote } from '@/store/note'
import { useState } from '@/store/state';

export default {

    components: { EditTool, BrushTool, ShapeTool, LayersTool },
    setup() {

        const state = useState();
        const note = useNote();
        const { tool, tools } = storeToRefs(note);
        const tmpTool = ref(tool.value);

        const activeText = ref(null);

        function setTool() { note.setTool(tmpTool.value); }

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
        watch(() => note.activeLayer, loadState)

        return {
            tool,
            tmpTool,
            tools,
            activeText,
            setTool,
            onTextSelect,
            onTextDeselect
        }
    },
}
</script>

<style scoped>
.v-tab.v-tab {
    min-width: 50px;
    padding: 0 4px 0 16px;
}
</style>