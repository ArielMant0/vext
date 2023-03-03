<template>
    <div ref="wrapper" class="tooltip" v-if="content" :style="{ 'left': x+'px', 'top': y+'px' }">
        <v-card style="height: 100%; opacity: 0.9;" color="grey-darken-3">
            <v-list v-if="Array.isArray(content)" class="content">
                <v-list v-for="(item, idx) in content" :key="idx">
                    <v-list-item v-for="(value, key) in item" :key="key" class="_display:flex _justify-content:space-between">
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

<script>
import { useLink } from '@/store/link';
import { ref, watch } from 'vue';


export default {
    props: {
        width: {
            type: Number,
            default: 250
        },
        height: {
            type: Number,
            default: 250
        },
        offset: {
            type: Number,
            default: 5
        }
    },
    setup(props) {

        const wrapper = ref(null);
        const content = ref("")
        const placementCache = ref("auto");
        const x = ref(0)
        const y = ref(0)

        const link = useLink();

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

        function updatePosition(mx, my, placement=placementCache.value) {

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

        function show(object, mx, my, placement="auto") {
            content.value = object;
            placementCache.value = placement;
            updatePosition(mx, my, placement);
        }

        function hide() {
            content.value = "";
            placementCache.value = "auto";
            x.value = 0;
            y.value = 0;
        }

        watch(() => link.ttContent, () => show(link.ttContent, link.ttX, link.ttY, link.ttPlacement), { deep: true });
        watch(() => link.ttX, () => updatePosition(link.ttX, link.ttY));
        watch(() => link.ttY, () => updatePosition(link.ttX, link.ttY));

        return {
            wrapper,
            content,
            x,
            y,
            show,
            hide,
            updatePosition,
        }
    },
}
</script>

<style scoped>
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