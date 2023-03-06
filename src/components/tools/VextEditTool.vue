<template>
    <div>
        <v-item-group v-if="activeObject !== null" class="mt-4">
            <v-item v-for="key in keys" :key="key">
                <v-text-field v-model="activeObject[key]" :label="key" readonly density="compact" variant="outlined">
                </v-text-field>
            </v-item>
        </v-item-group>
        <div v-else style="text-align: center; width: 100%;">no active selection</div>
    </div>
</template>

<script>
import { useVextNote } from '@/store/note';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

/**
 * Component that displays information about the selected object(s)
 * in the NoteCanvas.
 * @displayName VextEditTool
 */
export default {
    name: "VextEditTool",
    setup() {
        const note = useVextNote();
        const { activeObject } = storeToRefs(note);
        const keys = computed(() => {
            if (activeObject.value !== null) {
                return Object.keys(activeObject.value)
            }
            return []
        })

        return {
            activeObject,
            keys
        }

    },
}
</script>
