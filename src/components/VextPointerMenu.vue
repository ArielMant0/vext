<template>
    <div>
        <VextCircleMenu v-model="open"
            :items="visibleOptions" :x="x" :y="y"
            @click="o => performAction(o.action, o.id)"/>


        <div v-if="indicator && radius > 0" class="menu-indicator" :style="{ 'left': indicatorX+'px', 'top': indicatorY+'px', }">

            <slot name="indicator" :t="indicatorT" :fill="fill ? fillColor : null" :stroke="stroke ? strokeColor : null">
                <svg :width="maxRadius*2+10" :height="maxRadius*2+10">
                    <circle :fill="fill ? fillColor : 'none'" :stroke="stroke ? strokeColor : 'none'" stroke-width="3"
                        :stroke-opacity="indicatorT" :fill-opacity="indicatorT*0.25"
                        :r="radius" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                    <circle :fill="fill ? fillColor : 'none'" :stroke="stroke ? strokeColor : 'none'" stroke-width="3"
                        :stroke-opacity="indicatorT" :fill-opacity="indicatorT*0.25"
                        :r="Math.max(1, radius-8)" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                    <circle :fill="fill ? fillColor : 'none'" :stroke="stroke ? strokeColor : 'none'" stroke-width="3"
                        :stroke-opacity="indicatorT" :fill-opacity="indicatorT*0.25"
                        :r="Math.max(1, radius-16)" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                </svg>
            </slot>
        </div>
    </div>
</template>

<script setup>
    import VextCircleMenu from './VextCircleMenu.vue';
    import { useVextInput } from '@/store/input';
    import { useVextNote } from '@/store/note';
    import { useVextHistory } from '@/store/history';
    import { storeToRefs } from 'pinia';
    import { ref, watch, computed, onMounted } from 'vue';

    const input = useVextInput();
    const note = useVextNote();
    const history = useVextHistory();

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
        indicator: {
            type: Boolean,
            default: true
        },
        stroke: {
            type: Boolean,
            default: true
        },
        fill: {
            type: Boolean,
            default: false
        },
        strokeColor: {
            type: String,
            default: "gray"
        },
        fillColor: {
            type: String,
            default: "gray"
        },
        timeThresholdMin: {
            type: Number,
            default: 125
        },
        timeThresholdMax: {
            type: Number,
            default: 1000
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
                    },
                ]
            }
        }
    });

    const open = ref(false)

    const ignore = ref(false);
    const x = ref(10);
    const y = ref(10);

    const indicatorX = ref(10);
    const indicatorY = ref(10);
    const indicatorT = ref(0);
    const radius = ref(0);

    const maxRadius = 30;

    let lastPointerDown = null;
    let lastX = 0, lastY = 0;

    let trigger = ref("click");

    const visibleOptions = computed(() => {
        return props.options.filter(d => {
            switch(d.action) {
                case ACTIONS.value.ACCEPT:
                case ACTIONS.value.ACCEPT_IGNORE:
                case ACTIONS.value.CANCEL:
                case ACTIONS.value.CANCEL_IGNORE:
                    return trigger.value !== "click"
                case ACTIONS.value.UNDO:
                case ACTIONS.value.REDO:
                    return trigger.value === "click"
                case ACTIONS.value.MODE:
                    return d.id !== note.tool;
            }
        })
    });

    function performAction(action, id) {
        switch(action) {
            case ACTIONS.value.ACCEPT_IGNORE:
                ignore.value = true;
                break;
            case ACTIONS.value.CANCEL_IGNORE:
                ignore.value = true;
            case ACTIONS.value.CANCEL:
                history.undo(false);
                break;
            case ACTIONS.value.UNDO:
                history.undo();
                break;
            case ACTIONS.value.REDO:
                history.redo();
                break;
            case ACTIONS.value.MODE:
                note.setTool(id);
                break;
        }
    }

    function easeInOutSine(value) {
        return -(Math.cos(Math.PI * value) - 1) / 2;
    }
    function easeOutQuad(value) {
        return 1 - (1 - value) * (1 - value);
    }

    function onPointerDown(event) {

        if (!props.onGesture || open.value) return;

        lastPointerDown = performance.now();
        lastX = event.pageX;
        lastY = event.pageY;
        indicatorX.value = lastX - maxRadius;
        indicatorY.value = lastY - maxRadius;
        radius.value = 0;

        trigger.value = "click";

        const indicator = function(timestamp) {
            if (lastPointerDown !== null && Math.abs(lastX - input.mx) <= 10 && Math.abs(lastY - input.my) <= 10) {
                const duration = timestamp - lastPointerDown;
                // if we reached the maximum time
                if (duration >= props.timeThresholdMax) {
                    window.cancelAnimationFrame(handle);
                    radius.value = 0;
                    lastPointerDown = null;
                    x.value = lastX + 10;
                    y.value = lastY + 5;
                    open.value = true;

                    // remove last path
                    if (note.tool === note.tools.BRUSH) {
                        note.removeLastObject();
                    }

                    return;
                }
                // if we reached the minimum time
                if (duration >= props.timeThresholdMin) {
                    indicatorT.value = duration / props.timeThresholdMax;
                    radius.value = easeOutQuad(indicatorT.value) * maxRadius;
                }
                // next frame
                handle = window.requestAnimationFrame(indicator);
            } else {
                // conditions not met - cancel preview
                window.cancelAnimationFrame(handle);
                lastPointerDown = null;
                radius.value = 0;
                open.value = false;
            }
        }

        let handle = window.requestAnimationFrame(indicator);
    }
    function onPointerUp(event) {
        if (!props.onGesture) return;
        if (lastPointerDown !== null){
            const duration = performance.now() - lastPointerDown;
            if (Math.abs(lastX - event.pageX) > 10 || Math.abs(lastY - event.pageY) > 10 ||
                duration < props.timeThresholdMax
            ) {
                lastPointerDown = null;
                radius.value = 0;
                open.value = false;
            }
        }
    }

    function onModeChange() {
        open.value = false;
        ignore.value = false;
    }

    function showFromEvent() {
        if (!ignore.value && props.onAction) {
            trigger.value = "event";
            radius.value = 0;
            lastPointerDown = null;
            x.value = input.mx + 10;
            y.value = input.my + 5;
            open.value = true;
        }
    }

    onMounted(function() {
        note.on("pointer-menu", showFromEvent);
        input.on("pointerdown", onPointerDown)
        input.on("pointerup", onPointerUp)
    });

    watch(tool, onModeChange);

</script>

<style scoped>
.menu-indicator {
    position: fixed;
    margin: 0;
    padding: 0;
    z-index: 3002;
}
</style>