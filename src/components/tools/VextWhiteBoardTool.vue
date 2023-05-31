<template>
    <div>Hi</div>
</template>

<script setup>
    import { onMounted, watch } from 'vue';
    import { useVextNote } from '@/store/note';
    import { useVextWhiteboard } from '@/store/whiteboard';
    import { MODES } from '@/use/enums';
    import { storeToRefs } from 'pinia';
    import { useVextInput } from '@/store/input';

    const input = useVextInput();
    const note = useVextNote();
    const { mode } = storeToRefs(note);

    const wb = useVextWhiteboard();
    const { enabled } = storeToRefs(wb);

    input.on("keydown", function(event) {
        if (enabled.value && (event.key === "Delete" || event.key === "Backspace")) {
            wb.deleteActiveObject();
        }
    })

    onMounted(function() {
        if (mode.value === MODES.WHITEBOARD) {
            wb.enable();
        }
    });

    watch(mode, (now, prev) => {
        if (prev !== MODES.WHITEBOARD && now === MODES.WHITEBOARD) {
            wb.enable();
        } else if (enabled.value && prev === MODES.WHITEBOARD) {
            wb.disable();
        }
    });

    watch(enabled, function() {
        if (!enabled.value && mode.value === MODES.WHITEBOARD) {
            note.setPreviousMode()
        }
    })
</script>