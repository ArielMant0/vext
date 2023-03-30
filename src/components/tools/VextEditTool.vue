<template>
    <div>
        <v-item-group v-if="activeObject !== null" class="mt-4">
            <v-item v-for="key in keys" :key="key">
                <v-text-field v-model="activeObject[key]" :label="key" readonly density="compact" variant="outlined">
                </v-text-field>
            </v-item>
        </v-item-group>
        <div v-else style="text-align: center;" class="mt-5">select an annotation to see its settings</div>
    </div>
</template>

<script setup>
    /**
     * Component that displays information about the selected object(s)
     * in the NoteCanvas.
     */
    import { useVextNote } from '@/store/note';
    import { computed } from 'vue';
    import { storeToRefs } from 'pinia';

    const note = useVextNote();
    const { activeObject } = storeToRefs(note);

    /**
     * Contains all available keys in the active selection object
     */
    const keys = computed(() => {
        if (activeObject.value !== null) {
            return Object.keys(activeObject.value)
        }
        return []
    });
</script>
