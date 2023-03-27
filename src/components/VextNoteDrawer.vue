<template>
    <v-navigation-drawer permanent rail>
        <v-list nav density="compact">
            <v-list-item :prepend-icon="open ? openIcon : closedIcon" @click="open = !open"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list nav density="compact" :selected="tmpTool" mandatory @update:selected="setTool">
            <v-list-item :prepend-icon="layerIcon" :value="tools.LAYER"></v-list-item>
            <v-list-item :prepend-icon="brushIcon" :value="tools.BRUSH"></v-list-item>
            <v-list-item :prepend-icon="shapeIcon" :value="tools.SHAPE"></v-list-item>
            <v-list-item :prepend-icon="editIcon" :value="tools.EDIT"></v-list-item>
        </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-if="open" floating width="320" class="pl-2">
        <VextNoteConfiguration
            :layer-icon="layerIcon"
            :brush-icon="brushIcon"
            :edit-icon="editIcon"
            :shape-icon="shapeIcon"/>
    </v-navigation-drawer>
</template>

<script setup>
    import { storeToRefs } from 'pinia'
    import { ref, watch } from 'vue';
    import { useVextNote } from '@/store/note'
    import VextNoteConfiguration from './VextNoteConfiguration.vue';

    const props = defineProps({
        /**
         * Vuetify icon for the layers tool
         */
        openIcon: {
            type: String,
            default: "mdi-forwardburger"
        },
        /**
         * Vuetify icon for the layers tool
         */
        closedIcon: {
            type: String,
            default: "mdi-backburger"
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
    });

    const note = useVextNote();
    const { tool, tools } = storeToRefs(note);

    const tmpTool = ref([tool.value]);
    const open = ref(true);

    function setTool(newvalue) {
        note.setTool(newvalue[0]);
    }
    function loadTool() {
        if (tool.value !== tmpTool.value[0]) {
            tmpTool.value = [tool.value];
        }
    }

    watch(() => note.tool, loadTool);

</script>