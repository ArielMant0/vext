<template>
    <div>
        <VextCircleMenu v-model="open"
            :items="visibleOptions" :x="x" :y="y"
            :close-on-click="closeOnClick" :z-index="zIndex"
            @click="o => performAction(o.action, o.value)"
            @close="onClose(false)">

            <template #button="{ item, degree }">
                <v-btn v-if="item.icon"
                    :style="{ 'transform': `rotate(${degree}deg)` }"
                    :icon="item.icon" rounded :color="item.color"
                    :disabled="isDisabled(item.action)"
                    size="small"/>
                <v-btn v-else :style="{ 'transform': `rotate(${degree}deg)` }"
                    rounded :color="item.color"
                    :disabled="isDisabled(item.action)">
                    {{ item.value }}
                </v-btn>
            </template>
        </VextCircleMenu>

        <VextCircleSettingsMenu v-model="openSettings"
            :x="x" :y="y" :z-index="zIndex"
            :close-on-click="closeOnClick"
            @click="onClose(true)"
            @close="onClose(true)"/>

        <div v-if="indicator && radius > 0" class="menu-indicator" :style="{ 'left': indicatorX+'px', 'top': indicatorY+'px', 'z-index': zIndex }">

            <slot name="indicator" :t="indicatorT" :fill="fill ? fillColor : null" :stroke="stroke ? strokeColor : null">
                <svg :width="maxRadius*2+10" :height="maxRadius*2+10">
                    <circle :fill="fill ? fillColor : 'none'" :stroke="stroke ? strokeColor : 'none'" :stroke-width="strokeWidth"
                        :stroke-opacity="indicatorT" :fill-opacity="indicatorT*0.25"
                        :r="radius" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                    <circle :fill="fill ? fillColor : 'none'" :stroke="stroke ? strokeColor : 'none'" :stroke-width="strokeWidth"
                        :stroke-opacity="indicatorT" :fill-opacity="indicatorT*0.25"
                        :r="Math.max(1, radius-8)" :cx="maxRadius+5" :cy="maxRadius+5"></circle>
                    <circle :fill="fill ? fillColor : 'none'" :stroke="stroke ? strokeColor : 'none'" :stroke-width="strokeWidth"
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
    import { useVextWhiteboard } from '@/store/whiteboard'
    import { storeToRefs } from 'pinia';
    import { ref, watch, computed } from 'vue';
    import { pointerMenuOptions } from '@/use/util';
    import { useVextSettings } from '@/store/settings';
    import { ACTIONS, MODES } from '@/use/enums';

    const input = useVextInput();
    const note = useVextNote();
    const history = useVextHistory();
    const wb = useVextWhiteboard();

    const { mode } = storeToRefs(note);
    const { pointerMenu, onAction, onGesture, closeOnClick } = storeToRefs(useVextSettings())

    const props = defineProps({
        /**
         * Whether to show an indicator when the gesture is initiated.
         */
        indicator: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to stroke the indicator.
         */
        stroke: {
            type: Boolean,
            default: true
        },
        /**
         * Whether to fill the indicator.
         */
        fill: {
            type: Boolean,
            default: false
        },
        /**
         * The stroke color to use for the indicator.
         */
        strokeColor: {
            type: String,
            default: "black",
            validator(value) {
                return CSS.supports("color", value)
            }
        },
        /**
         * The stroke color to use for the indicator.
         */
        strokeWidth: {
            type: Number,
            default: 2,
            validator(value) {
                return value >= 0
            }
        },
        /**
         * The fill color to use for the indicator
         */
        fillColor: {
            type: String,
            default: "black",
            validator(value) {
                return CSS.supports("color", value)
            }
        },
        /**
         * The minimum threshold (in ms) before the indicator is shown after initiating * the gesture.
         */
        timeThresholdMin: {
            type: Number,
            default: 125,
            validator(value) {
                return value >= 0;
            }
        },
        /**
         * The maximum threshold (in ms) that has to be reached with the gesture to open the menu.
         */
        timeThresholdMax: {
            type: Number,
            default: 1000,
            validator(value) {
                return value > 0;
            }
        },
        /**
         * CSS z-index value for the menu element.
         */
        zIndex: {
            type: [Number, String],
            default: 300,
            validator(value) {
                const num = Number.parseFloat(value);
                return !Number.isNaN(num) && num >= 0;
            }
        }
    });

    // whether a digital pen is captured
    let digitialPen = false;

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

    function close() {
        open.value = false;
        pointerMenu.value = false;
    }

    function onClose(isSettingsMenu=false) {
        if (isSettingsMenu && !closeOnClick.value) {
            open.value = true;
            pointerMenu.value = true;
        } else {
            open.value = false;
            pointerMenu.value = false;
        }
    }

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
                    return d.id !== mode.value && (d.id !== MODES.SETTINGS || trigger.value === "click");
                case ACTIONS.SETTINGS:
                    return trigger.value === "click" &&
                        (mode.value === MODES.BRUSH || mode.value === MODES.SHAPE ||
                        (mode.value === MODES.WHITEBOARD && wb.mode === MODES.BRUSH));
                default:
                    return true;
            }
        })
    });

    function performAction(action, value) {
        switch(action) {
            case ACTIONS.ACCEPT_IGNORE:
                ignore.value = true;
            case ACTIONS.ACCEPT:
                if (closeOnClick.value) close();
                break;
            case ACTIONS.CANCEL_IGNORE:
                ignore.value = true;
            case ACTIONS.CANCEL:
                history.undo(false);
                if (closeOnClick.value) close();
                break;
            case ACTIONS.UNDO:
                history.undo();
                break;
            case ACTIONS.REDO:
                history.redo();
                break;
            case ACTIONS.MODE:
                note.setMode(value);
                if (closeOnClick.value) close();
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
        lastX = event.pageX - window.scrollX;
        lastY = event.pageY - window.scrollY;
        indicatorX.value = lastX - maxRadius;
        indicatorY.value = lastY - maxRadius;
        radius.value = 0;

        trigger.value = "click";

        const indicator = function(timestamp) {
            const mx = input.mx - input.pointerMoveScroll.x;
            const my = input.my - input.pointerMoveScroll.y;

            if (lastPointerDown !== null && Math.abs(lastX - mx) <= 10 && Math.abs(lastY - my) <= 10) {
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
        const x = event.pageX - window.scrollX;
        const y = event.pageY - window.scrollY;
        if (Math.abs(lastX - x) > 10 || Math.abs(lastY - y) > 10 ||
            duration < props.timeThresholdMax
        ) {
            lastPointerDown = null;
            radius.value = 0;
            open.value = false;
            pointerMenu.value = false;
        }
    }

    function onModeChange() {
        if (closeOnClick.value) {
            open.value = false;
            ignore.value = false;
            pointerMenu.value = false;
        }
    }

    function showFromEvent(event) {
        if (!ignore.value && onAction.value && !open.value) {
            trigger.value = "event";
            radius.value = 0;
            lastPointerDown = null;
            x.value = input.mx - input.pointerMoveScroll.x + 10;
            y.value = input.my - input.pointerMoveScroll.y + 5;
            open.value = true;
            pointerMenu.value = true;
        }
    }

    note.on("pointer-menu", showFromEvent);
    input.on("pointerdown", onPointerDown)
    input.on("pointerup", onPointerUp)

    window.oncontextmenu = function() {
        if (digitialPen && onGesture.value && (open.value || lastPointerDown !== null)) {
            return false;
        }
        return true;
    }
    window.addEventListener("gotpointercapture", function(event) {
        digitialPen = event.pointerType === "pen" || event.pointerType === "touch";
    });
    window.addEventListener("lostpointercapture", function() {
        digitialPen = false;
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