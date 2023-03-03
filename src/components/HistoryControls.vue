<template>
    <v-btn icon="mdi-undo" @click="backward" :disabled="!hasUndo"></v-btn>
    <v-btn icon="mdi-redo" @click="forward" :disabled="!hasRedo"></v-btn>
    <v-btn :icon="menu ? 'mdi-forwardburger' : 'mdi-menu'" @click.stop="toggleMenu"></v-btn>
</template>

<script>
import { storeToRefs } from 'pinia';
import { useHistory } from '@/store/history';

export default {
    setup() {

        const history = useHistory();
        const { menu, hasUndo, hasRedo } = storeToRefs(history);

        function backward() { history.undo(); }
        function forward() { history.redo(); }
        function toggleMenu() {
            history.setMenu(!menu.value);
        }

        return {
            menu,
            hasUndo,
            hasRedo,
            backward,
            forward,
            toggleMenu
        }
    },
}
</script>