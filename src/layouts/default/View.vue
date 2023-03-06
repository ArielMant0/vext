<template>
    <v-main>
        <HistoryDrawer/>
        <router-view />
        <v-alert v-if="alertText.length > 0" :text="alertText" :type="alertType" closable position="absolute" class="main-alert"></v-alert>
    </v-main>
</template>

<script>
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app'
import HistoryDrawer from '@/components/HistoryDrawer';

export default {
  components: { HistoryDrawer },
    setup() {
        const app = useAppStore();
        const { alertText, alertType } = storeToRefs(app);

        return {
            alertText,
            alertType,
        }
    }
}
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
