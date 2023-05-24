import { defineStore } from "pinia"
import { useVextNote } from "./note";
import html2canvas from "html2canvas";
import WhiteBoardLayer from "@/use/whiteboard-layer";
import { MODES } from "@/use/enums";
import { useVextNoteSettings } from "@/store/note-settings";
import { fabric } from 'fabric';

const vextWhiteboard = {
    state: () => {
        return {
            canvas: null,

            mode: MODES.EDIT,
            enabled: false,

            modified: {},
            layers: {},
            selectedLayer: "",
            groupSelected: false,

            border: {
                color: "lightgrey",
                size: 1,
            }
        };
    },

    actions: {

        setMode(mode) {
            if (mode !== this.mode) {
                this.mode = mode;

                if (this.mode === MODES.BRUSH) {
                    // TODO: enable free drawing
                    this.canvas.isDrawingMode = true;
                } else {
                    // TODO: disable free drawing
                    this.canvas.isDrawingMode = false;
                }
            }
        },

        setCanvas(canvas) {
            this.canvas = canvas;
            const brush = new fabric.PencilBrush(canvas);
            const settings = useVextNoteSettings();
            brush.decimate = settings.brushDecimation;
            brush.color = settings.color0;
            brush.width = settings.brushSize;
            canvas.freeDrawingBrush = brush;
        },

        setBrushColor(color) {
            console.log("setBrushColor")
            if (this.canvas) {
                console.log(color)
                this.canvas.freeDrawingBrush.color = color;
            }
        },

        setBrushSize(size) {
            console.log("setBrushSize")
            if (this.canvas) {
                console.log(size)
                this.canvas.freeDrawingBrush.width = size;
            }
        },

        setCanvasZIndex(value) {
            if (this.canvas) {
                this.canvas.wrapperEl.style.zIndex = value;
                this.canvas.upperCanvasEl.style.zIndex = value;
                this.canvas.lowerCanvasEl.style.zIndex = value
            }
        },

        resizeCanvas(width, height) {
            if (this.canvas) {
                this.canvas.setWidth(width);
                this.canvas.setHeight(height);
            }
        },

        async show() {
            const note = useVextNote();
            const proms = [];
            note.userLayers.forEach(l => {
                if (!this.modified[l.id]) {
                    proms.push(this.addLayerImage(l))
                } else if (l.modified !== this.modified[l.id]) {
                    proms.push(this.updateLayerImage(l))
                }
            })
            return Promise.all(proms).then(() => {
                this.enabled = true
                this.canvas.renderAll()
            })
        },

        hide() {
            this.enabled = false;
        },

        selectLayer(id) {
            if (this.layers[id]) {
                this.selectedLayer = id;
                this.layers[id].select(this.canvas);
            }
        },

        deleteActiveObject() {
            const obj = this.canvas.getActiveObject();
            if (this.enabled && obj && obj.type === "path") {
                this.canvas.discardActiveObject();
                this.canvas.remove(obj);
            }
        },

        async addLayerImage(layer) {
            const id = layer.id;
            const note = useVextNote();
            const node = note.canvas.wrapperEl.parentNode.parentNode;
            const rect = node.getBoundingClientRect();
            const w = Math.floor(rect.width);
            const h = Math.floor(rect.height);
            this.modified[id] = layer.modified;

            return html2canvas(node, { width: w, height: h })
                .then(canvas => {
                    console.debug("adding WhiteBoardLayer for layer " + id)
                    this.layers[id] = new WhiteBoardLayer(
                        id,
                        canvas, {
                            top: 10, left: 10,
                            scaleX: 0.25, scaleY: 0.25,
                            width: w, height: h,
                            stroke: this.border.color,
                            strokeWidth: this.border.size,
                        },
                        layer.comments
                    );
                    this.layers[id].addToCanvas(this.canvas);
                })
        },

        async updateLayerImage(layer) {
            const id = layer.id;
            const note = useVextNote();
            const node = note.canvas.wrapperEl.parentNode.parentNode;
            const rect = node.getBoundingClientRect();
            const w = Math.floor(rect.width);
            const h = Math.floor(rect.height);
            this.modified[id] = layer.modified;

            return html2canvas(node, { width: w, height: h })
                .then(canvas => {
                    console.debug("updating WhiteBoardLayer for layer " + id)
                    this.layers[id].update(
                        this.canvas,
                        canvas, {
                            top: 10, left: 10,
                            scaleX: 0.25, scaleY: 0.25,
                            width: w, height: h,
                            stroke: this.border.color,
                            strokeWidth: this.border.size,
                        },
                        layer.comments
                    );
                })
        },
    },
}

const useVextWhiteboard = defineStore("vext-whiteboard", vextWhiteboard);

export { useVextWhiteboard, vextWhiteboard };