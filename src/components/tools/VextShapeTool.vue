<template>
    <div style="display: flex; flex-direction: column;">
        <v-btn-toggle v-model="shape">
            <v-btn icon="mdi-circle" size="small" round value="circle"/>
            <v-btn icon="mdi-square" size="small" round value="rectangle"/>
            <v-btn icon="mdi-triangle" size="small" round value="triangle"/>
            <v-btn icon="mdi-format-text" size="small" round value="text"/>
        </v-btn-toggle>
        <div v-if="shape === 'circle'" style="display: flex;" class="mt-2">
            <v-text-field v-model="brushShape.size0" type="number" label="radius" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
        </div>
        <div v-else-if="shape === 'text'" style="display: flex;" class="mt-2">
            <v-text-field v-model="brushShape.size0" type="number" label="font size" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
        </div>
        <div v-else style="display: flex;" class="mt-2">
            <v-text-field v-model="brushShape.size0" type="number" label="width" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
            <v-text-field v-model="brushShape.size1" type="number" label="height" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
        </div>
        <div class="text-caption">stroke width</div>
        <v-slider v-model="strokeWidth" min="1" max="250" step="1" thumb-size="15" density="compact">
            <template v-slot:append>
                <v-text-field
                    v-model="strokeWidth"
                    type="number"
                    style="width: 80px"
                    density="compact"
                    hide-details
                    variant="solo"
                ></v-text-field>
            </template>
        </v-slider>
        <v-select v-if="shape !== 'text'" v-model="stroke" label="stroke" :items="['primary color', 'secondary color', 'none']" density="compact" variant="solo" style="max-width: 275px;"></v-select>
        <v-select v-if="shape !== 'text'" v-model="fill" label="fill" :items="['primary color', 'secondary color', 'none']" density="compact" variant="solo" style="max-width: 275px;"></v-select>
        <VextColorViewer/>
    </div>
</template>

<script setup>
    /**
     * Component to add simple shapes or text to the NoteCanvas.
     */
    import { ref, onMounted, toRaw, watch, reactive } from 'vue';
    import { fabric } from 'fabric';
    import { useVextNote } from '@/store/note';
    import { useVextApp } from '@/store/app';
    import { useVextNoteSettings } from '@/store/note-settings';
    import { storeToRefs } from 'pinia';
    import { MODES } from '@/use/enums';
    import VextColorViewer from './VextColorViewer.vue';

    const note = useVextNote();
    const app = useVextApp();
    const settings = useVextNoteSettings();
    const mode = ref("create");

    const { shape } = storeToRefs(settings);

    const strokeWidth = ref(settings.shapeDim0)

    const stroke = ref("primary color")
    const fill = ref("none")

    const brushShape = reactive({
        x: 10,
        y: 10,
        size0: 30,
        size1: 30,
        obj: null
    })

    function readColor(value) {
        return value === "none" ? null :
            (value === "primary color" ? settings.color0 : settings.color1)
    }

    function initBrushShape() {

        if (brushShape.obj) {
            note.canvas.remove(toRaw(brushShape.obj));
        }

        switch(shape.value) {
            case "rectangle":
                brushShape.obj = new fabric.Rect(getShapeOptions());
                break;
            case "circle":
                brushShape.obj = new fabric.Circle(getShapeOptions());
                break;
            case "triangle":
                brushShape.obj = new fabric.Triangle(getShapeOptions());
                break;
            case "text":
                brushShape.obj = new fabric.Text("text", getShapeOptions());
                break;
        }

        brushShape.obj.set("selectable", false);
        brushShape.obj.set("hoverCursor", "default");

        note.canvas.add(toRaw(brushShape.obj))
    }

    function updateShape() {
        brushShape.obj.set(getShapeOptions());
        brushShape.obj.set("dirty", true)
        note.canvas.requestRenderAll();
    }

    function addShape() {
        if (brushShape.obj) {
            if (fill.value === "none" && stroke.value === "none") {
                // show alert
                app.error("at least one of 'fill' or 'stroke' must have a color");
                return;
            }

            note.canvas.remove(toRaw(brushShape.obj));

            let newObj;
            switch(shape.value) {
                case "rectangle":
                    newObj = new fabric.Rect(getShapeOptions());
                    break;
                case "circle":
                    newObj = new fabric.Circle(getShapeOptions());
                    break;
                case "triangle":
                    newObj = new fabric.Triangle(getShapeOptions());
                    break;
                case "text":
                    newObj = new fabric.IText("", getShapeOptions());
                    break;
            }

            const uuid = note.addObject(newObj)

            note.setActiveObject(uuid);
            if (shape.value === "text") {
                newObj.enterEditing();
            }

            initBrushShape();
        }
    }

    function getShapeOptions() {
        switch(shape.value) {
            case "rectangle":
                return {
                    width: brushShape.size0,
                    height: brushShape.size1,
                    top: brushShape.y-brushShape.size1*0.5,
                    left: brushShape.x-brushShape.size0*0.5,
                    stroke: readColor(stroke.value),
                    strokeWidth: strokeWidth.value,
                    strokeUniform: true,
                    fill: readColor(fill.value)
                };
            case "circle":
                return{
                    radius: brushShape.size0,
                    top: brushShape.y-brushShape.size0,
                    left: brushShape.x-brushShape.size0,
                    stroke: readColor(stroke.value),
                    strokeWidth: strokeWidth.value,
                    strokeUniform: true,
                    fill: readColor(fill.value)
                };
            case "triangle":
                return {
                    width: brushShape.size0,
                    height: brushShape.size1,
                    top: brushShape.y-brushShape.size1*0.5,
                    left: brushShape.x-brushShape.size0*0.5,
                    stroke: readColor(stroke.value),
                    strokeWidth: strokeWidth.value,
                    strokeUniform: true,
                    fill: readColor(fill.value)
                };
            case "text":
                return {
                    fontFamily: "Avenir",
                    top: brushShape.y,
                    left: brushShape.x,
                    fontSize: brushShape.size0,
                    fill: note.color,
                };
        }
    }

    onMounted(function() {
        initBrushShape();

        note.canvas
            .on("mouse:up", function() {
                if (note.mode === MODES.SHAPE && !settings.pointerMenu) {
                    if (mode.value === "create") {
                        addShape();
                        brushShape.obj.set("visible", false)
                        brushShape.obj.set("dirty", true)
                        note.canvas.requestRenderAll();
                        mode.value = "modify";
                    } else if (mode.value === "wait") {
                        mode.value = "create";
                    }
                }
            })
            .on("mouse:move", function(event) {
                brushShape.x = event.pointer.x;
                brushShape.y = event.pointer.y;
                if (note.mode === MODES.SHAPE && mode.value !== "modify" && !settings.pointerMenu) {
                    updateShape();
                }
            })
            .on("selection:cleared", function(event) {
                if (note.mode === MODES.SHAPE && mode.value === "modify" && !settings.pointerMenu) {
                    brushShape.obj.set("visible", true)
                    updateShape();
                    mode.value = event.e ? "wait" : "create";
                }
            })

    })

    function createOrDestroyShape() {
        if (note.mode === MODES.SHAPE) {
            initBrushShape();
        } else {
            if (brushShape.obj) {
                note.canvas.remove(toRaw(brushShape.obj));
            }
            brushShape.obj = null;
        }
    }

    watch(shape, initBrushShape);
    watch(() => note.mode, createOrDestroyShape)

</script>
