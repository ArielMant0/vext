<template>
    <div v-if="open" class="wrapper" @click="close" :style="{ 'z-index': zIndex }">
        <div class="menu" :style="{ 'left': (x-30)+'px', 'top': (y-25)+'px' }">
            <template v-if="background">
                <div  v-for="level in levels" :key="level"
                    :style="{
                        'width': `${levelDistance(level)*2+60}px`,
                        'height': `${levelDistance(level)*2+60}px`,
                        'top': `-${levelDistance(level)+5}px`,
                        'left': `-${levelDistance(level)+5}px`
                    }"
                    class="menu-bg"/>
            </template>
            <v-btn icon="mdi-close-thick" rounded color="primary" variant="text" @click.stop="close"/>
            <ul style="border-radius: 50%">
                <li v-for="(item, i) in items" :key="item.id" class="menu-item" :style="{ 'transform': `rotate(${degree(i)}deg) translate(${distance(i)}px)` }" @click.stop="action(item)">
                    <slot name="button" :item="item" :degree="-degree(i)">
                        <v-btn v-if="item.icon"
                            :style="{ 'transform': `rotate(${-degree(i)}deg)` }"
                            :icon="item.icon"
                            rounded
                            :color="item.color ? item.color : 'default'"
                            :border="item.border"
                            :class="[colorContrastTextClass(item.color ? item.color : 'default')]"
                            size="small"/>
                        <v-btn v-else
                            :style="{ 'transform': `rotate(${-degree(i)}deg)` }"
                            rounded
                            :color="item.color  ? item.color : 'default'"
                            :border="item.border"
                            :class="[colorContrastTextClass(item.color ? item.color : 'default')]"
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
    import { colorContrastTextClass } from '@/use/util';

    const emit = defineEmits({
        /**
         * Called when the modelValue is updated
         * @param {Boolean} value new model value
         */
         "update:modelValue": null,
        /**
         * Called when the menu is closed via the close button or an outside click.
         */
        "close": null,
        /**
         * Called when an item is clicked - with the item as parameter.
         * @param {Object} item the item that was clicked
         */
        "click": value => value !== null && typeof value === "object"
    })

    const props = defineProps({
        /**
         * Items to display in the menu, e.g.
         * {
         *   "color": "error",      // color (vuetify- compatible)
         *   "icon": "mdi-account"  // icon for the button - will use value as fallback
         *   "value": 0,            // value - fallback for display if no icon is set
         *   "forceOpen": true      // if true, menu will not close when this item is clicked
         *   "forceClose": true     // if true, menu will always close when this item is clicked
         * }
         */
        items: {
            type: Array,
            required: true,
            validator(array) {
                return array.every(d => d.value !== undefined || d.icon !== undefined)
            }
        },
        /**
         * How many items per level to allow (default 8), must be greater than 0.
         * Could be useful when doing custom rendering.
         */
        itemsPerLevel: {
            type: Number,
            default: 8,
            validator(value) {
                return value > 0;
            }
        },
        /**
         * Whether to close the menu after an item was clicked.
         */
        closeOnClick: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to display a background for the menu.
         */
        background: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to show the menu - use with v-model.
         */
        modelValue: {
            type: Boolean,
            default: true
        },
        /**
         * Menu center position on the x axis
         */
        x: {
            type: Number,
            default: 10
        },
        /**
         * Menu center position on the y axis
         */
        y: {
            type: Number,
            default: 10
        },
        /**
         * CSS z-index to use for the menu
         */
        zIndex: {
            type: [Number, String],
            default: 300,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        }
    })

    const open = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit("update:modelValue", value)
        }
    })
    const levels = computed(() => {
        const values = [];
        for (let i = itemLevel(props.items.length-1); i > 0; --i) {
            values.push(i)
        }
        return values;
    })
    const perLevel = computed(() => {
        return Math.min(props.items.length, props.itemsPerLevel)
    })

    function itemLevel(index) {
        return 1 + Math.floor(index / props.itemsPerLevel)
    }
    function degree(index) {
        const l = itemLevel(index)
        return (index % perLevel.value) * 360 / (perLevel.value * l);
    }
    function levelDistance(level) {
        switch (level) {
            case 1:
                return 60
            default:
                return 40 + level * 40
        }
    }
    function distance(index) {
        return levelDistance(itemLevel(index))
    }

    function action(item) {
        emit("click", item)
        // if we should close after a click and the item does not force to stay open
        if (props.closeOnClick && !item.forceOpen) {
            close(false);
        } else if (item.forceClose) {
            close()
        }
    }
    function close(emitEvent=true) {
        if (!open.value) {
            console.debug("circle menu: already closed");
            return;
        }

        open.value = false;
        if (emitEvent) {
            emit("close")
        }
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
.menu-bg {
    position: absolute;
    background-color: rgb(240, 240, 240);
    border: 3px solid white;
    border-radius: 50%;
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