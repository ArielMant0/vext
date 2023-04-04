
import { VextHistoryControls } from '.';

<template>
    <div class="d-flex">
        <v-switch v-model="enabled" label="enable" hide-details density="compact" inline color="primary"></v-switch>
        <VextHistoryControls/>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia';
    import VextHistoryControls from './VextHistoryControls.vue';
    import { useVextNote } from '@/store/note';

    const { enabled } = storeToRefs(useVextNote());
</script>