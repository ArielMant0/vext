<template>
    <div>
        <div class="text-caption">layer opacity</div>
        <div style="display: flex; justify-content: end;" class="mt-2">
            <v-slider v-model="opacity" prepend-icon="mdi-opacity" class="mr-4"
                min="0" max="1" thumb-size="15" hide-details/>
            <div>
                <v-tooltip text="add a new annotation layer" location="bottom" :open-delay="tooltipDelay">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-plus" color="primary" size="x-small" rounded="0" @click="openAddDialog" class="me-1"></v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="delete the active annotation layer" location="bottom" :open-delay="tooltipDelay">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-delete" color="error" size="x-small" rounded="0" @click="openDelDialog"></v-btn>
                    </template>
                </v-tooltip>
            </div>
        </div>

        <v-tooltip :open-delay="tooltipDelay">
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

        <div class="text-caption">layer actions</div>
        <div class="d-flex mb-2">

            <v-tooltip text="only show layers that you have already annotated" :open-delay="tooltipDelay">
                <template v-slot:activator="{ props }">
                    <v-icon
                        :icon="filterLayers ? 'mdi-filter' : 'mdi-filter-off'"
                        v-bind="props"
                        @click="filterLayers = !filterLayers"/>
                </template>
            </v-tooltip>

            <v-tooltip text="remove all layers that contain no annotations (one will always remain)" :open-delay="tooltipDelay">
                <template v-slot:activator="{ props }">
                    <v-icon
                        icon="mdi-silverware-clean"
                        v-bind="props"
                        @click="removeEmptyLayers"/>
                </template>
            </v-tooltip>

            <v-tooltip text="export the current layer, visualizations and application state to a .zip archive" :open-delay="tooltipDelay">
                <template v-slot:activator="{ props }">
                    <v-icon
                        icon="mdi-download"
                        @click="note.exportZIP()"
                        v-bind="props"/>
                </template>
            </v-tooltip>

            <v-tooltip text="import a layer from a previously exported layer file (JSON)" :open-delay="tooltipDelay">
                <template v-slot:activator="{ props }">
                    <v-icon
                        icon="mdi-upload"
                        v-bind="props"
                        @click="importDialog = true"/>
                </template>
            </v-tooltip>
        </div>

        <v-text-field
            v-model="searchLayers"
            class="mb-2" clearable
            hide-details density="compact"
            placeholder="search layer comments .."
            append-inner-icon="mdi-magnify"
            @click:append-inner="filterSearchLayers"
            @click:clear="filterSearchLayers"/>

        <v-tooltip text="layers that store the application state and annotations - click the checkbox to select a layer"  :open-delay="tooltipDelay">
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    layers
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>

        <v-item-group mandatory :multiple="false">
            <v-item v-for="layer in layerSearch" :key="layer.id" :value="layer.id">
                <v-card v-if="!filterLayers || layer.group.length > 0"
                    :variant="activeLayer === layer.id ? 'elevated' : 'tonal'"
                    class="mb-2 vext-layer-card" style="width: 99%"
                    >
                    <v-card-title class="vext-layer">
                        <span>
                            <v-badge :content="layer.group.length" inline :color="layer.color" style="line-height: .9rem;"></v-badge>
                            <v-tooltip text="click to select this layer" location="top" :open-delay="tooltipDelay">
                                <template v-slot:activator="{ props }">
                                    <v-icon v-bind="props" :icon="activeLayer === layer.id ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'" @click="selectLayer(layer.id)"/>
                                </template>
                            </v-tooltip>
                        </span>
                        <v-tooltip text="click to toggle layer info panel" location="top" :open-delay="tooltipDelay">
                            <template v-slot:activator="{ props }">
                                <span v-bind="props" class="vext-layer-selector" @click="toggleLayerOpen(layer.id)">{{ layer.id }}</span>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="click to toggle layer visibility" location="top" :open-delay="tooltipDelay">
                            <template v-slot:activator="{ props }">
                                <v-icon v-bind="props" :icon="layer.visible ? 'mdi-eye' : 'mdi-eye-off'" @click="changeVisibility(layer.id, !layer.visible)"></v-icon>
                            </template>
                        </v-tooltip>
                    </v-card-title>

                    <v-card-text v-if="layerUI.open[layer.id]">
                        <v-sheet v-if="layer.id !== activeLayer">
                            <v-btn size="x-small" color="error" @click="mergeLayers(layer.id)">merge into active layer</v-btn>
                        </v-sheet>
                        <v-sheet>
                            <div class="text-caption">layer id:</div>
                            <v-text-field class="mb-2"
                                v-model="layerUI.name[layer.id]" hide-details density="compact"
                                append-icon="mdi-sync"
                                @click:append="setLayerName(layer.id)"/>
                        </v-sheet>
                        <v-sheet>
                            <div class="text-caption">comments:</div>
                            <v-text-field v-for="(c, idx) in layer.comments" :model-value="c"
                                @update:model-value="content => updateLayerComment(layer.id, idx, content)"
                                hide-details density="compact" class="mb-1"
                                append-inner-icon="mdi-delete" variant="outlined"
                                @click:append-inner="removeLayerComment(layer.id, idx)"/>
                            <v-text-field v-model="layerUI.comment[layer.id]"
                                placeholder="add a comment .."
                                hide-details density="compact"
                                append-inner-icon="mdi-plus" variant="outlined"
                                @click:append-inner="addLayerComment(layer.id)"/>
                        </v-sheet>
                        <v-sheet>
                            <div class="text-caption">application state:</div>
                            <vue-json-pretty :data="JSON.parse(layer.state.state)" :showDoubleQuotes="false" :deep="treeDepth" @nodeClick="updateTreeDepth"/>
                        </v-sheet>
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

        <v-dialog v-model="mergeDialog" width="auto">
            <v-card title="Merge layers">
                <v-card-text>
                    Are you sure you want to merge layer
                    <b>{{ mergeLayer }}</b> into layer
                    <b>{{ activeLayer }}</b>?<br/>
                    The state from layer <b>{{ mergeLayer }}</b> will be lost.
                </v-card-text>
                <v-card-actions>
                    <v-btn color="warning" @click="mergeDialog = false">cancel</v-btn>
                    <v-btn color="error" @click="executeMergeLayers">merge</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="importDialog" width="auto">
            <v-card title="Import Layer">
                <v-card-text>
                    Choose a file from you computer..
                    <v-file-input
                        label="layer file"
                        accept="application/json"
                        density="compact"
                        hide-details
                        class="mb-1"
                        @update:model-value="files => note.importLayer(files[0])"></v-file-input>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="warning" @click="importDialog = false">cancel</v-btn>
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
    const mergeDialog = ref(false);
    const importDialog = ref(false);
    const searchLayers = ref("");
    const searchTerm = ref("");
    const mergeLayer = ref("");

    const filterLayers = ref(false);
    const layerColor = ref("#ddd")
    const layerID = ref("new layer");
    const opacity = ref(1);
    const treeDepth = ref(0);

    const props = defineProps({
        tooltipDelay: {
            type: [Number, String],
            default: 500,
            validator(value) {
                return +value >= 0;
            }
        }
    })

    const layerUI = reactive({
        open: {},
        comment: {},
        name: {}
    });

    const state = useVextState();

    const note = useVextNote();
    const { activeLayer, layerMode, layerModeValues } = storeToRefs(note);

    const dataChange = computed(() => {
        return note.currentLayer !== null && state.hash !== null &&
            note.currentLayer.state.hash !== state.hash;
    })

    const layerSearch = computed(() => {
        if (!searchTerm.value || searchTerm.value.length === 0) return note.layers;
        return note.layers.filter(d => {
            return d.comments.length > 0 && d.comments.some(c => c.includes(searchTerm.value))
        })
    })

    function mergeLayers(id) {
        mergeLayer.value = id;
        mergeDialog.value = true;
    }
    function executeMergeLayers() {
        note.mergeLayers(mergeLayer.value, activeLayer.value);
        mergeDialog.value = false;
    }

    function filterSearchLayers() {
        searchTerm.value = searchLayers.value;
    }

    function setLayerName(id) {
        const name = layerUI.name[id];
        if (note.renameLayer(id, name)) {
            delete layerUI.open[id];
            delete layerUI.comment[id];
            delete layerUI.name[id];
            layerUI.open[name] = true;
            layerUI.comment[name] = "";
            layerUI.name[name] = name;
        }
    }
    function addLayerComment(id) {
        if (layerUI.comment[id]) {
            note.addLayerComment(layerUI.comment[id], id)
            layerUI.comment[id] = "";
        }
    }
    function updateLayerComment(id, index, comment) {
        note.updateLayerComment(comment, id, index);
    }
    function removeLayerComment(id, index) {
        note.removeLayerComment(id, index)
    }

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
        layerUI.comment = {}
        layerUI.name = {}
        if (layer !== null) layerUI.open[layer.id] = true;
        note.layers.forEach(l => {
            layerUI.comment[l.id] = "";
            layerUI.name[l.id] = l.id;
        })
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
