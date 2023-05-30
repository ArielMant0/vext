<template>
    <div>
    <v-card class="mb-2 vext-layer-card" style="width: 100%">

        <v-card-title class="vext-layer" :style="{ 'color': data.color, 'opacity': active?1:0.5 }">

            <slot name="title-prepend" :item="data">
                <span>
                    <v-tooltip text="click to select this layer" location="top" :open-delay="tooltipDelay">
                        <template v-slot:activator="{ props }">
                            <v-icon v-bind="props" :icon="active ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'" @click="selectLayer()"/>
                        </template>
                    </v-tooltip>
                </span>
            </slot>

            <slot name="title" :item="data">
                <v-tooltip text="click to toggle layer info panel" location="top" :open-delay="tooltipDelay">
                    <template v-slot:activator="{ props }">
                        <span v-bind="props" class="vext-layer-selector" @click="toggleLayerOpen()">{{ data.id.length < 10 ? data.id : data.id.slice(0, 8)+".." }}</span>
                    </template>
                </v-tooltip>
            </slot>

            <slot name="title-append" :item="data">
                <span>
                    <v-chip v-if="annotations" label size="small" prepend-icon="mdi-pencil" class="mr-2">{{ data.items.length }}</v-chip>
                    <v-chip v-if="connections" label size="small" prepend-icon="mdi-connection" class="mr-2">{{ numConnections }}</v-chip>
                    <v-tooltip text="click to toggle layer visibility" location="top" :open-delay="tooltipDelay">
                        <template v-slot:activator="{ props }">
                            <v-chip v-bind="props" size="small" label @click="toggleVisibility()">
                                <v-icon>{{ data.visible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
                            </v-chip>
                        </template>
                    </v-tooltip>
                </span>
            </slot>

        </v-card-title>

        <v-card-text v-if="open">

            <v-sheet v-if="modifyName" class="mt-2">
                <v-text-field
                    v-model="name"
                    hide-details
                    @keyup="nameOnKeyUp"
                    density="compact"
                    append-icon="mdi-sync"
                    @click:append="setLayerName()"/>
            </v-sheet>

            <v-sheet v-if="comments" class="mt-2">
                <div class="text-caption">comments:</div>
                <v-text-field v-for="(c, idx) in data.comments" :model-value="c"
                    @update:model-value="content => updateLayerComment(idx, content)"
                    hide-details density="compact" class="mb-1"
                    append-inner-icon="mdi-delete" variant="outlined"
                    @click:append-inner="removeLayerComment(idx)"/>
                <v-text-field v-model="comment"
                    placeholder="add a comment .."
                    @keyup="commentOnKeyUp"
                    hide-details density="compact"
                    append-inner-icon="mdi-plus" variant="outlined"
                    @click:append-inner="addLayerComment()"/>
            </v-sheet>

            <v-sheet v-if="opacity" class="mt-2">
                <div class="text-caption">opacity</div>
                <v-slider v-model="opacityValue" prepend-icon="mdi-opacity" class="mr-4"
                    min="0" max="1" thumb-size="15" hide-details @update:model-value="changeOpacity"/>
            </v-sheet>

            <v-sheet v-if="state" class="mt-2">
                <div class="text-caption">application state:</div>
                <vue-json-pretty :data="JSON.parse(data.state.state)" :showDoubleQuotes="false" :deep="treeDepth" @nodeClick="onNodeClick"/>
            </v-sheet>

            <v-sheet v-if="actions" class="mt-2">
                <div class="text-caption">actions:</div>
                <div>
                    <v-tooltip text="merge into active layer" location="right" :open-delay="tooltipDelay">
                        <template v-slot:activator="{ props }">
                            <v-btn v-if="!active && merge && data.id !== note.previewLayerID && note.previewLayerID !== note.activeLayer"
                                v-bind="props"
                                size="x-small"
                                icon="mdi-merge"
                                variant="tonal"
                                rounded="sm"
                                class="mr-1"
                                @click="mergeLayers()"/>
                        </template>
                    </v-tooltip>
                    <v-tooltip text="delete this layer" location="right" :open-delay="tooltipDelay">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props"
                                size="x-small"
                                icon="mdi-delete"
                                color="error"
                                rounded="sm"
                                variant="tonal"
                                class="mr-1"
                                @click="delDialog = true"/>
                        </template>
                    </v-tooltip>
                    <v-tooltip text="export and download this layer" location="right" :open-delay="tooltipDelay">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props"
                                size="x-small"
                                icon="mdi-download"
                                rounded="sm"
                                class="mr-1"
                                variant="tonal"
                                @click="note.exportZIP()"/>
                        </template>
                    </v-tooltip>
                </div>
            </v-sheet>

        </v-card-text>
    </v-card>

    <v-dialog v-model="mergeDialog" width="auto">
        <v-card title="Merge layers">
            <v-card-text>
                Are you sure you want to merge layer
                <b>{{ data.id }}</b> into layer
                <b>{{ note.activeLayer }}</b>?<br/>
                The state from layer <b>{{ data.id }}</b> will be lost.
            </v-card-text>
            <v-card-actions>
                <v-btn color="warning" @click="mergeDialog = false">cancel</v-btn>
                <v-btn color="error" @click="executeMergeLayers">merge</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="delDialog" width="auto">
        <v-card>
            <v-card-text>
                Are you sure you want to delete <b>{{ data.id }}</b>?
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

    import { useVextNote } from '@/store/note';
    import { ref, computed } from 'vue';

    const props = defineProps({
        /**
         * Layer data
         */
        data: {
            type: Object,
            required: true
        },
        /**
         * Whether this layer is active.
         */
        active: {
            type: Boolean,
            required: true
        },
        /**
         * Whether to allow modidying the layer name.
         */
        modifyName: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show the annotations indicator.
         */
        annotations: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show the connections indicator.
         */
        connections: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to allow comments.
         */
        comments: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to allow changing the layer's opactiy.
         */
        opacity: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show the layer actions (merge, delete, export).
         */
        actions: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show the layer's application state.
         */
        state: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to allow merging this layer.
         */
        merge: {
            type: Boolean,
            default: true
        },
        /**
         * The tree depth to use for the application state display.
         */
        treeDepth: {
            type: Number,
            default: 1
        },
        /**
         * The delay to use when showing tooltips.
         */
        tooltipDelay: {
            type: [Number, String],
            default: 500,
            validator(value) {
                return +value >= 0;
            }
        }
    });
    const note = useVextNote();
    const emit = defineEmits({
        /**
         * Emitted when the user clicks on a tree node in the application state.
         */
        "node-click": null
    })

    const open = ref(false);
    const name = ref(props.data.id)
    const comment = ref("");
    const opacityValue = ref(props.data.opacity)

    const mergeDialog = ref(false);
    const delDialog = ref(false);

    const numConnections = computed(() => {
        const vals = Object.values(props.data.connections);
        if (vals) {
            return vals.reduce((sum, d) => sum + d.length, 0);
        }
        return 0;
    });

    function mergeLayers() { mergeDialog.value = true; }
    function executeMergeLayers() {
        note.mergeLayers(props.data.id);
        mergeDialog.value = false;
    }

    function setLayerName() { note.renameLayer(props.data.id, name.value); }

    function nameOnKeyUp(event) {
        if (event.code === "Enter") {
            setLayerName();
        }
    }
    function commentOnKeyUp(event) {
        if (event.code === "Enter") {
            addLayerComment();
        }
    }
    function addLayerComment() {
        if (comment.value) {
            note.addLayerComment(comment.value, props.data.id)
            comment.value = "";
        }
    }
    function updateLayerComment(index, comment) { note.updateLayerComment(comment, props.data.id, index); }
    function removeLayerComment(index) { note.removeLayerComment(props.data.id, index) }

    function toggleVisibility() { note.setLayerVisibility(!props.data.visible, props.data.id); }
    function toggleLayerOpen() { open.value = !open.value; }
    function selectLayer() { note.setActiveLayer(props.data.id) }
    function onNodeClick(node) { emit("node-click", node); }

    function changeOpacity() { note.setLayerOpacity(opacityValue.value, props.data.id) }

    function removeLayer() {
        delDialog.value = false;
        setTimeout(() => note.removeLayer(props.data.id), 100);
    }

</script>