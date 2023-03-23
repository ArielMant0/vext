<template>
    <v-main>
        <VextHistoryDrawer/>
        <VextAlertBox/>
        <router-view />
    </v-main>
</template>

<script setup>
    import VextHistoryDrawer from '@/components/VextHistoryDrawer';
    import VextAlertBox from '@/components/VextAlertBox.vue';
</script>
