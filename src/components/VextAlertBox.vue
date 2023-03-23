<template>
    <div v-if="alerts.length > 0">
        <v-alert v-for="a in alerts"
            :text="a.text" :type="a.type"
            density="comfortable"
            closable class="vext-alert"/>
    </div>
</template>

<script setup>
    import { storeToRefs } from 'pinia';
    import { useVextApp } from '@/store/app'

    const { alerts } = storeToRefs(useVextApp());
</script>

<style>
.vext-alert {
  margin: .5rem;
  width: 99%;
  z-index: 2000;
}
</style>