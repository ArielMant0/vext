<template>
    <div v-if="open" class="wrapper" @click="close">
        <div class="menu" :style="{ 'left': (x-30)+'px', 'top': (y-25)+'px' }">
            <v-btn icon="mdi-close-thick" rounded color="primary" variant="text" @click.stop="close"/>
            <ul style="border-radius: 50%" class="bg-primary">
                <li v-for="(item, i) in items" :key="item.id" class="menu-item" :style="{ 'transform': `rotate(${i*degree}deg) translate(60px)` }" @click.stop="action(item)">
                    <slot name="button" :item="item" :degree="-i*degree">
                        <v-btn v-if="item.icon"
                            :style="{ 'transform': `rotate(${-i*degree}deg)` }"
                            :icon="item.icon"
                            rounded
                            :color="item.color"
                            :border="item.border"
                            :class="[textColorClass(item.color)]"
                            size="small"/>
                        <v-btn v-else
                            :style="{ 'transform': `rotate(${-i*degree}deg)` }"
                            rounded
                            :color="item.color"
                            :border="item.border"
                            :class="[textColorClass(item.color)]"
                            size="small">
                            {{  item.value }}
                        </v-btn>
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
        closeOnClick: {
            type: Boolean,
            default: true
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

    const textLight = 'text-white';
    const textDark = 'text-black';

    function textColorClass(color) {
        switch (color) {
            case "success":
            case "error":
            case "info":
            case "default":
                return textDark;
            default:
                let hex = (color[0] === '#') ? color.substring(1, 7) : color;

                // Convert 3-digit hex to 6-digits.
                if (hex.length === 3) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }

                // By this point, it should be 6 characters
                if (hex.length !== 6) {
                    return textDark;
                }

                const r = parseInt(hex.slice(0, 2), 16) / 255;
                const g = parseInt(hex.slice(2, 4), 16) / 255;
                const b = parseInt(hex.slice(4, 6), 16) / 255;

                const contrast = r * 0.299 + g * 0.587 + b * 0.114;
                // Return light or dark class based on contrast calculation
                return contrast > 0.186 ? textDark : textLight;
        }

    }

    function action(item) {
        emit("click", item)
        if (props.closeOnClick) {
            close(false);
        }
    }
    function close(emitEvent=true) {
        if (!open.value) {
            console.debug("circle menu: already closed");
            return;
        }

        open.value = false;
        if (emitEvent) emit("close")
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
    align-items: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>