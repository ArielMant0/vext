<template>
    <v-app-bar flat height="42">
        <v-app-bar-title>
            <v-icon icon="mdi-pen-circle" />
            VEXT
        </v-app-bar-title>
        <VextHistoryControls/>
    </v-app-bar>
</template>

<script setup>
import VextHistoryControls from '@/components/VextHistoryControls';
</script>
