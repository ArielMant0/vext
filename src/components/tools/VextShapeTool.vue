<template>
    <div style="display: flex; flex-direction: column;">
        <v-btn-toggle v-model="shape">
            <v-btn icon="mdi-circle" size="small" round value="circle"/>
            <v-btn icon="mdi-square" size="small" round value="rectangle"/>
            <v-btn icon="mdi-triangle" size="small" round value="triangle"/>
            <v-btn icon="mdi-format-text" size="small" round value="text"/>
        </v-btn-toggle>
        <div v-if="shape === 'circle'" style="display: flex;" class="mt-2">
            <v-text-field v-model="dimx" type="number" label="radius" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
        </div>
        <div v-else-if="shape === 'text'" style="display: flex;" class="mt-2">
            <v-text-field v-model="dimx" type="number" label="font size" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
        </div>
        <div v-else style="display: flex;" class="mt-2">
            <v-text-field v-model="dimx" type="number" label="width" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
            <v-text-field v-model="dimy" type="number" label="height" density="compact" variant="outlined" class="vext-small-num"></v-text-field>
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
        <v-btn size="small" @click="addObject" color="primary" class="mb-3">add item</v-btn>
        <VextColorViewer/>
    </div>
</template>

<script setup>
    /**
     * Component to add simple shapes or text to the NoteCanvas.
     */
    import { ref } from 'vue';
    import { fabric } from 'fabric';
    import { useVextNote } from '@/store/note';
    import { useVextApp } from '@/store/app';
    import VextColorViewer from './VextColorViewer.vue';

    const note = useVextNote();
    const app = useVextApp();
    const shape = ref("circle");

    const emit = defineEmits([
        /**
         * This event is emitted when a text object is selected with the
         * object itself as the event payload.
         */
        "select",
        /**
         * This event is emitted when a text object is deselected.
         */
        "deselect"
    ]);

    const strokeWidth = ref(note.brushSize)
    const dimx = ref(30)
    const dimy = ref(30)

    const stroke = ref("primary color")
    const fill = ref("primary color")

    function addObject() {
        let obj;

        if (fill.value === "none" && stroke.value === "none") {
            // show alert
            app.error("at least one of 'fill' or 'stroke' must have a color");
            return;
        }

        switch(shape.value) {
            case "rectangle":
                obj = new fabric.Rect({
                    width: dimx.value, height: dimy.value,
                    top: 10, left: 10,
                    stroke: stroke.value === "none" ? null :
                        (stroke.value === "primary color" ? note.color0 : note.color1),
                    strokeWidth: strokeWidth.value,
                    strokeUniform: true,
                    fill: fill.value === "none" ? null :
                        (fill.value === "primary color" ? note.color0 : note.color1)
                });
                break;
            case "circle":
                obj = new fabric.Circle({
                    radius: dimx.value,
                    top: 10, left: 10,
                    stroke: stroke.value === "none" ? null :
                        (stroke.value === "primary color" ? note.color0 : note.color1),
                    strokeWidth: strokeWidth.value,
                    strokeUniform: true,
                    fill: fill.value === "none" ? null :
                        (fill.value === "primary color" ? note.color0 : note.color1)
                });
                break;
            case "triangle":
                obj = new fabric.Triangle({
                    width: dimx.value, height: dimy.value,
                    top: 10, left: 10,
                    stroke: stroke.value === "none" ? null :
                        (stroke.value === "primary color" ? note.color0 : note.color1),
                    strokeWidth: strokeWidth.value,
                    strokeUniform: true,
                    fill: fill.value === "none" ? null :
                        (fill.value === "primary color" ? note.color0 : note.color1)
                });
                break;
            case "text":
                obj = new fabric.Text("new text", {
                    fontFamily: "Avenir", top: 10, left: 10,
                    fontSize: dimx.value,
                    fill: note.color,
                });
                obj.onSelect = () => emit("select", obj);
                obj.onDeselect = () => emit("deselect");
                break;
        }

        note.addObject(obj)
    }

</script>
