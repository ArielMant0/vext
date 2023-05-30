<template>
    <v-navigation-drawer v-model="open" temporary :location="location" width="400">
        <v-list-item prepend-icon="mdi-history" title="History">
            <template v-slot:append>
                <v-hover v-slot="{ isHovering, props }">
                    <v-icon v-bind="props" icon="mdi-delete-forever" @click="clearHistory" :color="isHovering ? 'error' : 'default'"></v-icon>
                </v-hover>
            </template>
        </v-list-item>
        <v-divider/>
        <v-card variant="flat">
            <v-card-title class="text-subtitle-2">
                <v-btn :icon="undoIcon" variant="plain" @click="history.undo()" :disabled="!hasUndo" rounded="0" size="small"/>
                <span>undo stack</span>
            </v-card-title>
            <v-list density="compact" nav>
                <v-list-item v-for="(item, index) in undoStack" :key="index" :title="item.description" :subtitle="item.time.toLocaleTimeString()"></v-list-item>
            </v-list>
        </v-card>
        <v-card variant="flat">
            <v-card-title class="text-subtitle-2">
                <v-btn :icon="redoIcon" variant="plain" @click="history.redo()" :disabled="!hasRedo" rounded="0" size="small"/>
                <span>redo stack</span>
            </v-card-title>
            <v-list density="compact" nav>
                <v-list-item v-for="(item, index) in redoStack" :key="index" :title="item.description" :subtitle="item.time.toLocaleTimeString()"></v-list-item>
            </v-list>
        </v-card>
    </v-navigation-drawer>
</template>

<script setup>
    /**
     * Vuetify drawer component that shows the undo and redo actions
     * of the history store.
     */
    import { storeToRefs } from 'pinia';
    import { useVextHistory } from '@/store/history';
    import { computed } from 'vue';

    const history = useVextHistory();
    const { undoStack, redoStack, hasUndo, hasRedo } = storeToRefs(history);

    function clearHistory() { history.clear(); }

    const props = defineProps({
        /**
         * Whether to show the history drawer - use with v-model.
         */
        modelValue: {
            type: Boolean,
            required: true,
        },
        /**
         * Icon to use for the undo button.
         */
        undoIcon: {
            type: String,
            default: "mdi-undo"
        },
         /**
         * Icon to use for the redo button.
         */
        redoIcon: {
            type: String,
            default: "mdi-redo"
        },
         /**
         * At which location to show the drawer.
         */
        location: {
            type: String,
            default: "left",
            validator(value) {
                return [
                    'top', 'end', 'bottom',
                    'start', 'left', 'right'
                ].includes(value)
            }
        }
    });

    const emit = defineEmits({
        /**
         * Called when the model value is updated.
         */
        "update:modelValue": null
    })

    const open = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit("update:modelValue", value);
        }
    })

</script>