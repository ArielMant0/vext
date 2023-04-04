<template>
    <v-app-bar flat height="42">
        <v-app-bar-title>
            <v-icon icon="mdi-lead-pencil"/>
            VEXT
        </v-app-bar-title>
        <VextAppBarControls/>
    </v-app-bar>
</template>

<script setup>
import VextAppBarControls from '@/components/VextAppBarControls.vue';
</script>
