import { defineStore } from "pinia"
import { fabric } from 'fabric';
import html2canvas from "html2canvas";
import { useVextNote } from "./note";

const vextWhiteboard = {
    state: () => {
        return {
            canvas: null,
            visible: false,

            images: {},
            modified: {},

            border: {
                color: "lightgrey",
                size: 1,
            }
        };
    },

    actions: {

        /**
         * Set the alert text and type for a global alert
         */
        setCanvas(canvas) {
           this.canvas = canvas;
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
            this.visible = true
            const note = useVextNote();
            const proms = [];
            note.userLayers.forEach(l => {
                if (!this.modified[l.id] || l.modified !== this.modified[l.id]) {
                    proms.push(this.addLayerImage(l))
                }
            })
            return Promise.all(proms).then(() => this.canvas.renderAll())
        },

        hide() {
            this.visible = false;
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
                    if (this.images[id]) {
                        console.debug("updating image for layer " + id)
                        this.images[id].setElement(canvas);
                        this.images[id].set("dirty", true)
                        this.images[id].setCoords();
                    } else {
                        console.debug("adding image for layer " + id)
                        this.images[id] = new fabric.Image(canvas, {
                            top: 10, left: 10,
                            scaleX: 0.25, scaleY: 0.25,
                            width: w, height: h,
                            stroke: this.border.color,
                            strokeWidth: this.border.size,
                        });
                        this.canvas.add(this.images[id]);
                    }
                })
        },
    },
}

const useVextWhiteboard = defineStore("vext-whiteboard", vextWhiteboard);

export { useVextWhiteboard, vextWhiteboard };