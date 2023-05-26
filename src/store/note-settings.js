import { defineStore } from "pinia"
import { useVextHistory } from "./history";

let _CANVAS;

const vextNoteSettingsStore = {

    state: () => {
        return {

            pointerMenu: false,
            onAction: true,
            onGesture: true,
            closeOnClick: true,

            activeColor: 0,
            color0: "#ffffff",
            color1: "#000000",
            brushSize: 1,
            brushDecimation: 5,

            shape: "text",
            shapeDim0: 10,
            shapeDim1: 10,

            // d3.schemeTableau10
            defaultColors: [
                "#4e79a7",
                "#f28e2c",
                "#e15759",
                "#76b7b2",
                "#59a14f",
                "#edc949",
                "#af7aa1",
                "#ff9da7",
                "#9c755f",
                "#bab0ab",
            ],
        };
    },

    getters: {
        color: state => state.activeColor === 0 ? state.color0 : state.color1,
    },

    actions: {

        setCanvas(canvas) {
            _CANVAS = canvas;
        },

        defaultColorAt(index) {
            return this.defaultColors[index % this.defaultColors.length]
        },

        setBrushSize(size, record=true) {
            const newVal = Math.max(size, 1);
            if (record) {
                const history = useVextHistory();
                history.do("set brush size to "+newVal,
                    this.setBrushSize.bind(this, newVal, false),
                    this.setBrushSize.bind(this, this.brushSize, false)
                );
            }
            _CANVAS.freeDrawingBrush.width = newVal;
            this.brushSize = newVal;
        },

        setBrushDecimation(value, record=true) {
            const newVal = Math.max(value, 0);
            if (record) {
                const history = useVextHistory();
                history.do("set brush decimation to "+newVal,
                    this.setBrushDecimation.bind(this, newVal, false),
                    this.setBrushDecimation.bind(this, this.brushDecimation, false)
                );
            }
            _CANVAS.freeDrawingBrush.decimate = newVal;
            this.brushDecimation = newVal;
        },

        selectColor(id=null, record=true) {
            const newColor = id === 0 || id === 1 ? id : Math.abs(1-this.activeColor);
            if (record) {
                const history = useVextHistory();
                history.do("select color to "+(newColor === 0 ? 'primary' : 'secondary'),
                    this.selectColor.bind(this, newColor, false),
                    this.selectColor.bind(this, this.activeColor, false)
                );
            }
            this.activeColor = newColor
            _CANVAS.freeDrawingBrush.color = this.color;
        },

        setColorPrimary(color, record=true) {
            if (record) {
                const history = useVextHistory();
                history.do("set primary color to "+color,
                    this.setColorPrimary.bind(this, color, false),
                    this.setColorPrimary.bind(this, this.color0, false),
                );
            }
            this.color0 = color;
            if (this.activeColor === 0) {
                _CANVAS.freeDrawingBrush.color = color
            }
        },

        setColorSecondary(color, record=true) {
            if (record) {
                const history = useVextHistory();
                history.do("set secondary color to "+color,
                    this.setColorSecondary.bind(this, color, false),
                    this.setColorSecondary.bind(this, this.color1, false),
                );
            }
            this.color1 = color;
            if (this.activeColor === 1) {
                _CANVAS.freeDrawingBrush.color = color
            }
        },

        setShape(shape, record=true) {
            switch (shape) {
                case "text":
                case "circle":
                case "rectangle":
                case "triangle":
                    if (shape !== this.shape) {
                        this.shape = shape;
                        if (record) {
                            const history = useVextHistory();
                                history.do("set shape to "+shape,
                                this.setShape.bind(this, shape, false),
                                this.setShape.bind(this, this.shape, false),
                            );
                        }
                    }
                    break;
            }
        }

    },
}

const useVextNoteSettings = defineStore("vext-note-settings", vextNoteSettingsStore);

export { useVextNoteSettings, vextNoteSettingsStore }