<template>
    <v-btn rounded="0" :icon="undoIcon" @click="backward" :disabled="!hasUndo"></v-btn>
    <v-btn rounded="0" :icon="redoIcon" @click="forward" :disabled="!hasRedo"></v-btn>
    <v-btn rounded="0" :icon="menu ? menuOpenIcon : menuClosedIcon" @click.stop="toggleMenu"></v-btn>
</template>

<script setup>
    /**
     * Component that holds two buttons to use un-/do capabilities of the history
     * store and a button to show/hide the HistoryDrawer.
     */
    import { storeToRefs } from 'pinia';
    import { useVextHistory } from '@/store/history';

    const history = useVextHistory();
    const { menu, hasUndo, hasRedo } = storeToRefs(history);

    const props = defineProps({
        /**
         * Icon to use for the undo button
         */
        undoIcon: {
            type: String,
            default: "mdi-undo"
        },
        /**
         * Icon to use for the redo button
         */
        redoIcon: {
            type: String,
            default: "mdi-redo"
        },
        /**
         * Icon to use for the menu button when the menu is open
         */
        menuOpenIcon: {
            type: String,
            default: "mdi-forwardburger"
        },
        /**
         * Icon to use for the menu button when the menu is closed
         */
        menuClosedIcon: {
            type: String,
            default: "mdi-history"
        },
    });

    function backward() { history.undo(); }
    function forward() { history.redo(); }
    function toggleMenu() {
        history.setMenu(!menu.value);
    }
</script>