<template>
    <canvas ref="el" :width="width" :height="height"></canvas>
</template>

<script setup>

    import { ref, onMounted, watch } from 'vue';

    const el = ref(null);

    const props = defineProps({
        n: {
            type: Number,
            default: 100,
        },
        width: {
            type: Number,
            default: 500,
        },
        height: {
            type: Number,
            default: 500,
        },
    })

    function draw() {
        const ctx = el.value.getContext("2d");
        ctx.clearRect(0, 0, props.width, props.height);

        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "steelblue";

        for (let i = 0; i < props.n; ++i) {
            ctx.beginPath()
            ctx.arc(
                Math.random()*props.width,
                Math.random()*props.height,
                5, 0, Math.PI*2
            );
            ctx.fill();
        }
    }

    onMounted(draw);

    watch(props, draw);

</script>