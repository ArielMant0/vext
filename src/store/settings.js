import { defineStore } from "pinia"
import { useVextHistory } from "./history";
import EventHandler from "@/use/event-handler";
import { ACTIONS } from "@/use/enums";

const EVENTS = new EventHandler();

const vextSettingsStore = {

    state: () => {
        return {

            pointerMenu: false,
            onAction: true,
            onGesture: true,
            closeOnClick: true,

            historyLimit: 50,

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
                "#bab0ab"
            ],
        };
    },

    getters: {
        color: state => state.activeColor === 0 ? state.color0 : state.color1,
    },

    actions: {

        emit(name, data) {
            EVENTS.emit(name, data);
        },

        on(name, handler) {
            return EVENTS.on(name, handler);
        },

        off(name, handler) {
            return EVENTS.off(name, handler);
        },

        defaultColorAt(index) {
            return this.defaultColors[index % this.defaultColors.length]
        },

        setHistoryLimit(limit) {
            const history = useVextHistory();
            history.limit = Math.max(1, Math.floor(limit));
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
            this.brushSize = newVal;
            this.emit(ACTIONS.BRUSH_SIZE, newVal);
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
            this.brushDecimation = newVal;
            this.emit(ACTIONS.BRUSH_DECIMATE, newVal);
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
            EVENTS.emit(ACTIONS.COLOR_CHANGE, newColor);
        },

        setColor(color, record=true) {
            if (this.activeColor === 0) {
                this.setColorPrimary(color, record);
            } else {
                this.setColorSecondary(color, record);
            }
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
                EVENTS.emit(ACTIONS.COLOR_VALUE, color);
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
                EVENTS.emit(ACTIONS.COLOR_VALUE, color);
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

const useVextSettings = defineStore("vext-settings", vextSettingsStore);

export { useVextSettings, vextSettingsStore }