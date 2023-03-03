<template>
    <v-app-bar flat height="42">
        <v-app-bar-title>
            <v-icon icon="mdi-note-edit" />
            VEXT
        </v-app-bar-title>
        <HistoryControls/>
    </v-app-bar>
</template>

<script>
import HistoryControls from '@/components/HistoryControls';
export default {
    components: { HistoryControls },
    setup() {}
}
</script>
