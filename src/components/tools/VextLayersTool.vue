<template>
    <div>
        <div class="text-caption">layer opacity</div>
        <div style="display: flex; justify-content: end;" class="mt-2">
            <v-slider v-model="opacity" prepend-icon="mdi-opacity" class="mr-4"
                min="0" max="1" thumb-size="15" hide-details/>
            <div>
                <v-tooltip text="add a new annotation layer" location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-plus" color="primary" size="x-small" rounded="0" @click="openAddDialog" class="me-1"></v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="delete the active annotation layer" location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-delete" color="error" size="x-small" rounded="0" @click="openDelDialog"></v-btn>
                    </template>
                </v-tooltip>
            </div>
        </div>

        <v-tooltip>
            when layers should be added<br/>
            ... when the state changed and you annotate<br/>
            ... when the state changed (without annotations)<br/>
            ... manually
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    layer mode
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-select v-model="layerMode" :items="layerModeValues" density="compact" class="no-input-details mb-2"></v-select>

        <v-expansion-panels class="mt-3 mb-3" density="compact">
        <v-expansion-panel title="Actions">
        <v-expansion-panel-text>

        <v-tooltip text="remove all layers that contain no annotations (one will always remain)">
            <template v-slot:activator="{ props }">
                <div class="text-caption">
                    remove layers without annotations
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
                <v-btn size="small" @click="removeEmptyLayers" class="mb-1" color="primary">remove empty layers</v-btn>
            </template>
        </v-tooltip>

        <v-tooltip text="save the application state to the current layer">
            <template v-slot:activator="{ props }">
                <div class="text-caption">
                    save state
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
                <div class="mb-1">
                    <v-btn size="small" @click="saveState" color="primary">save state</v-btn>
                    <v-btn v-if="dataChange" size="small" class="ml-1 blob" color="error" density="compact" rounded="0" icon>
                        <v-icon>mdi-exclamation-thick</v-icon>
                        <v-tooltip activator="parent" location="end">state has (unsaved) changes</v-tooltip>
                    </v-btn>
                </div>
            </template>
        </v-tooltip>

        <div  class="mb-1">

            <v-tooltip text="import a layer from a previously exported layer file (JSON)">
                <template v-slot:activator="{ props }">
                    <div class="text-caption">
                        import layer
                        <v-icon size="small" icon="mdi-information" v-bind="props"/>
                    </div>
                    <v-file-input label="layer JSON file" accept="application/json" @update:model-value="files => note.importLayer(files[0])"></v-file-input>
                </template>
            </v-tooltip>

            <v-tooltip text="export the current layer, visualizations and application state to a .zip file">
                <template v-slot:activator="{ props }">
                    <div class="text-caption">
                        export to zip
                        <v-icon size="small" icon="mdi-information" v-bind="props"/>
                    </div>
                    <v-btn size="small" @click="note.exportZIP()" color="default">export</v-btn>
                </template>
            </v-tooltip>

        </div>

        </v-expansion-panel-text>
        </v-expansion-panel>
        </v-expansion-panels>

        <v-tooltip text="only show layers that you have already annotated">
            <template v-slot:activator="{ props }">
                <div class="text-caption">
                    only show layers with annotations
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-checkbox v-model="filterLayers" density="compact" class="mb-1" hide-details></v-checkbox>

        <v-tooltip text="layers that store the application state and annotations - click to select a layer">
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    layers
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>

        <v-item-group mandatory :multiple="false">
            <v-item v-for="(layer, idx) in layers" :key="idx" :value="layer.id">
                <v-card v-if="!filterLayers || layer.group.length > 0"
                    :variant="activeLayer === layer.id ? 'elevated' : 'tonal'"
                    class="mb-2 vext-layer-card" style="width: 99%"
                    >
                    <v-card-title class="vext-layer">
                        <span>
                            <v-badge :content="layer.group.length" inline :color="layer.color" style="line-height: .9rem;"></v-badge>
                            <v-icon :icon="activeLayer === layer.id ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'" @click="selectLayer(layer.id)"/>
                        </span>
                        <span class="vext-layer-selector" @click="toggleLayerOpen(layer.id)">{{ layer.id }}</span>
                        <v-icon :icon="layer.visible ? 'mdi-eye' : 'mdi-eye-off'" @click="changeVisibility(layer.id, !layer.visible)"></v-icon>
                    </v-card-title>
                    <v-card-text v-if="layerUI.open[layer.id]">
                        <vue-json-pretty :data="JSON.parse(layer.state.state)" :showDoubleQuotes="false" :deep="treeDepth" @nodeClick="updateTreeDepth"/>
                    </v-card-text>
                </v-card>
            </v-item>
        </v-item-group>

        <v-dialog v-model="addDialog" width="auto">
            <v-card title="Add a new layer">
                <v-card-text>
                    <v-text-field v-model="layerID" label="layer name" variant="outlined"></v-text-field>
                    <v-color-picker v-model="layerColor" hide-inputs></v-color-picker>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="warning" @click="addDialog = false">cancel</v-btn>
                    <v-btn color="success" @click="addLayer">add</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="delDialog" width="auto">
            <v-card>
                <v-card-text>
                    Are you sure you want to delete <b>{{ activeLayer }}</b>?
                </v-card-text>
                <v-card-actions>
                    <v-btn color="warning" @click="delDialog = false">cancel</v-btn>
                    <v-btn color="error" @click="removeLayer">remove</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
    /**
     * Component that displays layer and state information. Let's the user
     * switch between layers, select the layer mode, etc.
     */
    import { ref, watch, computed, reactive } from 'vue';
    import { useVextNote } from '@/store/note';
    import { storeToRefs } from 'pinia';
    import { useVextState } from '@/store/state';

    const addDialog = ref(false);
    const delDialog = ref(false);

    const filterLayers = ref(false);
    const layerColor = ref("#ddd")
    const layerID = ref("new layer");
    const opacity = ref(1);
    const treeDepth = ref(0);

    const layerUI = reactive({
        open: {},
    });

    const state = useVextState();

    const note = useVextNote();
    const { layers, activeLayer, layerMode, layerModeValues } = storeToRefs(note);

    const dataChange = computed(() => {
        return note.currentLayer !== null && state.hash !== null &&
            note.currentLayer.state.hash !== state.hash;
    })

    function changeOpacity() {
        note.setLayerOpacity(opacity.value)
    }
    function changeVisibility(id, visible) {
        note.setLayerVisibility(visible, id)
    }
    function addLayer() {
        addDialog.value = false;
        const s = state.exportState();
        note.addLayer(s, false, layerID.value, layerColor.value);
    }
    function removeLayer() {
        delDialog.value = false;
        setTimeout(note.removeLayer, 100);
    }

    function activeLayerChange() {
        const layer = note.currentLayer;
        opacity.value = layer !== null ? layer.opacity : 1;
        layerUI.open = {}
        layerUI.open[layer.id] = true;
    }
    function toggleLayerOpen(id) {
        layerUI.open[id] = !layerUI.open[id];
    }

    function openAddDialog() {
        layerColor.value = note.nextColor;
        layerID.value = note.nextID;
        addDialog.value = true;
    }
    function openDelDialog() { delDialog.value = true; }

    function selectLayer(id) { note.setActiveLayer(id) }
    function removeEmptyLayers() { note.removeEmptyLayers(); }
    function saveState() { note.overwriteState(state.exportState()); }

    function updateTreeDepth(node) {
        const collaped = node.type.endsWith("Collapsed")
        treeDepth.value = collaped ?
            Math.min(node.level, treeDepth.value) :
            Math.max(node.level+1, treeDepth.value)
    }

    watch(() => note.activeLayer, activeLayerChange);
    watch(() => opacity.value, changeOpacity);

</script>

<style>
.vext-layer {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
}
.vext-layer-selector { cursor: pointer; }
.vext-layer-selector:hover { font-weight: bolder; }
.vext-layer-card { max-width: 285px; }

.vext-blob {
    cursor: default;
	animation: wiggle 2s infinite;
}

@keyframes wiggle {
  0%, 7% {
    transform: rotateZ(0);
  }
  15% {
    transform: rotateZ(-15deg);
  }
  20% {
    transform: rotateZ(10deg);
  }
  25% {
    transform: rotateZ(-10deg);
  }
  30% {
    transform: rotateZ(6deg);
  }
  35% {
    transform: rotateZ(-4deg);
  }
  40%, 100% {
    transform: rotateZ(0);
  }
}

.vext-layer-card .v-badge {
    line-height: inherit;
}
</style>
