<template>
    <v-main>
        <VextAlertBox/>
        <VextNoteDrawer v-model="open" hotkeys :auto-tool-switch="false"/>
        <router-view />
    </v-main>
</template>

<script setup>
    import VextAlertBox from '@/components/VextAlertBox.vue';
    import VextNoteDrawer from '@/components/VextNoteDrawer.vue';
    import { ref } from 'vue'

    const open = ref(false);

</script>
