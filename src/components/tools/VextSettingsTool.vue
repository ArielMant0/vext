<template>
    <div class="ml-1">

        <div class="mt-2 text-subtitle-1">Layers</div>
        <v-divider class="mb-2"/>

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

        <div class="mt-4 text-subtitle-1">Interaction History</div>
        <v-divider class="mb-2"/>

        <v-tooltip :open-delay="tooltipDelay">
            how many entries should be stored in the interaction history
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    interaction history limit
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-text-field v-model="historyLimit" type="number" hide-details density="compact"
            :rules="[v => v && v > 0 || 'must be larger than 0']"
            @update:model-value="setHistoryLimit"/>

        <div class="mt-4 text-subtitle-1">Pointer Menu</div>
        <v-divider class="mb-2"/>

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

        <v-tooltip :open-delay="tooltipDelay">
            close the pointer menu after clicking one of its options
            <template v-slot:activator="{ props }">
                <div class="text-caption mb-1">
                    close pointer menu on click
                    <v-icon size="small" icon="mdi-information" v-bind="props"/>
                </div>
            </template>
        </v-tooltip>
        <v-switch v-model="closeOnClick" :label="closeOnClick ? 'on' : 'off'"
            density="compact" color="primary" hide-details/>
    </div>
</template>

<script setup>

    import { useVextSettings } from '@/store/settings';
    import { useVextNote } from '@/store/note';
    import { LAYER_MODES_VALUES } from '@/use/enums';
    import { ref } from 'vue';
    import { storeToRefs } from 'pinia'

    const note = useVextNote();
    const settings = useVextSettings();
    const { layerMode } = storeToRefs(note);
    const { onAction, onGesture, closeOnClick } = storeToRefs(settings);

    const historyLimit = ref(settings.historyLimit);

    function setHistoryLimit() {
        settings.setHistoryLimit(historyLimit.value);
    }

    const props = defineProps({
        tooltipDelay: {
            type: Number,
            default: 500
        }
    })

</script>