<template>
    <v-btn icon="mdi-undo" @click="backward" :disabled="!hasUndo"></v-btn>
    <v-btn icon="mdi-redo" @click="forward" :disabled="!hasRedo"></v-btn>
    <v-btn :icon="menu ? 'mdi-forwardburger' : 'mdi-menu'" @click.stop="toggleMenu"></v-btn>
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

    function backward() { history.undo(); }
    function forward() { history.redo(); }
    function toggleMenu() {
        history.setMenu(!menu.value);
    }
</script>