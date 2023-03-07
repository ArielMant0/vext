<template>
    <v-main>
        <VextHistoryDrawer/>
        <router-view />
        <v-alert v-if="alertText.length > 0" :text="alertText" :type="alertType" closable position="absolute" class="main-alert"></v-alert>
    </v-main>
</template>

<script setup>
    import { storeToRefs } from 'pinia';
    import { useVextApp } from '@/store/app'
    import VextHistoryDrawer from '@/components/VextHistoryDrawer';

    const app = useVextApp();
    const { alertText, alertType } = storeToRefs(app);

</script>

<style>
.main-alert {
  bottom: 0;
  left: 0;
  margin: .5rem;
  width: 99%;
  z-index: 2000;
}
</style>
