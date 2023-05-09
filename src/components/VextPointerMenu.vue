<template>
    <div v-if="visible" class="pointer-menu" :style="{ 'left': x+'px', 'top': y+'px', }">
        <v-sheet elevation="4" rounded>
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
        </v-sheet>
    </div>
</template>

<script setup>
    import { useVextInput } from '@/store/input';
    import { useVextNote } from '@/store/note';
    import { storeToRefs } from 'pinia';
    import { ref, watch, computed, onMounted } from 'vue';

    const input = useVextInput();
    const note = useVextNote();

    const { tool } = storeToRefs(note);
    const { ACTIONS } = storeToRefs(input);

    const props = defineProps({
        options: {
            type: Array,
            default() {
                return [
                    [{
                        id: "accept",
                        icon: "mdi-check",
                        action: "accept",
                        color: "success",
                    },{
                        id: "accept_ignore",
                        icon: "mdi-check-all",
                        action: "accept_ignore",
                        color: "success",
                    }],[{
                        id: "cancel",
                        icon: "mdi-close-circle-outline",
                        action: "cancel",
                        color: "error",
                    },{
                        id: "cancel_ignore",
                        icon: "mdi-close-circle-multiple-outline",
                        action: "cancel_ignore",
                        color: "error",
                    }],[{
                        id: "brush",
                        icon: "mdi-draw",
                        action: "mode"
                    }],[{
                        id: "shape",
                        icon: "mdi-shape",
                        action: "mode"
                    }],[{
                        id: "edit",
                        icon: "mdi-cursor-pointer",
                        action: "mode"
                    }],[{
                        id: "layer",
                        icon: "mdi-layers",
                        action: "mode"
                    }],[{
                        id: "connect",
                        icon: "mdi-connection",
                        action: "mode"
                    }],
                ]
            }
        }
    });

    const visible = ref(false);
    const ignore = ref(false);
    const x = ref(10)
    const y = ref(10)

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

    function onPointerDown() {
        if (ignore.value) {
            visible.value = false;
        } else {
            const vals = input.getPointerMove(document.body);
            x.value = vals[0] + 10;
            y.value = vals[1] + 5;
            visible.value = true;
        }
    }
    function onModeChange() {
        visible.value = false;
        ignore.value = false;
    }

    onMounted(function() {
        note.on("annotation:created connect:cancel connect:created selection:cleared", onPointerDown);
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