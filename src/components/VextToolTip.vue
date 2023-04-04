<template>
    <div ref="wrapper" class="vext-tooltip" v-if="content" :style="{ 'left': tX+'px', 'top': tY+'px' }">
        <v-card style="height: 100%; opacity: 0.9;" color="grey-darken-3">
            <v-list v-if="Array.isArray(content)" class="vext-tt-content">
                <v-list v-for="(item, idx) in content" :key="idx">
                    <v-list-item v-for="(value, key) in item" :key="key" class="d-flex _justify-content:space-between">
                        <span><b>{{ key }}: </b></span>
                        <span>{{ ''+value }}</span>
                    </v-list-item>
                </v-list>
            </v-list>
            <div v-else-if="typeof content === 'object'" class="content">
                <template v-for="(value, key) in content" :key="key">
                    <div style="display: flex; justify-content: space-between;">
                        <span>{{  key }}</span>
                        <span><b>{{  ''+value }}</b></span>
                    </div>
                </template>
            </div>
            <span v-else class="pa-2">{{ content }}</span>
        </v-card>
    </div>
</template>

<script setup>
    /**
     * Simple dynamic tooltip that can be used to show data, e.g. when hovering
     * over an SVG item in a visualization. Intended to be used like a singleton,
     * so only one instance per app. Content and position are set via the app store.
     */

    import { ref, watch } from 'vue';

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
        /**
         * Content to show in the tooltip.
         */
        content: {
            type: [Object, Array, String],
            default: null,
        },
        /**
         * How to place the tooltip.
         */
        placement: {
            type: String,
            default: "auto",
            validator(value) {
                return ["auto", "right",
                    "left", "bottom", "top",
                    "right-bottom", "right-top",
                    "left-bottom", "left-top",
                    ].includes(value)
            }
        },
        /**
         * Horizontal position of the tooltip.
         */
        x: {
            type: Number,
            default: 0,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * Vertical position of the tooltip.
         */
        y: {
            type: Number,
            default: 0,
            validator(value) {
                return value >= 0
            }
        },
    })

    const wrapper = ref(null);
    const tX = ref(0);
    const tY = ref(0);

    function findPlacement(mx, my, w, h) {
        const spaceRight = mx < window.innerWidth - w - props.offset*2 - 10;
        const spaceBottom = my < window.innerHeight - h - props.offset*2 - 10;
        if (spaceRight && spaceBottom) {
            return "right-bottom"
        } else if (!spaceRight && spaceBottom) {
            return "left-bottom"
        } else if (spaceRight && !spaceBottom) {
            return "right-top"
        } else {
            return "left-top";
        }
    }

    function updatePosition(mx, my, placement) {

        let w = props.width;
        let h = props.height;
        if (wrapper.value) {
            const rect = wrapper.value.getBoundingClientRect()
            w = rect.width;
            h = rect.height;
        }

        mx = mx - window.scrollX;
        my = my - window.scrollY;

        if (placement === "auto") {
            placement = findPlacement(mx, my, w, h);
        }

        switch (placement) {
            case "left":
                tX.value = mx - w - props.offset;
                tY.value = my - (h * 0.5);
                break;
            case "left-top":
                tX.value = mx - w - props.offset;
                tY.value = my - h - props.offset;
                break;
            case "left-bottom":
                tX.value = mx - w - props.offset;
                tY.value = my + props.offset;
                break;
            case "top":
                tX.value = mx - (w * 0.5);
                tY.value = my - h - props.offset;
                break;
            case "bottom":
                tX.value = mx + (w * 0.5) + props.offset;
                tY.value = my + props.offset;
                break;
            case "right-top":
                tX.value = mx + props.offset;
                tY.value = my - h - props.offset;
                break;
            case "right":
                tX.value = mx + props.offset;
                tY.value = my - (h * 0.5);
                break;
            // case "right-bottom":
            default:
                tX.value = mx + props.offset;
                tY.value = my + props.offset;
                break;
        }
    }

    function show() {
        if (props.content !== null) {
            updatePosition(props.x, props.y, props.placement);
        }
    }

    watch(() => props.content, show, { deep: true });
    watch(() => props.x, updatePosition);
    watch(() => props.y, updatePosition);

</script>
