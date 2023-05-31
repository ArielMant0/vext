<template>
    <div>
        <VextPointerMenu :z-index="7999"/>
        <VextGlobalToolTip :z-index="6999"/>
        <VextWhiteBoard :z-index="5999"/>
    </div>
</template>

<script setup>
    import VextGlobalToolTip from '@/components/VextGlobalToolTip.vue';
    import VextWhiteBoard from '@/components/VextWhiteBoard.vue';
    import VextPointerMenu from '@/components/VextPointerMenu.vue';
</script>