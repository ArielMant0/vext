<template>
    <VextToolTip
        :content="ttContent" :x="ttX" :y="ttY" :placement="ttPlacement"
        :width="width" :height="height" :offset="offset" :z-index="zIndex"/>
</template>

<script setup>
    import VextToolTip from '@/components/VextToolTip.vue';
    import { useVextApp } from '@/store/app';
    import { storeToRefs } from 'pinia';

    const props = defineProps({
        /**
         * Minimum width of the tooltip
         */
        width: {
            type: Number,
            default: 250,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * Minimum height of the tooltip
         */
        height: {
            type: Number,
            default: 250,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * Offset to add to the tooltip position (for x and y)
         */
        offset: {
            type: Number,
            default: 5,
            validator(value) {
                return value >= 0
            }
        },
        zIndex: {
            type: [Number, String],
            default: 300,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        },
    })

    const { ttContent, ttX, ttY, ttPlacement } = storeToRefs(useVextApp())

</script>