<template>
    <div>Hi</div>
</template>

<script setup>
    import { ref, onMounted, watch } from 'vue';
    import { useVextNote } from '@/store/note';
    import { useVextWhiteboard } from '@/store/whiteboard';
    import { MODES } from '@/use/enums';
    import { storeToRefs } from 'pinia';
    import { useVextInput } from '@/store/input';
    import { useVextSettings } from '@/store/settings';

    const input = useVextInput();
    const note = useVextNote();
    const { mode } = storeToRefs(note);

    const settings = useVextSettings();
    const { brushSize, color } = storeToRefs(settings);

    const wb = useVextWhiteboard();
    const { enabled } = storeToRefs(wb);

    wb.setBrushSize(brushSize.value)
    wb.setBrushColor(color.value)

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

    watch(brushSize, wb.setBrushSize)
    watch(color, wb.setBrushColor)

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