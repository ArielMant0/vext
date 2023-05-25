<template>
    <div>
        <VextCircleMenu v-model="open"
            :items="visibleOptions" :x="x" :y="y"
            :close-on-click="false"
            @click="o => performAction(o.action, o.id)"
            @close="pointerMenu = false">

            <template #button="{ item, degree }">
                <v-btn :style="{ 'transform': `rotate(${degree}deg)` }"
                    :icon="item.icon" rounded :color="item.color"
                    :disabled="isDisabled(item.action)"
                    size="small"/>
            </template>
        </VextCircleMenu>

        <VextCircleSettingsMenu v-model="openSettings"
            :x="x" :y="y"
            @close="pointerMenu = false"/>

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
    import VextCircleSettingsMenu from './VextCircleSettingsMenu.vue';
    import { useVextInput } from '@/store/input';
    import { useVextNote } from '@/store/note';
    import { useVextHistory } from '@/store/history';
    import { storeToRefs } from 'pinia';
    import { ref, watch, computed, onMounted } from 'vue';
    import { pointerMenuOptions } from '@/use/util';
    import { useVextNoteSettings } from '@/store/note-settings';
    import { ACTIONS, MODES } from '@/use/enums';

    const input = useVextInput();
    const note = useVextNote();
    const history = useVextHistory();

    const { mode } = storeToRefs(note);
    const { pointerMenu, onAction, onGesture } = storeToRefs(useVextNoteSettings())

    const props = defineProps({
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
        }
    });

    const open = ref(false)
    const openSettings = ref(false)

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

    const options = pointerMenuOptions();

    const visibleOptions = computed(() => {
        return options.filter(d => {
            switch(d.action) {
                case ACTIONS.ACCEPT:
                case ACTIONS.ACCEPT_IGNORE:
                case ACTIONS.CANCEL:
                case ACTIONS.CANCEL_IGNORE:
                    return trigger.value !== "click"
                case ACTIONS.UNDO:
                case ACTIONS.REDO:
                    return trigger.value === "click"
                case ACTIONS.MODE:
                    return d.id !== mode.value;
                case ACTIONS.SETTINGS:
                    return mode.value === MODES.BRUSH || mode.value === MODES.SHAPE;
                default:
                    return true;
            }
        })
    });

    function performAction(action, id) {
        switch(action) {
            case ACTIONS.ACCEPT_IGNORE:
                ignore.value = true;
            case ACTIONS.ACCEPT:
                pointerMenu.value = false;
                open.value = false;
                break;
            case ACTIONS.CANCEL_IGNORE:
                ignore.value = true;
            case ACTIONS.CANCEL:
                history.undo(false);
                pointerMenu.value = false;
                open.value = false;
                break;
            case ACTIONS.UNDO:
                history.undo();
                break;
            case ACTIONS.REDO:
                history.redo();
                break;
            case ACTIONS.MODE:
                note.setMode(id);
                pointerMenu.value = false;
                open.value = false;
                break;
            case ACTIONS.SETTINGS:
                openSettings.value = true;
                open.value = false;
                break;
        }
    }

    function isDisabled(action) {
        switch(action) {
            case ACTIONS.UNDO:
                return !history.hasUndo;
            case ACTIONS.REDO:
                return !history.hasRedo;
            default:
                return false;
        }
    }

    function easeInOutSine(value) {
        return -(Math.cos(Math.PI * value) - 1) / 2;
    }
    function easeOutQuad(value) {
        return 1 - (1 - value) * (1 - value);
    }

    function onPointerDown(event) {

        if (!onGesture.value || open.value ||  pointerMenu.value ||
            lastPointerDown !== null) return;

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
                    pointerMenu.value = true;
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
            }
        }

        let handle = window.requestAnimationFrame(indicator);
    }
    function onPointerUp(event) {
        if (!onGesture.value || open.value || pointerMenu.value ||
            lastPointerDown === null) return;

        const duration = performance.now() - lastPointerDown;
        if (Math.abs(lastX - event.pageX) > 10 || Math.abs(lastY - event.pageY) > 10 ||
            duration < props.timeThresholdMax
        ) {
            lastPointerDown = null;
            radius.value = 0;
            open.value = false;
            pointerMenu.value = false;
        }
    }

    function onModeChange() {
        open.value = false;
        ignore.value = false;
        pointerMenu.value = false;
    }

    function showFromEvent(event) {
        if (!ignore.value && onAction.value && !open.value) {
            trigger.value = "event";
            radius.value = 0;
            lastPointerDown = null;
            x.value = input.mx + 10;
            y.value = input.my + 5;
            open.value = true;
            pointerMenu.value = true;
        }
    }

    onMounted(function() {
        note.on("pointer-menu", showFromEvent);
        input.on("pointerdown", onPointerDown)
        input.on("pointerup", onPointerUp)
    });

    watch(mode, onModeChange);

</script>

<style scoped>
.menu-indicator {
    position: fixed;
    margin: 0;
    padding: 0;
    z-index: 3002;
}
</style>