<template>
    <div style="position: absolute;">
        <v-navigation-drawer permanent rail>
        <v-list nav density="compact" :disabled="!enabled">
            <v-list-item :prepend-icon="open && enabled ? openIcon : closedIcon" @click="open = !open"/>
        </v-list>

            <v-divider></v-divider>

            <v-list nav density="compact" :selected="tmpTool" mandatory @update:selected="setTool" :disabled="!enabled">
                <v-list-item :active-color="selectColor" :prepend-icon="layerIcon" :value="tools.LAYER">
                    <v-tooltip activator="parent" text="interact with your visualizations and modify|inspect|select layers" :open-delay="tooltipDelay"/>
                </v-list-item>
                <v-list-item :active-color="selectColor" :prepend-icon="brushIcon" :value="tools.BRUSH">
                    <v-tooltip activator="parent" text="choose brush settings for drawing on the VEXT canvas" :open-delay="tooltipDelay"/>
                </v-list-item>
                <v-list-item :active-color="selectColor" :prepend-icon="shapeIcon" :value="tools.SHAPE">
                    <v-tooltip activator="parent" text="add shapes or text to your VEXT canvas" :open-delay="tooltipDelay"/>
                </v-list-item>
                <v-list-item :active-color="selectColor" :prepend-icon="editIcon" :value="tools.EDIT">
                    <v-tooltip activator="parent" text="select items on the VEXT canvas to inspect or modify" :open-delay="tooltipDelay"/>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>

        <v-navigation-drawer :model-value="open && enabled" :temporary="floating" :width="width" class="pl-2 pr-2">
            <VextNoteConfiguration
                :layer-icon="layerIcon"
                :brush-icon="brushIcon"
                :edit-icon="editIcon"
                :shape-icon="shapeIcon"
                :select-color="selectColor"
                :hotkeys="hotkeys"
                :hotkeyMap="hotkeyMap"
                :tooltip-delay="tooltipDelay"
                :auto-tool-switch="autoToolSwitch"
                :width="width-30"/>
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
         * The width of the drawer (when opened).
         */
        width: {
            type: [Number, String],
            default: 320,
            validator(value) {
                return +value >= 0;
            }
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

    const note = useVextNote();
    const { tool, tools, enabled } = storeToRefs(note);

    const tmpTool = ref([tool.value]);
    const open = ref(props.open);

    function setTool(toolValue) {
        tmpTool.value[0] = toolValue[0];
        if (tmpTool.value[0] !== tool.value) {
            note.setTool(tmpTool.value[0]);
            open.value = true;
        } else {
            open.value = !open.value;
        }
    }
    function loadTool() {
        if (tool.value !== tmpTool.value[0]) {
            tmpTool.value = [tool.value];
        }
    }

    watch(() => note.tool, loadTool);

</script>