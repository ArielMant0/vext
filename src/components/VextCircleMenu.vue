<template>
    <div v-if="open" class="wrapper" @click="close">
        <div class="menu" :style="{ 'left': (x-30)+'px', 'top': (y-25)+'px' }">
            <v-btn icon="mdi-close-thick" rounded color="primary" variant="text" @click="close"/>
            <ul style="border-radius: 50%" class="bg-primary">
                <li v-for="(item, i) in items" :key="item.id" class="menu-item" :style="{ 'transform': `rotate(${i*degree}deg) translate(60px)` }">
                    <slot :item="item">
                        <v-btn :style="{ 'transform': `rotate(${-i*degree}deg)` }"
                            :icon="item.icon" rounded :color="item.color"
                            size="small" @click="action(item)"/>
                    </slot>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';

    const emit = defineEmits(["click", "close", "update:modelValue"])
    const props = defineProps({
        items: {
            type: Array,
            required: true
        },
        modelValue: {
            type: Boolean,
            default: true
        },
        x: {
            type: Number,
            default: 10
        },
        y: {
            type: Number,
            default: 10
        },
    })

    const open = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit("update:modelValue", value)
        }
    })
    const degree = computed(() => 360 / props.items.length)

    function action(item) {
        emit("click", item)
        close();
    }
    function close() {
        emit("close")
        open.value = false;
    }

</script>

<style scoped>
.wrapper {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 3004;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
.menu {
    position: fixed;
    display: flex;
    justify-content: center;
    margin: 0;
    padding: 0;
    z-index: 3006;
}
.menu-item {
    position: absolute;
    display: flex;
    justify-content: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>