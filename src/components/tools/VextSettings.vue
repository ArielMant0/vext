<template>
    <div class="ml-1">
        <v-tooltip :open-delay="tooltipDelay">
            when layers should be added<br/>
            ... when the state changed and you annotate<br/>
            ... when the state changed (without annotations)<br/>
            ... manually
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    layer mode
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-select v-model="layerMode" :items="LAYER_MODES_VALUES"
            density="compact" class="mb-4" hide-details/>

        <v-tooltip :open-delay="tooltipDelay">
            open the pointer menu after an annotation action
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    pointer menu on action
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-switch v-model="onAction" :label="onAction ? 'on' : 'off'"
            density="compact" color="primary" hide-details/>

        <v-tooltip :open-delay="tooltipDelay">
            open the pointer menu with a gesture (long click)
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    pointer menu on gesture
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-switch v-model="onGesture" :label="onGesture ? 'on' : 'off'"
            density="compact" color="primary" hide-details/>
    </div>
</template>

<script setup>

    import { useVextNoteSettings } from '@/store/note-settings';
    import { useVextNote } from '@/store/note';
    import { LAYER_MODES_VALUES } from '@/use/enums';
    import { storeToRefs } from 'pinia'

    const note = useVextNote();
    const settings = useVextNoteSettings();
    const { layerMode } = storeToRefs(note);
    const { onAction, onGesture } = storeToRefs(settings);

    const props = defineProps({
        tooltipDelay: {
            type: Number,
            default: 500
        }
    })

</script>