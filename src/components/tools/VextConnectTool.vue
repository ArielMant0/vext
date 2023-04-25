<template>
    <div>
        <vue-json-pretty v-if="datapoint !== null" :data="datapoint" :showDoubleQuotes="false"/>
        <div v-else style="text-align: center;" class="mt-5">select data and then an annotation to connect them</div>
    </div>
</template>

<script setup>

    import { reactive, ref, onMounted } from 'vue';
    import { useVextNote } from '@/store/note';
    import { fabric } from 'fabric';

    const note = useVextNote();
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
        lineObj = new fabric.Path(`M ${x} ${y} L ${x} ${y}`, {
            stroke: note.color,
            strokeWidth: 1,
            strokeUniform: true,
            opacity: 1
        });
        note.canvas.add(lineObj);
    }

    function update(x, y) {
        lineObj.set("path", [["M", line.x0, line.y0], ["L", x, y]])
        lineObj.dirty = true;
        note.canvas.requestRenderAll();
    }

    function end() {
        drawing = false;
        note.canvas.remove(lineObj);
        lineObj = null;
    }

    function init() {
        window.addEventListener("v-connectstart", function(event) {
            if (note.tool === note.tools.CONNECT) {
                datapoint.value = event.detail.source;
                start(event.detail.x, event.detail.y);
            }
        })
        window.addEventListener("v-connectmove", function(event) {
            if (note.tool === note.tools.CONNECT && drawing) {
                update(event.detail.x, event.detail.y);
            }
        })
        window.addEventListener("v-connectend", function(event) {
            if (note.tool === note.tools.CONNECT && drawing) {
                end();
            }
        })

        window.addEventListener("pointermove", function(event) {
            if (note.tool === note.tools.CONNECT && drawing) {
                note.moveConnect(event);
            }
        })
        window.addEventListener("pointerup", function(event) {
            if (note.tool === note.tools.CONNECT && drawing) {
                note.endConnect(event);
            }
        })

    }

    onMounted(init);

</script>