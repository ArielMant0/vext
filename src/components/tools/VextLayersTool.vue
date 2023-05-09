<template>
    <div>
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
        <div class="d-flex">
            <v-select v-model="layerMode" :items="layerModeValues" density="compact" class="no-input-details mb-2 mr-2"></v-select>
            <v-tooltip text="add a new layer" location="right" :open-delay="tooltipDelay">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-plus" color="primary" size="small" rounded="0" @click="openAddDialog" class="me-1"></v-btn>
                </template>
            </v-tooltip>
        </div>

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
            placeholder="search layers ..."
            append-inner-icon="mdi-magnify"
            @click:append-inner="filterSearchLayers"
            @click:clear="filterSearchLayers"/>

        <v-item-group mandatory :multiple="false">

            <v-item v-if="previewLayer" :key="previewLayer.id" :value="previewLayer.id">
                <div class="text-caption mb-1">working layer</div>
                <LayerInfo :data="previewLayer"
                    :active="previewLayer.id === activeLayer"
                    :modify-name="false"
                    :annotations="false"
                    :comments="false"
                    :opacity="false"
                    :actions="false"
                    :tree-depth="treeDepth"
                    :tooltip-delay="tooltipDelay"
                    @node-click="updateTreeDepth"/>
            </v-item>

            <v-divider class="mb-2"></v-divider>

            <div class="text-caption mb-1">annotation layers</div>
            <v-item v-for="layer in layerSearch" :key="layer.id" :value="layer.id">
                <LayerInfo :data="layer"
                    :active="layer.id === activeLayer"
                    :tree-depth="treeDepth"
                    :tooltip-delay="tooltipDelay"
                    @node-click="updateTreeDepth"/>
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
    import { ref, watch, computed } from 'vue';
    import { useVextNote } from '@/store/note';
    import { storeToRefs } from 'pinia';
    import { useVextState } from '@/store/state';
    import LayerInfo from './LayerInfo.vue';

    const state = useVextState();

    const addDialog = ref(false);
    const importDialog = ref(false);
    const searchLayers = ref("");
    const searchTerm = ref("");

    const filterLayers = ref(false);
    const layerColor = ref("#ddd")
    const layerID = ref("new layer");
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

    const note = useVextNote();
    const { activeLayer, layerMode, layerModeValues, previewLayer } = storeToRefs(note);

    const layerSearch = computed(() => {
        if (!searchTerm.value || searchTerm.value.length === 0) return note.userLayers;
        return note.userLayers.filter(d => {
            return d.id.includes(searchTerm.value) ||
                d.comments.length > 0 && d.comments.some(c => c.includes(searchTerm.value))
        })
    })

    function filterSearchLayers() { searchTerm.value = searchLayers.value; }

    function addLayer() {
        addDialog.value = false;
        const s = state.exportState();
        note.addLayer(s, false, layerID.value, layerColor.value);
    }

    function openAddDialog() {
        layerColor.value = note.nextColor;
        layerID.value = note.nextID;
        addDialog.value = true;
    }

    function removeEmptyLayers() { note.removeEmptyLayers(); }

    function updateTreeDepth(node) {
        const collaped = node.type.endsWith("Collapsed")
        treeDepth.value = collaped ?
            Math.min(node.level, treeDepth.value) :
            Math.max(node.level+1, treeDepth.value)
    }


</script>
