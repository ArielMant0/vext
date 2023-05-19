<template>
    <div v-if="open" class="menu" :style="{ 'left': (x-30)+'px', 'top': (y-30)+'px' }">
        <!-- <input :checked="isOpen" class="menu-toggler" type="checkbox" @click="isOpen = !isOpen"> -->
        <!-- <label for="menu-toggler"></label> -->
        <v-btn icon="mdi-close-thick" rounded color="primary" variant="text" @click="close"/>
        <ul style="border-radius: 50%" class="bg-primary">
            <li v-for="(item, i) in items" :key="item.id" class="menu-item" :style="{ 'transform': `translate(-15px) rotate(${i*degree}deg) translate(80px)` }">
                <v-btn :style="{ 'transform': `rotate(${-i*degree}deg)` }"
                    :icon="item.icon" rounded :color="item.color"
                    size="small" @click="action(item)"/>
            </li>
        </ul>
    </div>
</template>

<script setup>
    import { ref, computed, watch } from 'vue';

    const emit = defineEmits(["click", "close"])
    const props = defineProps({
        items: {
            type: Array,
            required: true
        },
        open: {
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

    const isOpen = ref(props.open);
    const degree = computed(() => 360 / props.items.length)

    function action(item) { emit("click", item) }
    function close() {
        isOpen.value = false;
        emit("close");
    }

</script>

<style scoped>
.menu {
    position: fixed;
    margin: 0;
    padding: 0;
    z-index: 3004;
}
.menu-toggler {
  position: absolute;
  display: block;
  top:0;
  bottom:0;
  right:0;
  left:0;
  margin:auto;
  width:40px;
  height:40px;
  opacity:0;
  cursor:pointer;
}
ul .menu-item {
  opacity: 1;
}
ul .menu-item a {
  pointer-events:auto;
}
.menu-item {
  position: absolute;
  display: block;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 80px;
  height: 80px;
  opacity: 0;
  transition: 0.5s;
}
</style>