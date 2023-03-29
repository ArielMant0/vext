<template>
    <div style="position: absolute;">
        <v-navigation-drawer permanent rail>
        <v-list nav density="compact">
            <v-list-item :prepend-icon="open ? openIcon : closedIcon" @click="open = !open">
                <v-tooltip activator="parent" text="open or close the VEXT configuration panel"/>
            </v-list-item>
        </v-list>

            <v-divider></v-divider>

            <v-list nav density="compact" :selected="tmpTool" mandatory @update:selected="setTool">
                <v-list-item :active-color="selectColor" :prepend-icon="layerIcon" :value="tools.LAYER">
                    <v-tooltip activator="parent" text="interact with your visualizations and modify|inspect|select layers"/>
                </v-list-item>
                <v-list-item :active-color="selectColor" :prepend-icon="brushIcon" :value="tools.BRUSH">
                    <v-tooltip activator="parent" text="choose brush settings for drawing on the VEXT canvas"/>
                </v-list-item>
                <v-list-item :active-color="selectColor" :prepend-icon="shapeIcon" :value="tools.SHAPE">
                    <v-tooltip activator="parent" text="add shapes or text to your VEXT canvas"/>
                </v-list-item>
                <v-list-item :active-color="selectColor" :prepend-icon="editIcon" :value="tools.EDIT">
                    <v-tooltip activator="parent" text="select items on the VEXT canvas to inspect or modify"/>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-navigation-drawer :model-value="open" :temporary="floating" width="320" class="pl-2 pr-2">
            <VextNoteConfiguration
                :layer-icon="layerIcon"
                :brush-icon="brushIcon"
                :edit-icon="editIcon"
                :shape-icon="shapeIcon"
                :select-color="selectColor"/>
        </v-navigation-drawer>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia'
    import { ref, watch } from 'vue';
    import { useVextNote } from '@/store/note'
    import VextNoteConfiguration from './VextNoteConfiguration.vue';

    const props = defineProps({
        /**
         * Vuetify icon to show when the drawer is open.
         */
        openIcon: {
            type: String,
            default: "mdi-backburger"
        },
        /**
         * Vuetify icon to show when the drawer is closed.
         */
        closedIcon: {
            type: String,
            default: "mdi-forwardburger"
        },
        /**
         * Vuetify icon for the layers tool.
         */
        layerIcon: {
            type: String,
            default: "mdi-layers"
        },
        /**
         * Vuetify icon for the edit tool.
         */
        editIcon: {
            type: String,
            default: "mdi-cursor-pointer"
        },
        /**
         * Vuetify icon for the shape tool.
         */
        shapeIcon: {
            type: String,
            default: "mdi-shape"
        },
        /**
         * Vuetify icon for the brush tool.
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
            default: "default"
        },
        /**
         * Whether this component should take up space or float.
         */
        floating: {
            type: Boolean,
            default: true,
        },
        /**
         * Whether to have the drawer open at the start.
         */
        open: {
            type: Boolean,
            default: false,
        },
    });

    const note = useVextNote();
    const { tool, tools } = storeToRefs(note);

    const tmpTool = ref([tool.value]);
    const open = ref(props.open);

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