<template>
    <div>Hi</div>
</template>

<script setup>
    import { onMounted, watch } from 'vue';
    import { useVextNote } from '@/store/note';
    import { useVextWhiteboard } from '@/store/whiteboard';
    import { MODES } from '@/use/enums';
    import { storeToRefs } from 'pinia';

    const note = useVextNote();
    const { mode } = storeToRefs(note);
    const wb = useVextWhiteboard();

    onMounted(function() {
        if (mode.value === MODES.WHITEBOARD) {
            wb.show();
        }
    })

    watch(mode, (now, prev) => {
        if (prev !== MODES.WHITEBOARD && now === MODES.WHITEBOARD) {
            wb.show();
        } else if (prev === MODES.WHITEBOARD && now !== MODES.WHITEBOARD) {
            wb.hide()
        }
    })
</script>