<template>
    <v-navigation-drawer v-model="menu" temporary location="right" width="400">
        <v-list-item prepend-icon="mdi-history" title="History">
            <template v-slot:append>
                <v-hover v-slot="{ isHovering, props }">
                    <v-icon v-bind="props" icon="mdi-delete-forever" @click="clearHistory" :color="isHovering ? 'error' : 'default'"></v-icon>
                </v-hover>
            </template>
        </v-list-item>
        <v-divider/>
        <v-card title="undo stack" prepend-icon="mdi-undo" variant="flat">
            <v-list density="compact" nav>
                <v-list-item v-for="(item, index) in undoStack" :key="index" :title="item.description" :subtitle="item.time.toLocaleTimeString()"></v-list-item>
            </v-list>
        </v-card>
        <v-card title="redo stack" prepend-icon="mdi-redo" variant="flat">
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

    const history = useVextHistory();
    const { menu, undoStack, redoStack } = storeToRefs(history);

    function clearHistory() {
        history.clear();
    }
</script>