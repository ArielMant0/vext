
<template>
    <div class="d-flex">
        <v-switch v-model="enabled" :label="enabled?'enabled':'disabled'"
            hide-details density="compact" inline color="primary" class="mr-2"/>
        <div>
            <v-btn icon="mdi-undo" @click="history.undo()" :disabled="!history.hasUndo" rounded="0" variant="text"/>
            <v-btn icon="mdi-redo" @click="history.redo()" :disabled="!history.hasRedo" rounded="0" variant="text"/>
        </div>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia';
    import { useVextNote } from '@/store/note';
    import { useVextHistory } from '@/store/history';

    const { enabled } = storeToRefs(useVextNote());
    const history = useVextHistory();
</script>