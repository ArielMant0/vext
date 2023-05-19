<template>
    <div>
        <div v-if="visible" class="pointer-menu" :style="{ 'left': x+'px', 'top': y+'px', }">
            <VextCircleMenu :items="visibleOptions" :x="x" :y="y"
                :open="visible" @click="o => performAction(o.action, o.id)" @close="visible = false"/>
            <!-- <v-sheet elevation="4" rounded>
                <div class="d-flex flex-column">
                    <div class="d-flex flex-row" v-for="array in visibleOptions">
                        <v-btn v-for="o in array"
                            :icon="o.icon"
                            size="x-small"
                            rounded="0"
                            variant="text"
                            :color="o.color ? o.color : 'default'"
                            @click="performAction(o.action, o.id)"/>
                    </div>
                </div>
            </v-sheet> -->
        </div>
        <div v-if="radius > 0" class="pointer-menu" :style="{ 'left': indicatorX+'px', 'top': indicatorY+'px', }">
            <svg :width="maxRadius*2+10" :height="maxRadius*2+10">
                <circle fill="none" stroke="gray" stroke-width="3" :stroke-opacity="indicatorT"
                    :r="radius" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                <circle fill="none" stroke="gray" stroke-width="3" :stroke-opacity="indicatorT"
                    :r="Math.max(1, radius-5)" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                <circle fill="none" stroke="gray" stroke-width="3" :stroke-opacity="indicatorT"
                    :r="Math.max(1, radius-10)" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
            </svg>
        </div>
    </div>
</template>

<script setup>
    import { useVextInput } from '@/store/input';
    import { useVextNote } from '@/store/note';
    import { storeToRefs } from 'pinia';
    import { ref, watch, computed, onMounted } from 'vue';
    import VextCircleMenu from './VextCircleMenu.vue';

    const input = useVextInput();
    const note = useVextNote();

    const { tool } = storeToRefs(note);
    const { ACTIONS } = storeToRefs(input);

    const props = defineProps({
        onAction: {
            type: Boolean,
            default: true
        },
        onGesture: {
            type: Boolean,
            default: true
        },
        options: {
            type: Array,
            default() {
                return [
                    {
                        id: "accept",
                        icon: "mdi-check",
                        action: "accept",
                        color: "success",
                    },{
                        id: "accept_ignore",
                        icon: "mdi-check-all",
                        action: "accept_ignore",
                        color: "success",
                    },{
                        id: "cancel",
                        icon: "mdi-close-circle-outline",
                        action: "cancel",
                        color: "error",
                    },{
                        id: "cancel_ignore",
                        icon: "mdi-close-circle-multiple-outline",
                        action: "cancel_ignore",
                        color: "error",
                    },{
                        id: "brush",
                        icon: "mdi-draw",
                        action: "mode"
                    },{
                        id: "shape",
                        icon: "mdi-shape",
                        action: "mode"
                    },{
                        id: "edit",
                        icon: "mdi-cursor-pointer",
                        action: "mode"
                    },{
                        id: "layer",
                        icon: "mdi-layers",
                        action: "mode"
                    },{
                        id: "connect",
                        icon: "mdi-connection",
                        action: "mode"
                    },
                ]
            }
        }
    });

    const visible = ref(false);
    const ignore = ref(false);
    const x = ref(10);
    const y = ref(10);

    const indicatorX = ref(10);
    const indicatorY = ref(10);
    const indicatorT = ref(0);
    const radius = ref(0);

    const maxRadius = 30;

    const timeThresholdMax = 1000; // milliseconds
    const timeThresholdMin = 100;  // milliseconds
    let lastPointerDown = null;
    let lastX = 0, lastY = 0;

    const visibleOptions = computed(() => {
        return props.options.filter(d => d.id !== tool.value)
    });

    function performAction(action, id) {
        switch(action) {
            case ACTIONS.value.ACCEPT_IGNORE:
                ignore.value = true;
                break;
            case ACTIONS.value.CANCEL_IGNORE:
                ignore.value = true;
            case ACTIONS.value.CANCEL:
                note.removeLastObject();
                break;
            case ACTIONS.value.MODE:
                note.setTool(id);
                break;
        }
        visible.value = false;
    }

    function easeInOutSine(value) {
        return -(Math.cos(Math.PI * value) - 1) / 2;
    }
    function easeOutQuad(value) {
        return 1 - (1 - value) * (1 - value);
    }

    function onPointerDown(event) {

        // do not react if the menu is open
        if (!props.onGesture || visible.value) return;

        lastPointerDown = performance.now();
        lastX = event.pageX;
        lastY = event.pageY;
        indicatorX.value = lastX - maxRadius;
        indicatorY.value = lastY - maxRadius;
        radius.value = 0;
        visible.value = false;

        const indicator = function(timestamp) {
            if (lastPointerDown !== null && Math.abs(lastX - input.mx) <= 10 && Math.abs(lastY - input.my) <= 10) {
                const duration = timestamp - lastPointerDown;
                // if we reached the maximum time
                if (duration >= timeThresholdMax) {
                    window.cancelAnimationFrame(handle);
                    radius.value = 0;
                    lastPointerDown = null;
                    x.value = lastX + 10;
                    y.value = lastY + 5;
                    visible.value = true;

                    // remove last path
                    if (note.tool === note.tools.BRUSH) {
                        note.removeLastObject();
                    }

                    return;
                }
                // if we reached the minimum time
                if (duration >= timeThresholdMin) {
                    indicatorT.value = duration / timeThresholdMax;
                    radius.value = easeOutQuad(indicatorT.value) * maxRadius;
                }
                // next frame
                handle = window.requestAnimationFrame(indicator);
            } else {
                // conditions not met - cancel preview
                window.cancelAnimationFrame(handle);
                lastPointerDown = null;
                radius.value = 0;
                visible.value = false;
            }
        }

        let handle = window.requestAnimationFrame(indicator);
    }
    function onPointerUp(event) {
        if (!props.onGesture) return;
        if (lastPointerDown !== null){
            const duration = performance.now() - lastPointerDown;
            if (Math.abs(lastX - event.pageX) > 10 || Math.abs(lastY - event.pageY) > 10 ||
                duration < timeThresholdMax
            ) {
                lastPointerDown = null;
                radius.value = 0;
                visible.value = false;
            }
        }
    }

    function onModeChange() {
        visible.value = false;
        ignore.value = false;
    }

    onMounted(function() {
        note.on("annotation:created connect:cancel connect:created selection:cleared", function() {
            if (!ignore.value && props.onAction) {
                radius.value = 0;
                lastPointerDown = null;
                x.value = input.mx + 10;
                y.value = input.my + 5;
                visible.value = true;
            }
        });
        input.on("pointerdown", onPointerDown)
        input.on("pointerup", onPointerUp)
    });

    watch(tool, onModeChange);

</script>

<style scoped>
.pointer-menu {
    position: fixed;
    margin: 0;
    padding: 0;
    z-index: 2004;
}
</style>