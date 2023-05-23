import { defineStore } from "pinia"
import { fabric } from 'fabric';
import html2canvas from "html2canvas";
import { useVextNote } from "./note";
import { toRaw } from "vue";

const vextWhiteboard = {
    state: () => {
        return {
            canvas: null,
            visible: false,

            images: {}
        };
    },

    actions: {

        /**
         * Set the alert text and type for a global alert
         */
        setCanvas(canvas) {
           this.canvas = canvas;
        },

        show() {
            this.visible = true;
        },

        hide() {
            this.visible = false;
        },

        async addLayerImage(id) {
            const note = useVextNote();
            const node = note.canvas.wrapperEl.parentNode.parentNode;
            const rect = node.getBoundingClientRect();
            html2canvas(node, { width: rect.width, height: rect.height })
                .then(canvas => {
                    if (this.images[id]) {
                        this.canvas.remove(toRaw(this.images[id]));
                    }
                    this.images[id] = new fabric.Image(canvas);
                    this.canvas.add(this.images[id], {
                        top: 10, left: 10,
                        width: 300, height: 300
                    });
                })
        },

        resizeCanvas(width, height) {
            if (this.canvas) {
                this.canvas.setWidth(width);
                this.canvas.setHeight(height);
            }
        }
    },
}

const useVextWhiteboard = defineStore("vext-whiteboard", vextWhiteboard);

export { useVextWhiteboard, Whiteboard };