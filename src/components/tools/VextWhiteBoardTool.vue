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
    import { useVextNoteSettings } from '@/store/note-settings';

    const input = useVextInput();
    const note = useVextNote();
    const settings = useVextNoteSettings();
    const { brushSize, color } = storeToRefs(settings);
    const { mode } = storeToRefs(note);
    const wb = useVextWhiteboard();

    wb.setBrushSize(brushSize.value)
    wb.setBrushColor(color.value)

    onMounted(function() {
        input.on("keydown", function(event) {
            if (wb.enabled && (event.key === "Delete" || event.key === "Backspace")) {
                wb.deleteActiveObject();
            }
        })
        if (mode.value === MODES.WHITEBOARD) {
            wb.enable();
        }
    });

    watch(brushSize, () => wb.setBrushSize(brushSize.value))
    watch(color, () => wb.setBrushColor(color.value))

    watch(mode, async (now, prev) => {
        if (prev !== MODES.WHITEBOARD && now === MODES.WHITEBOARD) {
            wb.enable();
        } else if (prev === MODES.WHITEBOARD && now !== MODES.WHITEBOARD) {
            wb.disable()
        }
    });
</script>