<template>
    <div>
        <vue-json-pretty v-if="datapoint !== null" :data="datapoint" :showDoubleQuotes="false"/>
        <div v-else style="text-align: center;" class="mt-5">select data and then an annotation to connect them</div>
    </div>
</template>

<script setup>

    import { watch, reactive, ref } from 'vue';
    import { useVextNote } from '@/store/note';
    import { fabric } from 'fabric';
    import { useVextInput } from '@/store/input';
    import { MODES } from '@/use/enums';

    const note = useVextNote();
    const input = useVextInput()
    const line = reactive({
        x0: 0,
        y0: 0,
    });
    let lineObj = null;
    let drawing = false;

    const datapoint = ref(null);

    function start(x, y) {
        drawing = true;
        line.x0 = x;
        line.y0 = y;
        lineObj = new fabric.Line([x, y, x, y], {
            stroke: settings.color,
            strokeWidth: 1,
            strokeUniform: true,
            opacity: 1,
            selectable: false
        });
        note.canvas.add(lineObj);
    }

    function update(x, y) {
        lineObj.set({ x2: x, y2: y, dirty: true },);
        note.canvas.requestRenderAll();
    }

    function end() {
        drawing = false;
        note.canvas.remove(lineObj);
        lineObj = null;
    }

    note.on("connect:start", function(data) {
        if (note.mode === MODES.CONNECT) {
            datapoint.value = data.source;
            start(data.x, data.y);
        }
    })
    note.on("connect:move", function(data) {
        if (note.mode === MODES.CONNECT && drawing) {
            update(data.x, data.y);
        }
    })
    note.on("connect:end connect:cancel", function() {
        if (note.mode === MODES.CONNECT && drawing) {
            end();
        }
    })

    watch(() => input.pointerDown, function() {
        if (note.mode === MODES.CONNECT && drawing) {
            note.endConnect(input.dx, input.dy);
        }
    })

    watch(() => input.pointerMove, function() {
        if (note.mode === MODES.CONNECT && drawing) {
            note.moveConnect(input.mx, input.my);
        }
    })

</script>