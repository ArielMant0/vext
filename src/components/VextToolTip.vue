<template>
    <div ref="wrapper" class="tooltip" v-if="content" :style="{ 'left': x+'px', 'top': y+'px' }">
        <v-card style="height: 100%; opacity: 0.9;" color="grey-darken-3">
            <v-list v-if="Array.isArray(content)" class="content">
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

    import { useVextApp } from '@/store/app';
    import { ref, watch } from 'vue';

    const props = defineProps({
        /**
         * Minimum width of the tooltip
         */
        width: {
            type: Number,
            default: 250
        },
        /**
         * Minimum height of the tooltip
         */
        height: {
            type: Number,
            default: 250
        },
        /**
         * Offset to add to the tooltip position (for x and y)
         */
        offset: {
            type: Number,
            default: 5
        }
    })

    const wrapper = ref(null);
    const content = ref("")
    const placementCache = ref("auto");
    const x = ref(0)
    const y = ref(0)

    const app = useVextApp();

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

        if (!placement) {
            placement = placementCache.value;
        }

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
                x.value = mx - w - props.offset;
                y.value = my - (h * 0.5);
                break;
            case "left-top":
                x.value = mx - w - props.offset;
                y.value = my - h - props.offset;
                break;
            case "left-bottom":
                x.value = mx - w - props.offset;
                y.value = my + props.offset;
                break;
            case "top":
                x.value = mx - (w * 0.5);
                y.value = my - h - props.offset;
                break;
            case "bottom":
                x.value = mx + (w * 0.5) + props.offset;
                y.value = my + props.offset;
                break;
            case "right-top":
                x.value = mx + props.offset;
                y.value = my - h - props.offset;
                break;
            case "right":
                x.value = mx + props.offset;
                y.value = my - (h * 0.5);
                break;
            // case "right-bottom":
            default:
                x.value = mx + props.offset;
                y.value = my + props.offset;
                break;
        }
    }

    function show(ttcontent, mx, my, placement="auto") {
        content.value = ttcontent;
        placementCache.value = placement;
        updatePosition(mx, my, placement);
    }

    function hide() {
        content.value = "";
        placementCache.value = "auto";
        x.value = 0;
        y.value = 0;
    }

    watch(() => app.ttContent, () => show(app.ttContent, app.ttX, app.ttY, app.ttPlacement), { deep: true });
    watch(() => app.ttX, () => updatePosition(app.ttX, app.ttY));
    watch(() => app.ttY, () => updatePosition(app.ttX, app.ttY));

    defineExpose({
        /**
         * Show the tooltip with 'content' at position [mx, my] and 'placement'.
         * Content can be either a sting, object or array of objects.
         *
         * @param {*} content tooltip content
         * @param {Number} mx x position in the document
         * @param {Number} my y position in the document
         * @param {String} placement tooltip placement
         *
         * @public
         */
        show,
        /**
         * Hide the tooltip
         * @public
         */
        hide,
        /**
         * Update the position of the tooltip wit coordinates [mx, my] and placement
         * 'placement'. This may be useful if you want the tooltip to stay at the same
         * position relative to the mouse. If no placement is given, the last set
         * placement is used.
         *
         * @param {Number} mx x position in the document
         * @param {Number} my y position in the document
         * @param {String} placement tooltip placement
         *
         * @public
         */
        updatePosition
    });
</script>

<style>
.content {
    overflow-y: auto;
    word-wrap: break-word;
    font-size: 12px;
    padding: 10px;
}
.tooltip {
    min-width: 200px;
    position: fixed;
    padding: 0;
    margin: 0;
    z-index: 10;
    border-radius: 3px;
}
</style>